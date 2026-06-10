const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;

const { threads, total_scanned, total_qualified } = $input.first().json;

const prompt = `Write a 1-sentence "why this matters" for each thread below from the perspective of a developer evaluating deployment platforms. Return json: { "digest_date": "today", "threads": [{ "rank": N, "title": "...", "url": "...", "subreddit": "...", "combined_score": N, "why_this_matters": "..." }], "total_scanned": ${total_scanned}, "total_qualified": ${total_qualified} }\n\nThreads:\n${JSON.stringify(threads, null, 2)}`;

const payload = JSON.stringify({
  model,
  temperature: 1.0,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: prompt }],
});

const result = await new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { resolve(JSON.parse(d)); }
      catch (e) { reject(new Error('Invalid JSON: ' + d.slice(0, 300))); }
    });
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

return [{ json: result }];
