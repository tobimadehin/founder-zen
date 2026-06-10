const digest = JSON.parse($input.first().json.choices[0].message.content);
const threads = digest.threads || [];

const text = threads.length === 0
  ? 'No new ICP-relevant threads today.'
  : [
      `*Reddit ICP Digest — ${digest.digest_date}*`,
      `Scanned: ${digest.total_scanned} | Qualified: ${digest.total_qualified}`,
      '',
      ...threads.map((t, i) => `${i + 1}. [${t.title}](${t.url}) (r/${t.subreddit})\n_${t.why_this_matters}_`),
    ].join('\n');

return [{ json: { text, threads } }];
