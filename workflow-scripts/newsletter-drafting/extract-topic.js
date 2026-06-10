const body = $input.first().json.body || $input.first().json;
const text = body?.message?.text || body?.prompt || '';

return [{ json: { topic: text.replace(/^\/draft\s+newsletter\s*/i, '').trim() } }];
