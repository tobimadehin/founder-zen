const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const topic = ($('Load ICP + Tone').first().json.topic || '').slice(0, 500);
const content = ($('Format Final').first().json.text || '').slice(0, 5000);
const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

await dbQuery(
  "INSERT INTO drafts (id, type, prompt, content, created_at) VALUES (?, 'newsletter', ?, ?, ?)",
  [id, topic, content, Math.floor(Date.now() / 1000)]
);
return [$input.first()];
