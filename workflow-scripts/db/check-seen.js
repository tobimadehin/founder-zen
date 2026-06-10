const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const items = $input.all();
if (!items.length) return [{ json: { seen_ids: [] } }];

const threadIds = items.map(i => i.json.thread_id).filter(Boolean);
if (!threadIds.length) return [{ json: { seen_ids: [] } }];

const placeholders = threadIds.map(() => '?').join(',');
const { rows } = await dbQuery(
  `SELECT thread_id FROM reddit_seen WHERE thread_id IN (${placeholders})`,
  threadIds
);
const seen_ids = (rows || []).map(r => r.thread_id);
return [{ json: { seen_ids } }];
