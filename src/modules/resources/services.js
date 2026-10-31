import { inject } from 'vue';

/** @typedef {{id:string,name:string,category:string,description:string,version:string,platform:string,format:string,url:string,source:string,instructions:string,articles:string[]}} Resource */
/** @type {import('vue').InjectionKey<Resource[]>} */
export const RESOURCE_CATALOG = Symbol('resource-catalog');

/** 获取由应用装配的资源目录；不在页面读取静态文件或指定存储渠道。 */
export function useResources() {
  const resources = inject(RESOURCE_CATALOG);
  if (!resources) throw new Error('尚未提供资源目录。');
  return resources;
}
