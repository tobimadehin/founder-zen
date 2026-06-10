const https = require('https');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;

const allPosts = $('Load ICP Context').all().map(r => r.json);
const pass1aItems = $input.all();

const callOpenRouter = (post) => new Promise((resolve, reject) => {
  const prompt = `Subreddit: r/${post.subreddit}\nTitle: ${post.title}\nSnippet: ${(post.snippet || '').slice(0, 300)}\n\nScore 1-10 for content quality: Is this a specific, substantive question or discussion (not vague, has actionable context)? Return json: { "thread_id": "${post.thread_id}", "reasoning": "...", "engagement_quality_score": N }`;
  const payload = JSON.stringify({
    model,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
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
      catch (e) { reject(new Error('Invalid JSON: ' + d.slice(0, 200))); }
    });
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

const results = [];
for (const item of pass1aItems) {
  // Extract thread_id from Pass 1A domain score
  const content = JSON.parse(item.json.choices[0].message.content);
  const thread_id = content.thread_id;
  const post = allPosts.find(p => p.thread_id === thread_id) || allPosts[0];
  const apiResult = await callOpenRouter(post);
  results.push({ json: apiResult });
}

return results;
