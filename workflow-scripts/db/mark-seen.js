const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const items = $input.all();
if (!items.length) return [];

for (const item of items) {
  const { thread_id, subreddit, title, url, seen_at } = item.json;
  await dbQuery(
    'INSERT OR IGNORE INTO reddit_seen (thread_id, subreddit, title, url, seen_at) VALUES (?, ?, ?, ?, ?)',
    [thread_id, subreddit, (title || '').slice(0, 500), url, seen_at]
  );
}
return [{ json: { marked: items.length } }];
