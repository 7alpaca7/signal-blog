import { describe, expect, it } from 'vitest';

import { getBoundaryError } from './eslint-architecture.js';

describe('模块依赖边界', () => {
  it('拒绝公共能力反向依赖页面', () => {
    expect(getBoundaryError('shared/ui/Button.vue', 'pages/home/HomePage.vue')).toBeTruthy();
  });
  it('拒绝跨模块深层引用与页面直接读取演示数据', () => {
    expect(
      getBoundaryError('modules/reader/index.js', 'modules/articles/model/private.js'),
    ).toBeTruthy();
    expect(
      getBoundaryError('pages/home/HomePage.vue', 'data/mock/article-adapter.js'),
    ).toBeTruthy();
  });
  it('同名页面和动态装配入口不能绕过模块边界', () => {
    expect(
      getBoundaryError('pages/articles/ArticlePage.vue', 'modules/articles/model/private.js'),
    ).toBeTruthy();
    expect(getBoundaryError('main.js', 'data/mock/article-adapter.js')).toBeTruthy();
  });
  it('允许应用服务装配与模块公开入口', () => {
    expect(
      getBoundaryError('app/providers/create-services.js', 'data/mock/article-adapter.js'),
    ).toBeNull();
    expect(getBoundaryError('pages/home/HomePage.vue', 'modules/articles/index.js')).toBeNull();
    expect(
      getBoundaryError('app/providers/create-services.js', 'modules/articles/services.js'),
    ).toBeNull();
  });
});
