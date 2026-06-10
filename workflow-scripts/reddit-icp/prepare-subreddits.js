const item = $input.first().json;
const subreddits = (item.subreddits_csv || 'devops,selfhosted,startups,SaaS').split(',');
const keywords = (item.keywords_csv || 'deployment,docker,kubernetes')
  .split(',')
  .map(k => k.trim().toLowerCase());

return subreddits.map(sub => ({ json: { subreddit: sub.trim(), keywords } }));
