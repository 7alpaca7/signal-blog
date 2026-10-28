import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { expect, it } from 'vitest';

import { writeStaticEntries } from './static-entries.js';

it('为归档与已发布文章生成子路径入口并保留资源前缀', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'signal-static-'));
  try {
    const html = '<script src="/signal-blog/assets/app.js"></script>';
    fs.writeFileSync(path.join(directory, 'index.html'), html);
    writeStaticEntries(directory, ['first-post']);
    for (const file of ['articles/index.html', 'articles/first-post/index.html', '404.html']) {
      expect(fs.readFileSync(path.join(directory, file), 'utf8')).toBe(html);
    }
    expect(fs.existsSync(path.join(directory, '.nojekyll'))).toBe(true);
    expect(fs.existsSync(path.join(directory, 'articles/draft/index.html'))).toBe(false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
