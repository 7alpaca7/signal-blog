declare module 'virtual:blog-content' {
  export const articles: import('./modules/articles/model/article-contracts.js').Article[];
  export const activity: import('./modules/activity/model/activity-contracts.js').DocumentActivity[];
  export const loaders: Record<
    string,
    () => Promise<{ default: import('./modules/articles/model/article-contracts.js').Article }>
  >;
}
