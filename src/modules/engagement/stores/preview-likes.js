import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 演示点赞只在当前会话有效，以文章 id 隔离；不作为远端总量。 */
export const usePreviewLikes = defineStore('preview-likes', () => {
  const likes = ref(/** @type {Record<string, boolean>} */ ({}));
  return { likes };
});
