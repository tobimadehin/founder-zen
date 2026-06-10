'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterByKeywords, excludeSeen, mergeAndRankScores, formatDigest } = require('../lib/reddit');

const POSTS = [
  { id: 'a1', title: 'How we migrated to kubernetes', selftext: 'Long post about k8s', permalink: '/r/devops/comments/a1', ups: 200, num_comments: 45 },
  { id: 'b2', title: 'Weekend project: built a cat feeder', selftext: 'Arduino project', permalink: '/r/selfhosted/comments/b2', ups: 50, num_comments: 10 },
  { id: 'c3', title: 'Docker deployment pipeline tips', selftext: 'CI/CD best practices', permalink: '/r/devops/comments/c3', ups: 300, num_comments: 80 },
];

test('filterByKeywords: returns posts matching any keyword', () => {
  const result = filterByKeywords(POSTS, ['kubernetes', 'docker'], 'devops');
  assert.equal(result.length, 2);
  assert.ok(result.every(p => p.subreddit === 'devops'));
});

test('filterByKeywords: excludes non-matching posts', () => {
  const result = filterByKeywords(POSTS, ['kubernetes', 'docker'], 'selfhosted');
  assert.ok(result.every(p => p.thread_id !== 'b2'));
});

test('filterByKeywords: attaches subreddit and formats url', () => {
  const [post] = filterByKeywords([POSTS[0]], ['kubernetes'], 'devops');
  assert.equal(post.subreddit, 'devops');
  assert.ok(post.url.startsWith('https://reddit.com'));
});

test('excludeSeen: removes already-seen thread_ids', () => {
  const posts = [{ thread_id: 'a1' }, { thread_id: 'b2' }, { thread_id: 'c3' }];
  const result = excludeSeen(posts, ['a1', 'c3']);
  assert.equal(result.length, 1);
  assert.equal(result[0].thread_id, 'b2');
});

test('excludeSeen: returns all when seenIds is empty', () => {
  const posts = [{ thread_id: 'a1' }, { thread_id: 'b2' }];
  assert.equal(excludeSeen(posts, []).length, 2);
});

test('mergeAndRankScores: filters out low domain score', () => {
  const posts = [{ thread_id: 'a1' }, { thread_id: 'b2' }];
  const domain = [{ thread_id: 'a1', domain_relevance_score: 8 }, { thread_id: 'b2', domain_relevance_score: 4 }];
  const eng = [{ thread_id: 'a1', engagement_quality_score: 7 }, { thread_id: 'b2', engagement_quality_score: 7 }];
  const result = mergeAndRankScores(posts, domain, eng);
  assert.equal(result.length, 1);
  assert.equal(result[0].thread_id, 'a1');
});

test('mergeAndRankScores: sorts by combined score descending', () => {
  const posts = [{ thread_id: 'a1' }, { thread_id: 'b2' }];
  const domain = [{ thread_id: 'a1', domain_relevance_score: 7 }, { thread_id: 'b2', domain_relevance_score: 9 }];
  const eng = [{ thread_id: 'a1', engagement_quality_score: 6 }, { thread_id: 'b2', engagement_quality_score: 8 }];
  const result = mergeAndRankScores(posts, domain, eng);
  assert.equal(result[0].thread_id, 'b2');
});

test('formatDigest: returns fallback string when no threads', () => {
  const text = formatDigest({ threads: [], total_scanned: 10, total_qualified: 0 });
  assert.ok(text.includes('No new'));
});

test('formatDigest: includes thread titles and subreddits', () => {
  const digest = {
    digest_date: '2026-05-30',
    total_scanned: 20,
    total_qualified: 2,
    threads: [
      { title: 'K8s tips', url: 'https://reddit.com/r/devops/1', subreddit: 'devops', why_this_matters: 'Relevant to ICP' },
    ],
  };
  const text = formatDigest(digest);
  assert.ok(text.includes('K8s tips'));
  assert.ok(text.includes('devops'));
  assert.ok(text.includes('Relevant to ICP'));
});
