import { describe, expect, it } from 'vitest';

import { filterArticles, normalizeArchiveQuery } from './archive-filters.js';

const articles = [
  {
    id: 'a',
    title: '弹簧',
    excerpt: '交互',
    tags: ['Motion'],
    category: '开发',
    publishedAt: '2026-10-28',
  },
  {
    id: 'b',
    title: '像素',
    excerpt: '视觉',
    tags: ['Pixel'],
    category: '设计',
    publishedAt: '2025-10-28',
  },
  {
    id: 'c',
    title: 'Motion Tokens',
    excerpt: '节奏',
    tags: ['Motion'],
    category: '设计',
    publishedAt: '2026-09-01',
  },
];

describe('归档筛选', () => {
  it('规范化不可信 query，不把数组当作关键词', () => {
    expect(normalizeArchiveQuery({ q: ['x'], sort: 'invalid', year: 'abc' })).toEqual({
      keyword: '',
      category: '',
      tag: '',
      year: '',
      sort: 'new',
    });
  });
  it('组合关键词、分类、标签与年份', () => {
    const query = normalizeArchiveQuery({
      q: 'motion',
      category: '设计',
      tag: 'Motion',
      year: '2026',
    });
    expect(filterArticles(articles, query).map((article) => article.id)).toEqual(['c']);
  });
  it('排序不改变原数据，空结果不回退全部', () => {
    const original = articles.map((article) => article.id);
    expect(filterArticles(articles, normalizeArchiveQuery({ sort: 'old' }))[0].id).toBe('b');
    expect(articles.map((article) => article.id)).toEqual(original);
    expect(filterArticles(articles, normalizeArchiveQuery({ q: 'missing' }))).toEqual([]);
  });
});

it('同日按完整发布时间倒序，时区按实际时刻比较，最早排序反向且不改变原数组', () => {
  const entries = [
    {
      ...articles[0],
      id: 'early',
      slug: 'a',
      publishedAt: '2026-11-01',
      publishedTimestamp: '2026-11-01T09:00:00+08:00',
    },
    {
      ...articles[0],
      id: 'late',
      slug: 'z',
      publishedAt: '2026-11-01',
      publishedTimestamp: '2026-11-01T10:00:00+08:00',
    },
    {
      ...articles[0],
      id: 'middle',
      slug: 'm',
      publishedAt: '2026-11-01',
      publishedTimestamp: '2026-11-01T01:30:00Z',
    },
  ];
  expect(filterArticles(entries, normalizeArchiveQuery({})).map((item) => item.id)).toEqual([
    'late',
    'middle',
    'early',
  ]);
  expect(
    filterArticles(entries, normalizeArchiveQuery({ sort: 'old' })).map((item) => item.id),
  ).toEqual(['early', 'middle', 'late']);
  expect(entries.map((item) => item.id)).toEqual(['early', 'late', 'middle']);
});
