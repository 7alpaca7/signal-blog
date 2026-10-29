import { randomUUID } from 'node:crypto';

import { katex } from '@mdit/plugin-katex';
import MarkdownIt from 'markdown-it';

/**
 * 每篇文章独立保存公式片段，正文净化后再恢复 KaTeX 的受控输出。
 * 原始 HTML 始终关闭，trust:false 禁用公式中的 HTML/外部资源能力；随机占位符防止正文冒充公式输出。
 */
export function createMarkdownRenderer() {
  const fragments = new Map();
  const prefix = `MATH_${randomUUID().replaceAll('-', '')}_`;
  const markdown = new MarkdownIt({ html: false, linkify: true, typographer: false });
  markdown.use(katex, {
    delimiters: 'all',
    trust: false,
    throwOnError: true,
    maxExpand: 1000,
    transformer(html) {
      if (html.includes('katex-error')) throw new Error('公式无法渲染，请检查 LaTeX。');
      const placeholder = `${prefix}${fragments.size}_END`;
      fragments.set(placeholder, html);
      return placeholder;
    },
  });
  return {
    markdown,
    restoreMath(html) {
      for (const [placeholder, fragment] of fragments)
        html = html.replaceAll(placeholder, fragment);
      return html;
    },
  };
}
