const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

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

  const store = getStore('flutters-users');

  // ── GET — load user data ──────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get(code);
      if (!raw) {
        // First time — return empty defaults
        return {
          statusCode: 200,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: { count: 0, last: null }, saved: [] }),
        };
      }
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: raw,
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: 'Failed to load data', detail: err.message }),
      };
    }
  }

  // ── POST — save user data ─────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let incoming;
    try {
      incoming = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    try {
      // Load existing data first so we can MERGE saved facts (union by title)
      let existing = { streak: { count: 0, last: null }, saved: [] };
      const raw = await store.get(code);
      if (raw) existing = JSON.parse(raw);

      // Merge streak — take whichever has higher count, prefer most recent last date
      const mergedStreak = mergeStreak(existing.streak, incoming.streak);

      // Merge saved facts — union by title, keep order (newest first from incoming)
      const mergedSaved = mergeSaved(existing.saved || [], incoming.saved || []);

      const merged = { streak: mergedStreak, saved: mergedSaved };
      await store.set(code, JSON.stringify(merged));

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

// Merge two streak objects — pick higher count, but reset if last was too long ago
function mergeStreak(a, b) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Validate both streaks are still active
  const aActive = a.last === today || a.last === yesterday;
  const bActive = b.last === today || b.last === yesterday;

  if (!aActive && !bActive) return { count: 0, last: null };
  if (!aActive) return b;
  if (!bActive) return a;

  // Both active — take the higher count, most recent last date
  const count = Math.max(a.count || 0, b.count || 0);
  const last = a.last === today ? today : b.last === today ? today : yesterday;
  return { count, last };
}

// Merge saved fact arrays — union by title, deduplicate
function mergeSaved(existing, incoming) {
  const seen = new Set();
  const merged = [];
  // Incoming first (newer device's saves take priority in ordering)
  for (const f of [...incoming, ...existing]) {
    if (!seen.has(f.title)) {
      seen.add(f.title);
      merged.push(f);
    }
  }
  return merged.slice(0, 100); // cap at 100 saved facts
}
