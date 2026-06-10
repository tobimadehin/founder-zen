const now = Math.floor(Date.now() / 1000);
const threads = $('Format Digest').first().json.threads || [];

return threads.map(t => ({
  json: {
    thread_id: t.thread_id || String(t.rank),
    subreddit: t.subreddit,
    title: t.title,
    url: t.url,
    seen_at: now,
  },
}));
