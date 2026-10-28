import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { contentPlugin } from './content-plugin.js';

const source = `---
title: 测试
excerpt: 内容索引测试
category: 开发
tags: []
publishedAt: "2026-10-28T10:00:00+08:00"
---
## 正文

这是独立加载的正文。
`;
let root;
let directory;
let plugin;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'signal-content-'));
  directory = path.join(root, 'content/posts');
  fs.mkdirSync(directory, { recursive: true });
  plugin = contentPlugin();
  plugin.configResolved({ root });
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe('内容索引与详情拆包', () => {
  it('识别新增、修改、删除与草稿，摘要不携带正文', () => {
    const file = path.join(directory, 'note.md');
    fs.writeFileSync(file, source);
    const index = plugin.load('\0virtual:blog-content');
    expect(index).toContain('note');
    expect(index).not.toContain('这是独立加载的正文');
    expect(plugin.load('\0virtual:blog-post/note')).toContain('这是独立加载的正文');
    fs.writeFileSync(file, source.replace('title: 测试', 'title: 新标题'));
    expect(plugin.load('\0virtual:blog-content')).toContain('新标题');
    fs.writeFileSync(file, source.replace('title: 测试', 'title: 测试\ndraft: true'));
    expect(plugin.load('\0virtual:blog-content')).not.toContain('note');
    expect(() => plugin.load('\0virtual:blog-post/note')).toThrow('文章不存在');
    fs.unlinkSync(file);
    expect(plugin.load('\0virtual:blog-content')).not.toContain('note');
  });
  it('重复 slug 和不合法文件给出构建错误', () => {
    fs.writeFileSync(
      path.join(directory, 'a.md'),
      source.replace('title: 测试', 'title: 测试\nslug: same'),
    );
    fs.writeFileSync(
      path.join(directory, 'b.md'),
      source.replace('title: 测试', 'title: 测试\nslug: same'),
    );
    expect(() => plugin.load('\0virtual:blog-content')).toThrow('slug 重复');
    fs.writeFileSync(path.join(directory, 'b.md'), 'invalid');
    expect(() => plugin.load('\0virtual:blog-content')).toThrow('b.md');
  });
});
