const https = require('https');

const { subreddit } = $input.first().json;

const xml = await new Promise((resolve, reject) => {
  const req = https.get({
    hostname: 'www.reddit.com',
    path: `/r/${subreddit}/new/.rss?limit=25`,
    headers: { 'User-Agent': 'founder-zen/1.0 (personal research bot)' },
  }, res => {
    if (res.statusCode === 429) {
      req.destroy();
      return resolve('');
    }
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => resolve(d));
  });

  req.setTimeout(15000, () => { req.destroy(); resolve(''); });
  req.on('error', () => resolve(''));
});

return [{ json: { ...($input.first().json), rss: xml } }];
