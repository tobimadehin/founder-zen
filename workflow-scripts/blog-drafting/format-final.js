const draft = JSON.parse($('Pass 2: Full Draft').first().json.choices[0].message.content);
const linkedin = JSON.parse($('Pass 3: LinkedIn Snippet').first().json.choices[0].message.content);
const score = JSON.parse($input.first().json.choices[0].message.content).score;

const sections = draft.sections.map(s => `## ${s.title}\n\n${s.body}`).join('\n\n');
const md = `# ${draft.headline}\n\n${draft.intro_paragraph}\n\n${sections}\n\n## Conclusion\n\n${draft.conclusion}\n\n---\n\n${draft.cta}`;
const flag = score < 8 ? `\n\n⚠️ Quality score: ${score}/10. Review before publishing.` : '';

return [{ json: { md_content: md + flag, linkedin_text: linkedin.linkedin_post, score } }];
