import { onScopeDispose } from 'vue';
import { useRouter } from 'vue-router';

import { useArticleRepository } from '@/modules/articles/services.js';

import { pageLoaders } from './routes.js';

/**
 * 鼠标/键盘聚焦链接时并行预取目标页面和正文，不在首屏预载所有文章。
 * 动态 import 复用浏览器模块缓存；低流量模式跳过。失败仅取消预取缓存，真实导航仍可重试。
 */
export function useRoutePrefetch() {
  const router = useRouter();
  const articles = useArticleRepository();
  const requested = new Set(/** @type {string[]} */ ([]));
  const controller = new AbortController();
  function request(/** @type {string} */ key, /** @type {() => Promise<unknown>} */ load) {
    if (requested.has(key) || requested.size >= 100) return;
    requested.add(key);
    void load().catch(() => {
      // 推测性加载不展示业务错误；删除标记，后续真实请求按原有错误/重试路径处理。
      requested.delete(key);
    });
  }
  function prefetch(/** @type {Event} */ event) {
    const connection = /** @type {{connection?: {saveData?: boolean, effectiveType?: string}}} */ (
      navigator
    ).connection;
    if (connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType ?? '')) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a');
    if (
      !(link instanceof HTMLAnchorElement) ||
      link.target === '_blank' ||
      link.hasAttribute('download')
    )
      return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    const base = import.meta.env.BASE_URL;
    if (!url.pathname.startsWith(base)) return;
    const route = router.resolve(`${url.pathname.slice(base.length - 1)}${url.search}${url.hash}`);
    if (route.path === router.currentRoute.value.path) return;
    const name = /** @type {keyof typeof pageLoaders} */ (String(route.name));
    const loadPage = Object.hasOwn(pageLoaders, name) ? pageLoaders[name] : null;
    if (!loadPage || name === 'not-found') return;
    request(`page:${name}`, loadPage);
    if (name === 'article' && typeof route.params.slug === 'string') {
      const slug = route.params.slug;
      request(`article:${slug}`, () => articles.getBySlug(slug, { signal: controller.signal }));
    }
  }
  onScopeDispose(() => controller.abort());
  return prefetch;
}
