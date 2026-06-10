const domainItems = $('Pass 1A: Domain Relevance').all()
  .map(r => JSON.parse(r.json.choices[0].message.content));
const engItems = $('Pass 1B: Engagement Score').all()
  .map(r => JSON.parse(r.json.choices[0].message.content));
const posts = $('Load ICP Context').all().map(r => r.json);

const ranked = posts
  .map(post => {
    const d = domainItems.find(x => x.thread_id === post.thread_id) || {};
    const e = engItems.find(x => x.thread_id === post.thread_id) || {};
    return {
      ...post,
      domain_score: d.domain_relevance_score || 0,
      engagement_score: e.engagement_quality_score || 0,
      combined: (d.domain_relevance_score || 0) * 0.6 + (e.engagement_quality_score || 0) * 0.4,
    };
  })
  .filter(p => p.domain_score >= 5 && p.engagement_score >= 3)
  .sort((a, b) => b.combined - a.combined)
  .slice(0, 10);

return [{ json: { threads: ranked, total_scanned: posts.length, total_qualified: ranked.length } }];
