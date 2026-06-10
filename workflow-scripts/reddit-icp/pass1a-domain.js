const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;

const posts = $input.all().map(r => r.json);

const callOpenRouter = (post) => new Promise((resolve, reject) => {
  const prompt = `ICP:\n${post.icp || ''}\n\nTitle: ${post.title}\nSnippet: ${(post.snippet || '').slice(0, 300)}\n\nScore 1-10: does this address our ICP's pain? Return json: { "thread_id": "${post.thread_id}", "reasoning": "...", "domain_relevance_score": N }`;
  const payload = JSON.stringify({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
  const req = https.request({
    hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  }, res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('Invalid JSON: ' + d.slice(0, 200))); } });
  });
  req.setTimeout(30000, () => { req.destroy(); reject(new Error('OpenRouter timeout')); });
  req.on('error', reject);
  req.write(payload); req.end();
});

const results = [];
for (const post of posts) {
  const apiResult = await callOpenRouter(post);
  results.push({ json: apiResult });
}
return results;
