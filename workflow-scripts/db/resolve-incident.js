const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const d = $('Build Resolution').first().json;
await dbQuery(
  "UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?",
  [d.checked_at, d.incident_id]
);
const rows = await dbQuery(
  "SELECT first_seen_at, ack_reason FROM incidents WHERE id = ?",
  [d.incident_id]
);
const { first_seen_at = d.checked_at, ack_reason = null } = rows.results?.[0] ?? {};
return [{ json: { ...d, first_seen_at, ack_reason } }];
