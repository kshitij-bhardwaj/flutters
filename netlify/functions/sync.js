// Uses Netlify Blobs REST API directly — no npm package needed
const https = require('https');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const code = event.queryStringParameters?.code;
  if (!code || !/^[A-Z0-9]{8}$/.test(code)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'Invalid or missing sync code' }),
    };
  }

  // Netlify Blobs REST API credentials — injected automatically at runtime
  const siteId  = process.env.SITE_ID  || process.env.NETLIFY_SITE_ID;
  const token   = process.env.NETLIFY_TOKEN || process.env.TOKEN;

  if (!siteId || !token) {
    // Fallback: if env vars not available, return empty data gracefully
    // (Netlify injects these automatically in deployed functions)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ streak: { count: 0, last: null }, saved: [], _fallback: true }),
    };
  }

  const blobsBase = `api.netlify.com`;
  const blobPath  = `/api/v1/sites/${siteId}/blobs/${encodeURIComponent('flutters-' + code)}?context=production`;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const res = await httpsRequest({
        hostname: blobsBase,
        path: blobPath,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 404) {
        return {
          statusCode: 200,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: { count: 0, last: null }, saved: [] }),
        };
      }

      if (res.status !== 200) throw new Error(`Blobs GET failed: ${res.status}`);

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: res.body,
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: 'Failed to load data', detail: err.message }),
      };
    }
  }

  // ── POST ──────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let incoming;
    try {
      incoming = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    try {
      // Load existing first so we can merge
      let existing = { streak: { count: 0, last: null }, saved: [] };
      const getRes = await httpsRequest({
        hostname: blobsBase,
        path: blobPath,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (getRes.status === 200) {
        try { existing = JSON.parse(getRes.body); } catch {}
      }

      const merged = {
        streak: mergeStreak(existing.streak, incoming.streak),
        saved:  mergeSaved(existing.saved || [], incoming.saved || []),
      };

      const payload = JSON.stringify(merged);

      await httpsRequest({
        hostname: blobsBase,
        path: blobPath,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, payload);

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: 'Failed to save data', detail: err.message }),
      };
    }
  }

  return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
};

function mergeStreak(a, b) {
  a = a || { count: 0, last: null };
  b = b || { count: 0, last: null };
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const aActive   = a.last === today || a.last === yesterday;
  const bActive   = b.last === today || b.last === yesterday;
  if (!aActive && !bActive) return { count: 0, last: null };
  if (!aActive) return b;
  if (!bActive) return a;
  const count = Math.max(a.count || 0, b.count || 0);
  const last  = (a.last === today || b.last === today) ? today : yesterday;
  return { count, last };
}

function mergeSaved(existing, incoming) {
  const seen = new Set();
  const merged = [];
  for (const f of [...incoming, ...existing]) {
    if (!seen.has(f.title)) { seen.add(f.title); merged.push(f); }
  }
  return merged.slice(0, 100);
}
