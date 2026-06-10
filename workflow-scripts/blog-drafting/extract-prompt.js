const body = $input.first().json.body || $input.first().json;
const text = body?.message?.text || body?.prompt || '';

return [{ json: { prompt: text.replace(/^\/draft\s+blog\s*/i, '').trim() } }];
