const https = require('https');
const http = require('http');

const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const d = $input.first().json;
const duration = Math.round((d.checked_at - d.first_seen_at) / 60);

const rootCause = d.ack_reason || 'unknown';
const prompt = `Write a concise incident postmortem (3-4 sentences) for a founder to read.

Service: ${d.endpoint_name || d.incident_id}
Duration: ~${duration} minutes
Root cause: ${rootCause}

Cover what happened, user impact, and one specific prevention action. Be direct. No filler. No em dashes.`;

const body = JSON.stringify({
  model: $env.ZEN_PRIMARY_MODEL,
  messages: [
    {
      role: 'system',
      content: 'You write incident postmortems for a solo founder. Write like a person, not a corporate report. Short sentences. No em dashes. No buzzwords. No filler phrases like "it\'s worth noting" or "in conclusion". Just say what happened.',
    },
    { role: 'user', content: prompt },
  ],
  max_tokens: 200,
});

const postmortem = await new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${$env.ZEN_OPENROUTER_KEY}`,
      'Content-Length': Buffer.byteLength(body),
    },
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try { resolve(JSON.parse(data).choices?.[0]?.message?.content || ''); }
      catch (e) { reject(e); }
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

await dbQuery("UPDATE incidents SET postmortem = ? WHERE id = ?", [postmortem, d.incident_id]);
return [{ json: { ...d, postmortem } }];
