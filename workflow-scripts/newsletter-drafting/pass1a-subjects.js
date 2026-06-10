const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;
const { icp, topic } = $input.first().json;

const payload = JSON.stringify({
  model,
  temperature: 1.5,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: `ICP:\n${icp}\n\nTopic: ${topic}\n\nGenerate 3 subject line options with preview text. Return json: { "options": [{ "subject_line": "...", "preview": "...", "reasoning": "..." }] }` }],
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
