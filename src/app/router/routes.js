/** 路由与意图预加载复用同一动态 import，避免两套地址清单。 */
export const pageLoaders = {
  home: () => import('@/pages/home/HomePage.vue'),
  archive: () => import('@/pages/archive/ArchivePage.vue'),
  article: () => import('@/pages/article/ArticlePage.vue'),
  'not-found': () => import('@/pages/not-found/NotFoundPage.vue'),
};

export const routes = [
  {
    path: '/',
    name: 'home',
    component: pageLoaders.home,
    meta: { title: '首页' },
  },
  {
    path: '/articles',
    name: 'archive',
    component: pageLoaders.archive,
    meta: { title: '全部记录' },
  },
  {
    path: '/articles/:slug',
    name: 'article',
    component: pageLoaders.article,
    meta: { title: '文章详情' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: pageLoaders['not-found'],
    meta: { title: '页面不存在' },
  },
];
