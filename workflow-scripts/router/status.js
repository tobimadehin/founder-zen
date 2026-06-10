const http = require('http');
const dbQuery = (sql, params = []) => new Promise((res, rej) => {
  const b = JSON.stringify({ sql, params });
  http.request({ hostname: 'trafilatura', port: 8081, path: '/db/query', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
    r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); })
  .on('error', rej).end(b);
});

const chatId = $input.first().json.chat_id;
const rows = await dbQuery(
  "SELECT endpoint_name, severity, first_seen_at, acked FROM incidents WHERE status = 'ongoing' ORDER BY first_seen_at ASC"
);
const incidents = rows.results || [];

let text;
if (incidents.length === 0) {
  text = '✅ All systems operational';
} else {
  const now = Math.floor(Date.now() / 1000);
  const lines = incidents.map(i => {
    const dur = Math.round((now - i.first_seen_at) / 60);
    const ack = i.acked ? ' _(acked)_' : '';
    return `🔴 *${i.endpoint_name}* — down ${dur}m${ack}`;
  });
  text = `⚠️ *${incidents.length} active incident${incidents.length > 1 ? 's' : ''}*\n\n${lines.join('\n')}`;
}

return [{ json: { chat_id: chatId, text } }];
