const RECOVERY_KEY = 'signal:navigation-recovery';
const RETRY_WINDOW_MS = 30_000;

/**
 * 部署会替换带哈希的页面文件，旧标签页的动态 import 可能失效。
 * 只在真实导航失败时重进目标地址；预取失败不打断阅读，同一目标短时间不重复刷新。
 * @param {import('vue-router').Router} router
 * @returns {() => void} 移除错误监听。
 */
export function installNavigationRecovery(router) {
  return router.onError((error, to) => {
    if (
      !/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
        error.message,
      )
    ) {
      return;
    }
    const href = router.resolve(to).href;
    try {
      const previous = JSON.parse(sessionStorage.getItem(RECOVERY_KEY) || 'null');
      if (previous?.href === href && Date.now() - previous.at < RETRY_WINDOW_MS) return;
      sessionStorage.setItem(RECOVERY_KEY, JSON.stringify({ href, at: Date.now() }));
    } catch {
      // 存储不可用时不自动重载，避免无法记录次数造成循环。
      return;
    }
    window.location.assign(href);
  });
}
