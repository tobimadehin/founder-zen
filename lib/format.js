/**
 * @param {number} score
 * @returns {string}
 */
function qualityFlag(score) {
  return score < 8 ? `\n\n⚠️ Quality score: ${score}/10. Review before publishing.` : '';
}

/**
 * @param {{ headline: string, intro_paragraph: string, sections: { title: string, body: string }[], conclusion: string, cta: string }} draft
 * @returns {string} markdown
 */
function formatBlogDraft(draft) {
  const sections = draft.sections.map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');
  return `# ${draft.headline}\n\n${draft.intro_paragraph}\n\n${sections}\n\n## Conclusion\n\n${draft.conclusion}\n\n---\n\n${draft.cta}`;
}

/**
 * @param {{ subject_line: string, preview: string, opening_paragraph: string, body_sections: { title: string, body: string }[], cta: string, signature: string }} email
 * @returns {string}
 */
function formatNewsletter(email) {
  const sections = email.body_sections.map((s) => `**${s.title}**\n\n${s.body}`).join('\n\n');
  return [
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
}

module.exports = { qualityFlag, formatBlogDraft, formatNewsletter };
