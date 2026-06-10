const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;

const draftContent = $('Pass 2: Synthesizer').first().json.choices[0].message.content;

const payload = JSON.stringify({
  model,
  temperature: 0,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: `Score this newsletter draft 1-10 on: ICP relevance, completeness, tone match. Be strict - 8+ means send-ready. Return json: { "score": N, "flags": [] }\n\nDraft:\n${draftContent}` }],
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
