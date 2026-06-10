const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const data = $input.first().json;
const prompt = ($('Load ICP + Tone').first().json.prompt || '').slice(0, 500);
const content = (data.md_content || '').slice(0, 5000);
const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

await dbQuery(
  "INSERT INTO drafts (id, type, prompt, content, created_at) VALUES (?, 'blog', ?, ?, ?)",
  [id, prompt, content, Math.floor(Date.now() / 1000)]
);
return [{ json: data }];
