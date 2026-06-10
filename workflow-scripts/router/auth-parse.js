const body = $input.first().json.body || $input.first().json;
const message = body?.message;
if (!message) return [];

const chatId = String(message?.chat?.id || '');
const allowedId = String($input.first().json.allowed_chat_id || '');
if (allowedId && chatId !== allowedId) return [];

const text = (message?.text || '').trim();
const command = text.split(' ')[0].toLowerCase();
const args = text.slice(command.length).trim();

return [{ json: { command, args, chat_id: chatId, message_id: message.message_id, text } }];
