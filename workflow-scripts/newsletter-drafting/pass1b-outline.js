const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;
const { tone, topic } = $('Load ICP + Tone').first().json;

const payload = JSON.stringify({
  model,
  temperature: 1.2,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: `Tone:\n${tone}\n\nTopic: ${topic}\n\nBuild newsletter structure. Return json: { "opening_hook": "...", "sections": [{ "title": "...", "talking_points": [] }], "why_this_matters": "..." }` }],
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
