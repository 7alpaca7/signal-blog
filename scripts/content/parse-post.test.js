import { describe, expect, it } from 'vitest';

import { parsePost } from './parse-post.js';

const header = `---
title: 测试文章
excerpt: 测试摘要
category: 开发
tags: [Vue, Markdown]
publishedAt: "2026-10-28T09:20:00+08:00"
revisions:
  - at: "2026-10-28T16:10:00+08:00"
    summary: 补充内容
---
`;

describe('Markdown 内容边界', () => {
  it('生成正文、唯一目录以及显式的发布和修订活动', () => {
    const post = parsePost(
      `${header}## 起点 {#start}\n\n正文 **加粗**\n\n## 重复\n\n## 重复\n\n\`\`\`js\nconst x = 1;\n\`\`\``,
      'example.md',
    );
    expect(post.article.slug).toBe('example');
    expect(post.article.sections.map((section) => section.id)).toEqual(['start', '重复', '重复-2']);
    expect(post.article.html).toContain('<strong>加粗</strong>');
    expect(post.article.html).toContain('language-js');
    expect(post.activity.map((entry) => entry.action)).toEqual(['created', 'updated']);
  });
  it('不执行原始 HTML 或危险链接', () => {
    const { article } = parsePost(
      `${header}<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n![bad](data:text/html,hello)`,
      'safe.md',
    );
    expect(article.html).not.toContain('<script>');
    expect(article.html).not.toContain('href="javascript:');
    expect(article.html).not.toContain('src="data:');
  });
  it('无效元信息和早于发布的修订明确失败', () => {
    expect(() => parsePost('没有头信息', 'bad.md')).toThrow('frontmatter');
    expect(() => parsePost(header.replace('tags: [Vue, Markdown]', 'tags: Vue'), 'bad.md')).toThrow(
      'tags',
    );
    expect(() =>
      parsePost(header.replace('2026-10-28T16:10:00+08:00', '2026-10-27T16:10:00+08:00'), 'bad.md'),
    ).toThrow('早于');
    expect(() => parsePost(header.replace('测试文章', '测试文章\ndraft: yes'), 'bad.md')).toThrow(
      'draft',
    );
  });
});

it('构建时渲染公式并为本地图片应用 Pages 前缀和固有尺寸', () => {
  const { article } = parsePost(
    `${header}行内 $y=a(x)x$。\n\n$$\n\\theta=(1-a)|x|\n$$\n\n![配图](/images/example.png)`,
    'math.md',
    {
      base: '/signal-blog/',
      imageSize: () => ({ width: 1200, height: 600 }),
    },
  );
  expect(article.html).toContain('class="katex"');
  expect(article.html).toContain('<math');
  expect(article.html).toContain('src="/signal-blog/images/example.png"');
  expect(article.html).toContain('width="1200"');
  expect(article.html).toContain('height="600"');
  expect(article.html).not.toContain('MATH_');
});
