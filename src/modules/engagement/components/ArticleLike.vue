<script setup>
import { computed } from 'vue';

import PixelMascot from '@/shared/brand/PixelMascot.vue';

import { usePreviewLikes } from '../stores/preview-likes.js';

const props = defineProps({ articleId: { type: String, required: true } });
const preview = usePreviewLikes();
const liked = computed(() => !!preview.likes[props.articleId]);
</script>

<template>
  <section class="like-section" aria-label="文章点赞">
    <PixelMascot :mode="liked ? 'sprite' : 'idle'" :interactive="false" />
    <div>
      <h2>{{ liked ? '收到你的赞，喝口雪碧 :)' : '喜欢这篇？给个赞吧。' }}</h2>
      <p>示例互动 · 仅当前会话保留</p>
      <button type="button" :aria-pressed="liked" @click="preview.likes[articleId] = !liked">
        {{ liked ? '♥ 已点赞 1' : '♡ 点赞 0' }}
      </button>
      <p class="reaction-status" role="status">
        {{ liked ? '小黄脸正在喝雪碧。' : '点个赞，请小黄脸喝雪碧。' }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.like-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 30px 0;
  border-top: 1px solid var(--color-line);
  margin-top: 50px;
}
h2 {
  font-size: 18px;
  font-weight: 500;
}
p {
  color: var(--color-muted);
  font-size: 11px;
  margin-top: 10px;
}
button {
  margin-top: 18px;
}
button[aria-pressed='true'] {
  background: var(--color-acid);
  color: var(--color-bg);
}
.reaction-status {
  color: var(--color-acid);
}
@media (max-width: 640px) {
  .like-section :deep(.pixel-mascot) {
    width: 110px;
    height: 110px;
  }
  h2 {
    font-size: 15px;
  }
}
</style>
