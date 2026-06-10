const https = require('https');
const fs = require('fs');

const botToken = $env.ZEN_BOT_TOKEN;
const chatId = $env.ZEN_CHAT_ID;
const { filename, linkedin_text, score } = $input.first().json;

const fileContent = fs.readFileSync(filename);
const basename = filename.split('/').pop();

// Build multipart form data manually
const boundary = '----ZenBoundary' + Date.now().toString(16);
const CRLF = '\r\n';

const parts = [
  `--${boundary}${CRLF}Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}${chatId}`,
  `--${boundary}${CRLF}Content-Disposition: form-data; name="caption"${CRLF}${CRLF}Blog draft${score < 8 ? ` (score ${score}/10 — review before publishing)` : ''}`,
  `--${boundary}${CRLF}Content-Disposition: form-data; name="document"; filename="${basename}"${CRLF}Content-Type: text/markdown${CRLF}${CRLF}`,
];

const header = Buffer.from(parts.join(CRLF) + CRLF);
const footer = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
const body = Buffer.concat([header, fileContent, footer]);

const result = await new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${botToken}/sendDocument`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    },
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { resolve(JSON.parse(d)); }
      catch (e) { reject(new Error('Invalid JSON: ' + d.slice(0, 200))); }
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

if (!result.ok) throw new Error('Telegram sendDocument failed: ' + JSON.stringify(result));

return [{ json: { ...($input.first().json), telegram_message_id: result.result?.message_id } }];
