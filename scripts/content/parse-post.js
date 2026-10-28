import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { parse } from 'yaml';

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: false });

/** 验证带时区时间，避免构建机器时区改变文章发布日。 */
function timestamp(value, field) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw new Error(`${field} 必须使用带时区的 ISO 时间。`);
  }
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${field} 不是有效时间。`);
  return value;
}

/**
 * 构建边界：解析文章、校验元信息并生成安全 HTML；错误由插件补充文件路径。
 * @param {string} source Markdown 原文。
 * @param {string} filename 文件名（默认作为稳定 slug）。
 */
export function parsePost(source, filename) {
  const match = source
    .replace(/^\uFEFF/, '')
    .match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('缺少 YAML frontmatter。');
  const meta = parse(match[1]);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta))
    throw new Error('文章头必须是对象。');
  for (const key of ['title', 'excerpt', 'category']) {
    if (typeof meta[key] !== 'string' || !meta[key].trim()) throw new Error(`缺少 ${key}。`);
  }
  const slug = meta.slug ?? filename.replace(/\.md$/, '');
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error('slug 必须为小写英文、数字和短横线。');
  if (!Array.isArray(meta.tags) || meta.tags.some((tag) => typeof tag !== 'string' || !tag.trim()))
    throw new Error('tags 必须是字符串数组。');
  const publishedAt = timestamp(meta.publishedAt, 'publishedAt');
  const revisions = meta.revisions ?? [];
  if (!Array.isArray(revisions)) throw new Error('revisions 必须是数组。');
  const changes = revisions.map((revision) => {
    if (!revision || typeof revision.summary !== 'string' || !revision.summary.trim())
      throw new Error('每条修订需要 summary。');
    const at = timestamp(revision.at, 'revisions.at');
    if (Date.parse(at) < Date.parse(publishedAt)) throw new Error('修订不能早于发布时间。');
    return { at, summary: revision.summary };
  });
  if (new Set(changes.map((change) => change.at)).size !== changes.length)
    throw new Error('修订时间不能重复。');
  if (meta.draft !== undefined && typeof meta.draft !== 'boolean')
    throw new Error('draft 必须为布尔值。');
  if (
    meta.readingMinutes !== undefined &&
    (!Number.isInteger(meta.readingMinutes) || meta.readingMinutes < 1)
  )
    throw new Error('readingMinutes 必须为正整数。');
  const tokens = markdown.parse(match[2], {});
  const sections = [];
  const used = new Set();
  // 标题自定义 {#anchor} 可在改文案时保留旧链接；重复标题自动加后缀。
  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open' || !['h2', 'h3'].includes(token.tag)) return;
    const inline = tokens[index + 1];
    const explicit = inline.content.match(/\s*\{#([a-zA-Z][\w-]*)\}$/);
    if (explicit) {
      inline.content = inline.content.slice(0, explicit.index).trim();
      inline.children = markdown.parseInline(inline.content, {})[0].children;
    }
    const title =
      inline.children
        ?.filter((child) => child.type === 'text' || child.type === 'code_inline')
        .map((child) => child.content)
        .join('') || inline.content;
    const base =
      explicit?.[1] ||
      title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') ||
      'section';
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    token.attrSet('id', id);
    sections.push({ id, title, paragraphs: [] });
  });
  const html = sanitizeHtml(markdown.renderer.render(tokens, markdown.options, {}), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      h2: ['id'],
      h3: ['id'],
      code: ['class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
  });
  const article = {
    id: slug,
    slug,
    title: meta.title,
    excerpt: meta.excerpt,
    category: meta.category,
    tags: meta.tags,
    publishedAt: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(
      new Date(publishedAt),
    ),
    readingMinutes: meta.readingMinutes ?? Math.max(1, Math.ceil(match[2].length / 400)),
    sections,
    html,
  };
  const activity = [
    { at: publishedAt, summary: '发布文章', action: 'created' },
    ...changes.map((change) => ({ ...change, action: 'updated' })),
  ].map((change) => ({
    id: `${slug}:${change.at}:${change.action}`,
    articleId: slug,
    articleSlug: slug,
    documentTitle: meta.title,
    occurredAt: change.at,
    summary: change.summary,
    action: change.action,
  }));
  return { article, activity, draft: meta.draft === true };
}
