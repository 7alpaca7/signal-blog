import naiwa from '../../../content/resources/naiwa-source.json';
import unwoven from '../../../content/resources/unwoven-source.json';
import source from '../../../content/resources/signal-source.json';

/** 展示阶段的真实资源目录；新增条目在此显式装配，不混入假下载地址。 */
export function createResourceCatalog() {
  const entries = /** @type {import('@/modules/resources/services.js').Resource[]} */ ([
    naiwa,
    unwoven,
    source,
  ]);
  return entries.map((item) => ({
    ...item,
    url: item.url.startsWith('/')
      ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${item.url}`
      : item.url,
    embedUrl: item.embedUrl
      ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${item.embedUrl}`
      : undefined,
  }));
}
