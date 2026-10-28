import { inject } from 'vue';

/** @type {import('vue').InjectionKey<import('../model/activity-contracts.js').ActivityRepository>} */
export const ACTIVITY_REPOSITORY = Symbol('activity-repository');

/** 服务由应用装配，模块不直接读取演示数据。 */
export function useActivityRepository() {
  const repository = inject(ACTIVITY_REPOSITORY);
  if (!repository) throw new Error('文档活动服务未装配。');
  return repository;
}
