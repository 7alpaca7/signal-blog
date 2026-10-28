import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { normalizeArchiveQuery } from '../model/archive-filters.js';

/** URL 是筛选唯一来源；文本搜索 replace，明确分类选择 push。 */
export function useArchiveQuery() {
  const route = useRoute();
  const router = useRouter();
  const query = computed(() => normalizeArchiveQuery(route.query));

  function update(/** @type {Record<string, string>} */ patch, replace = false) {
    const next = { ...route.query, ...patch };
    for (const key of Object.keys(next)) {
      if (!next[key] || (key === 'sort' && next[key] === 'new')) delete next[key];
    }
    return router[replace ? 'replace' : 'push']({ name: 'archive', query: next });
  }

  return { query, update, reset: () => router.push({ name: 'archive' }) };
}
