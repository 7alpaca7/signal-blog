<script setup>
defineProps({ status: { type: String, required: true }, error: { type: String, default: '' } });
defineEmits(['retry']);
</script>

<template>
  <div v-if="status === 'loading'" class="resource-state" role="status">正在读取记录…</div>
  <div v-else-if="status === 'error'" class="resource-state" role="alert">
    <p>{{ error }}</p>
    <button type="button" @click="$emit('retry')">重新读取 ↗</button>
  </div>
</template>

<style scoped>
.resource-state {
  padding: 48px 0;
  color: var(--color-muted);
}
button {
  margin-top: 16px;
}
</style>
