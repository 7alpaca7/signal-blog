import { createRouter, createWebHistory } from 'vue-router';

import { routes } from './routes.js';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    // 分类、话题、搜索和排序只修改 query，保留当前位置；文章目录的新 hash 仍正常定位。
    if (to.path === from.path && to.hash === from.hash) return false;
    if (to.hash) return { el: to.hash, top: 110 };
    return { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = `${to.meta.title || '记录与实验'} · SIGNAL`;
});
