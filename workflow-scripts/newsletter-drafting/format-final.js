const email = JSON.parse($('Pass 2: Synthesizer').first().json.choices[0].message.content);
const score = JSON.parse($input.first().json.choices[0].message.content).score;

const sections = email.body_sections.map(s => `**${s.title}**\n\n${s.body}`).join('\n\n');
const text = [
  `Subject: ${email.subject_line}`,
  `Preview: ${email.preview}`,
  '',
  '---',
  '',
  email.opening_paragraph,
  '',
  sections,
  '',
  email.cta,
  '',
  email.signature,
].join('\n');
const flag = score < 8 ? `\n\n⚠️ Quality score: ${score}/10. Review before publishing.` : '';

return [{ json: { text: text + flag, score, email } }];
