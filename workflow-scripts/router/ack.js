const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const input = $input.first().json;
const chatId = input.chat_id;
const reason = input.text.replace(/^\/ack\s*/i, '').trim();

if (!reason) {
  return [{ json: { chat_id: chatId, text: 'Usage: /ack <reason>\n\nExample: /ack nginx restarted due to OOM' } }];
}

const rows = await dbQuery(
  "SELECT id, endpoint_name FROM incidents WHERE status = 'ongoing' AND acked = 0"
);
const incidents = rows.results || [];

if (incidents.length === 0) {
  return [{ json: { chat_id: chatId, text: 'No unacknowledged incidents.' } }];
}

for (const i of incidents) {
  await dbQuery("UPDATE incidents SET acked = 1, ack_reason = ? WHERE id = ?", [reason, i.id]);
}

const names = incidents.map(i => `*${i.endpoint_name}*`).join(', ');
return [{ json: { chat_id: chatId, text: `Acknowledged ${incidents.length} incident${incidents.length > 1 ? 's' : ''}: ${names}\n\nReason logged: ${reason}` } }];
