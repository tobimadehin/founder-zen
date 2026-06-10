const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;
const { tone, subjects, outline, topic } = $input.first().json;

const payload = JSON.stringify({
  model,
  temperature: 1.2,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: `Tone:\n${tone}\n\nSubject options: ${JSON.stringify(subjects?.options || subjects)}\nOutline: ${JSON.stringify(outline)}\nTopic: ${topic}\n\nSelect the best subject line. Expand into full email copy (250-400 words). Return json: { "subject_line": "...", "preview": "...", "opening_paragraph": "...", "body_sections": [{ "title": "...", "body": "..." }], "cta": "...", "signature": "..." }` }],
});

const result = await new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  }, res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('Invalid JSON: ' + d.slice(0, 200))); } });
  });
  req.on('error', reject); req.write(payload); req.end();
});

return [{ json: result }];
