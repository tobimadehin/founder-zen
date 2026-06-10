const { keywords, subreddit } = $('Prepare Subreddits').first().json;
const xmlStr = $input.first().json?.rss || '';

const entries = xmlStr.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

const posts = entries.map(entry => {
  const get = (tag) => {
    const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim() : '';
  };
  const link = entry.match(/<link[^>]+href="([^"]+)"/)?.[1] || '';
  const idFull = get('id');
  const threadId = (idFull.match(/t3_([a-z0-9]+)/) || link.match(/comments\/([a-z0-9]+)/))?.[1] || idFull;
  return {
    id: threadId,
    title: get('title'),
    selftext: get('content').replace(/<[^>]+>/g, ' ').slice(0, 500),
    permalink: link.replace('https://www.reddit.com', ''),
    ups: 0,
    num_comments: 0,
  };
});

const filtered = posts.filter(p => {
  const hay = `${p.title} ${p.selftext}`.toLowerCase();
  return keywords.some(kw => hay.includes(kw));
}).map(p => ({
  thread_id: p.id,
  subreddit,
  title: p.title,
  url: `https://reddit.com${p.permalink}`,
  snippet: (p.selftext || p.title).slice(0, 200),
  upvotes: p.ups,
  num_comments: p.num_comments,
}));

return filtered.map(p => ({ json: p }));
