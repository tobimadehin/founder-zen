const seenIds = $input.first().json.seen_ids || [];
const posts = $('Filter by Keywords').all().map(r => r.json);

return posts
  .filter(p => !seenIds.includes(p.thread_id))
  .map(p => ({ json: p }));
