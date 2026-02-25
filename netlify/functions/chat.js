const https = require('https');

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'GROQ_API_KEY not set in Netlify environment variables.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  // Translate Anthropic-style request → OpenAI-compatible (Groq uses same format)
  const groqBody = JSON.stringify({
    model: body.model || 'llama-3.3-70b-versatile',
    max_tokens: body.max_tokens || 1000,
    messages: body.messages,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(groqBody),
        'Authorization': `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          // Translate Groq/OpenAI response → Anthropic-style so frontend needs no changes
          const groqData = JSON.parse(data);
          const translated = {
            content: [{ type: 'text', text: groqData.choices?.[0]?.message?.content || '' }]
          };
          resolve({
            statusCode: res.statusCode === 200 ? 200 : res.statusCode,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(res.statusCode === 200 ? translated : groqData),
          });
        } catch (e) {
          resolve({
            statusCode: 502,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to parse Groq response', detail: e.message }),
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to reach Groq API', detail: err.message }),
      });
    });

    req.write(groqBody);
    req.end();
  });
};
