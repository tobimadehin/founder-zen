/**
 * @param {object[]} posts - raw Reddit post data objects
 * @param {string[]} keywords
 * @param {string} subreddit
 */
function filterByKeywords(posts, keywords, subreddit) {
  return posts
    .filter((p) => {
      const haystack = `${p.title} ${p.selftext || ''}`.toLowerCase();
      return keywords.some((kw) => haystack.includes(kw));
    })
    .map((p) => ({
      thread_id: p.id,
      subreddit,
      title: p.title,
      url: `https://reddit.com${p.permalink}`,
      snippet: (p.selftext || p.title).slice(0, 200),
      upvotes: p.ups,
      num_comments: p.num_comments,
    }));
}

/**
 * @param {{ thread_id: string }[]} posts
 * @param {string[]} seenIds
 */
function excludeSeen(posts, seenIds) {
  return posts.filter((p) => !seenIds.includes(p.thread_id));
}

/**
 * @param {object[]} posts
 * @param {{ thread_id: string, domain_relevance_score: number }[]} domainItems
 * @param {{ thread_id: string, engagement_quality_score: number }[]} engItems
 * @returns {object[]} ranked, filtered to domain >= 6 and engagement >= 5
 */
function mergeAndRankScores(posts, domainItems, engItems) {
  return posts
    .map((post) => {
      const d = domainItems.find((x) => x.thread_id === post.thread_id) || {};
      const e = engItems.find((x) => x.thread_id === post.thread_id) || {};
      return {
        ...post,
        domain_score: d.domain_relevance_score || 0,
        engagement_score: e.engagement_quality_score || 0,
        combined: (d.domain_relevance_score || 0) * 0.6 + (e.engagement_quality_score || 0) * 0.4,
      };
    })
    .filter((p) => p.domain_score >= 6 && p.engagement_score >= 5)
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 10);
}

/**
 * @param {{ digest_date: string, threads: object[], total_scanned: number, total_qualified: number }} digest
 * @returns {string}
 */
function formatDigest(digest) {
  const threads = digest.threads || [];
  if (!threads.length) return 'No new ICP-relevant threads today.';
  return [
    `*Reddit ICP Digest — ${digest.digest_date}*`,
    `Scanned: ${digest.total_scanned} | Qualified: ${digest.total_qualified}`,
    '',
    ...threads.map((t, i) => `${i + 1}. [${t.title}](${t.url}) (r/${t.subreddit})\n_${t.why_this_matters}_`),
  ].join('\n');
}

module.exports = { filterByKeywords, excludeSeen, mergeAndRankScores, formatDigest };
