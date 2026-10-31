import { RESOURCE_CATALOG } from '@/modules/resources/services.js';
import { createResourceCatalog } from '@/data/resources/catalog.js';
import { ACTIVITY_REPOSITORY } from '@/modules/activity/services.js';
import { ARTICLE_REPOSITORY } from '@/modules/articles/services.js';

import {
  createMarkdownActivityRepository,
  createMarkdownArticleRepository,
} from '@/data/markdown/content-adapter.js';

/** 当前展示阶段统一从本地 Markdown 装配内容服务，页面无需知道文件读取细节。 */
export function installServices(/** @type {import('vue').App} */ app) {
  app.provide(RESOURCE_CATALOG, createResourceCatalog());
  app.provide(ARTICLE_REPOSITORY, createMarkdownArticleRepository());
  app.provide(ACTIVITY_REPOSITORY, createMarkdownActivityRepository());
}
