import source from '../../../content/resources/signal-source.json';

/** 展示阶段的真实资源目录；新增条目在此显式装配，不混入假下载地址。 */
export function createResourceCatalog() {
  return [source];
}
