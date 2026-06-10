const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const d = $('Build Incident').first().json;
await dbQuery(
  "INSERT INTO incidents (id, title, type, endpoint_name, status, severity, first_seen_at, last_alerted_at, acked) VALUES (?, ?, 'watchdog', ?, 'ongoing', 'critical', ?, ?, 0) ON CONFLICT(id) DO NOTHING",
  [d.id, `${d.endpoint_name} is down`, d.endpoint_name, d.checked_at, d.checked_at]
);
return [{ json: d }];
