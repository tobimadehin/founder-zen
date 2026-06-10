'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { qualityFlag, formatBlogDraft, formatNewsletter } = require('../lib/format');

const DRAFT = {
  headline: 'Why We Rewrote Our Deploy Pipeline',
  intro_paragraph: 'Six months ago we were pushing to prod manually.',
  sections: [
    { title: 'The Problem', body: 'Every deploy was a gamble.' },
    { title: 'The Fix', body: 'We automated everything.' },
  ],
  conclusion: 'Ship faster, break less.',
  cta: 'Try dployr free.',
};

const EMAIL = {
  subject_line: 'Your deploys are slower than they need to be',
  preview: 'Here is what we changed.',
  opening_paragraph: 'We used to deploy once a week.',
  body_sections: [
    { title: 'The old way', body: 'Manual, error-prone, slow.' },
    { title: 'The new way', body: 'Automated, tested, fast.' },
  ],
  cta: 'Read the full post.',
  signature: 'Tobi, dployr',
};

test('qualityFlag: returns empty string for score >= 8', () => {
  assert.equal(qualityFlag(8), '');
  assert.equal(qualityFlag(10), '');
});

test('qualityFlag: returns warning for score < 8', () => {
  const flag = qualityFlag(6);
  assert.ok(flag.includes('6/10'));
  assert.ok(flag.includes('⚠️'));
});

test('formatBlogDraft: includes headline as h1', () => {
  const md = formatBlogDraft(DRAFT);
  assert.ok(md.startsWith('# Why We Rewrote'));
});

test('formatBlogDraft: includes all section titles as h2', () => {
  const md = formatBlogDraft(DRAFT);
  assert.ok(md.includes('## The Problem'));
  assert.ok(md.includes('## The Fix'));
});

test('formatBlogDraft: includes intro, conclusion, and cta', () => {
  const md = formatBlogDraft(DRAFT);
  assert.ok(md.includes('Six months ago'));
  assert.ok(md.includes('Ship faster'));
  assert.ok(md.includes('Try dployr'));
});

test('formatNewsletter: includes subject line', () => {
  const text = formatNewsletter(EMAIL);
  assert.ok(text.includes('Subject: Your deploys are slower'));
});

test('formatNewsletter: includes all body sections', () => {
  const text = formatNewsletter(EMAIL);
  assert.ok(text.includes('The old way'));
  assert.ok(text.includes('The new way'));
});

test('formatNewsletter: includes cta and signature', () => {
  const text = formatNewsletter(EMAIL);
  assert.ok(text.includes('Read the full post'));
  assert.ok(text.includes('Tobi, dployr'));
});
