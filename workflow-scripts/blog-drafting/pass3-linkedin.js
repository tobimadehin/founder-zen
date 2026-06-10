const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;
const stored = $('Store Outline').first().json;
const tone = stored.tone;
const headline = stored.outline?.headline || '';
const keyTakeaway = stored.outline?.key_takeaway || '';

const payload = JSON.stringify({
  model,
  temperature: 1.3,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: `Tone:\n${tone}\n\nBlog headline: ${headline}\nKey takeaway: ${keyTakeaway}\n\nWrite a LinkedIn post: hook line, 3-5 short punchy paragraphs, CTA with "[link to full article]". Personal voice, no corporate speak, ends with a question or CTA. Max 1300 chars. Return json: { "linkedin_post": "..." }` }],
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
