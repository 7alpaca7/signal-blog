import { defineStore } from 'pinia';
import { computed, onScopeDispose, ref, watch } from 'vue';

import { readPreference, writePreference } from '@/shared/services/storage.js';

/** 系统减少动态效果优先；全站共享同一个开关和监听器。 */
export const useMotionPreference = defineStore('motion-preference', () => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = ref(media.matches);
  const enabled = ref(readPreference('signal.motion', true));
  const active = computed(() => enabled.value && !reduced.value);
  const change = () => {
    reduced.value = media.matches;
  };
  media.addEventListener('change', change);
  watch(enabled, (value) => writePreference('signal.motion', value));
  onScopeDispose(() => media.removeEventListener('change', change));
  return {
    enabled,
    reduced,
    active,
    toggle: () => {
      enabled.value = !enabled.value;
    },
  };
});
