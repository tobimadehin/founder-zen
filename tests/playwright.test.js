'use strict';
// Unit tests: verify template modules export the right shape without launching a browser.
// Integration tests (PLAYWRIGHT_INTEGRATION=1): actually run templates against example.com.
// Requires playwright installed locally or the playwright Docker container running.

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

describe('template exports', () => {
  test('simple_screenshot exports a single-arg function', () => {
    const fn = require('../playwright-templates/simple_screenshot');
    assert.equal(typeof fn, 'function');
    assert.equal(fn.length, 1);
  });

  test('above_fold exports a single-arg function', () => {
    const fn = require('../playwright-templates/above_fold');
    assert.equal(typeof fn, 'function');
    assert.equal(fn.length, 1);
  });

  test('scroll_to_section exports a single-arg function', () => {
    const fn = require('../playwright-templates/scroll_to_section');
    assert.equal(typeof fn, 'function');
    assert.equal(fn.length, 1);
  });

  test('paginate_and_collect exports a single-arg function', () => {
    const fn = require('../playwright-templates/paginate_and_collect');
    assert.equal(typeof fn, 'function');
    assert.equal(fn.length, 1);
  });
});

// Integration tests — skipped unless PLAYWRIGHT_INTEGRATION=1
const runIntegration = process.env.PLAYWRIGHT_INTEGRATION === '1';

describe('integration', { skip: !runIntegration }, () => {
  test('simple_screenshot returns a base64 string for example.com', async () => {
    const fn = require('../playwright-templates/simple_screenshot');
    const result = await fn({ url: 'https://example.com' });
    assert.equal(typeof result, 'string');
    assert.ok(result.length > 100, 'screenshot should be non-trivial');
    assert.ok(Buffer.from(result, 'base64').length > 0, 'should be valid base64');
  });

  test('above_fold returns a base64 string for example.com', async () => {
    const fn = require('../playwright-templates/above_fold');
    const result = await fn({ url: 'https://example.com' });
    assert.equal(typeof result, 'string');
    assert.ok(result.length > 100);
  });

  test('scroll_to_section returns screenshot and keyword_found flag', async () => {
    const fn = require('../playwright-templates/scroll_to_section');
    const result = await fn({ url: 'https://example.com', section_keywords: ['example', 'domain'] });
    assert.equal(typeof result.screenshot, 'string');
    assert.equal(typeof result.keyword_found, 'boolean');
  });

  test('paginate_and_collect returns pages array', async () => {
    const fn = require('../playwright-templates/paginate_and_collect');
    const result = await fn({ url: 'https://example.com', next_button_selector: '.next', max_pages: 1 });
    assert.ok(Array.isArray(result.pages));
    assert.equal(typeof result.page_count, 'number');
    assert.ok(result.pages[0].length > 0);
  });
});
