const https = require('https');
const fs = require('fs');
const apiKey = $env.ZEN_OPENROUTER_KEY;
const model = $env.ZEN_PRIMARY_MODEL;

const draftContent = $('Pass 2: Full Draft').first().json.choices[0].message.content;

let icp = '';
let tone = '';
try { icp = fs.readFileSync('/opt/memory/icp.md', 'utf8'); } catch (e) {}
try { tone = fs.readFileSync('/opt/memory/tone.md', 'utf8'); } catch (e) {}

const criteria = `
ICP:
${icp || 'developers and founders who want simple, transparent deployment'}

Tone guide:
${tone || 'human, direct, no em-dashes, no AI slop'}
`.trim();

const prompt = `You are a strict editor for dployr.io, a deployment platform. Score this blog draft 1-10 against the criteria below.

Scoring rules:
- ICP relevance (0-4 pts): Does it speak directly to Jon (surprise bills), Sarah (non-technical builder), or Marcus (experienced indie hacker)? Does it address their actual pain? Does it recommend competitors as the solution? If it does, cap at 3.
- Tone match (0-3 pts): Does it follow the tone guide? No em-dashes, no AI slop phrases, reads like a human wrote it?
- Completeness (0-3 pts): Clear headline, focused sections, CTA that points toward dployr?

8+ means publish-ready. Be strict. Flag specific problems.

Return json: { "score": N, "flags": ["..."], "reasoning": "..." }

${criteria}

Draft:
${draftContent}`;

const payload = JSON.stringify({
  model,
  temperature: 0,
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: prompt }],
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
