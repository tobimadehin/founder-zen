const chatId = $input.first().json.chat_id;

const helpText = [
  '*zen*',
  '',
  '/draft blog [prompt] — draft a blog post',
  '/draft newsletter [topic] — draft a newsletter',
  '/reddit — run Reddit ICP digest',
  '/status — check status page',
  '/ack — acknowledge active incident',
].join('\n');

return [{ json: { chat_id: chatId, text: helpText, parse_mode: 'Markdown' } }];
