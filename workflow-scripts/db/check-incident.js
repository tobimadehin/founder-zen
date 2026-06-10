const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const classify = $input.first().json;
const { rows } = await dbQuery(
  "SELECT id FROM incidents WHERE endpoint_name = ? AND status = 'ongoing' LIMIT 1",
  [classify.endpoint_name]
);
// Always pass one item through so Decide Action always runs
return [{ json: { ...classify, existing_id: rows[0]?.id || null } }];
