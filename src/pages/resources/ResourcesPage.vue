<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { TreasureChest, useResources } from '@/modules/resources/index.js';
import ChoiceGroup from '@/shared/ui/ChoiceGroup.vue';

const catalog = useResources();
const route = useRoute();
const router = useRouter();
const search = ref('');
const category = computed(() => String(route.query.category || ''));
const options = computed(() => [
  { value: '', label: '全部资源', count: catalog.length },
  ...['软件工具', '系统镜像', '开发资源', '其他文件'].map((value) => ({
    value,
    label: value,
    count: catalog.filter((item) => item.category === value).length,
  })),
]);
const filtered = computed(() =>
  catalog.filter(
    (item) =>
      (!category.value || item.category === category.value) &&
      `${item.name} ${item.description} ${item.platform}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);
const selected = computed(() => catalog.find((item) => item.id === route.params.id));
function selectCategory(/** @type {string} */ value) {
  router.replace({ name: 'resources', query: value ? { category: value } : {} });
}
</script>

<template>
  <div class="page vault-page">
    <section class="vault-hero">
      <div>
        <p class="eyebrow">THE USEFUL COLLECTION / 好东西，收进箱子里</p>
        <h1 class="display-title">RESOURCE<br /><span class="acid">VAULT.</span></h1>
        <p class="intro">工具、镜像与创作材料。<br />把用得上的东西，放在找得到的地方。</p>
        <div class="vault-count">
          <strong>{{ String(catalog.length).padStart(2, '0') }}</strong
          ><span>件已收录资源<br />持续整理中 ↗</span>
        </div>
      </div>
      <TreasureChest />
    </section>
    <template v-if="route.params.id">
      <RouterLink class="text-link" to="/resources">← 返回资源仓库</RouterLink>
      <section v-if="selected" class="resource-detail">
        <p class="eyebrow">{{ selected.category }} / {{ selected.format }}</p>
        <h2>{{ selected.name }}</h2>
        <p>{{ selected.description }}</p>
        <dl>
          <div>
            <dt>版本</dt>
            <dd>{{ selected.version }}</dd>
          </div>
          <div>
            <dt>运行环境</dt>
            <dd>{{ selected.platform }}</dd>
          </div>
          <div>
            <dt>文件大小 / SHA-256</dt>
            <dd>动态源码包，以下载文件为准</dd>
          </div>
        </dl>
        <h3>使用说明</h3>
        <p>{{ selected.instructions }}</p>
        <a class="download" :href="selected.url" target="_blank" rel="noopener noreferrer"
          >前往 GitHub 下载 ZIP ↗</a
        ><a
          class="text-link source-link"
          :href="selected.source"
          target="_blank"
          rel="noopener noreferrer"
          >查看来源与 README ↗</a
        >
        <p class="download-note">下载由 GitHub 提供，打开地址不代表文件已下载完成。</p>
        <h3>相关文章</h3>
        <RouterLink
          v-for="slug in selected.articles"
          :key="slug"
          class="article-link"
          :to="`/articles/${slug}`"
          >{{
            {
              'architecture-and-project-setup': '前端工程搭建',
              'markdown-content-workflow': 'Markdown 内容管理',
              'brand-mascot-and-motion': '品牌角色与动效',
              'performance-and-loading': '性能与资源加载',
            }[slug] || slug
          }}
          ↗</RouterLink
        >
      </section>
      <section v-else class="empty">
        <h2>这个箱格暂时是空的。</h2>
        <p>资源不存在或已移除，请返回资源仓库查看。</p>
      </section>
    </template>
    <div v-else class="vault-layout">
      <aside>
        <p class="eyebrow">BROWSE BY / 资源分类</p>
        <ChoiceGroup
          :model-value="category"
          :options="options"
          label="资源分类"
          @update:model-value="selectCategory"
        />
        <div class="storage-note">
          <span>✦ 关于这个仓库</span>
          <p>只收录真实可用的资源。大型文件通过外部下载渠道提供，使用前请阅读资源说明。</p>
        </div>
      </aside>
      <section aria-label="资源列表">
        <div class="search-row">
          <input
            v-model="search"
            type="search"
            aria-label="搜索资源"
            placeholder="搜索工具、镜像、关键词…"
          /><span>{{ filtered.length }} 件资源</span>
        </div>
        <RouterLink
          v-for="(item, index) in filtered"
          :key="item.id"
          class="resource-card"
          :to="`/resources/${item.id}`"
          ><div class="package-icon" aria-hidden="true">
            ▣<small>{{ item.format }}</small>
          </div>
          <div class="resource-copy">
            <p class="eyebrow">{{ item.category }} · {{ String(index + 1).padStart(2, '0') }}</p>
            <h2>{{ item.name }}</h2>
            <p>{{ item.description }}</p>
            <div class="resource-meta">
              <span>{{ item.version }}</span
              ><span>{{ item.platform }}</span>
            </div>
          </div>
          <span class="card-arrow">↗</span></RouterLink
        >
        <div v-if="!filtered.length" class="empty">
          <span class="empty-icon">◇</span>
          <h2>这里还没有收录。</h2>
          <p>换个关键词，或看看其他分类。</p>
          <button
            type="button"
            @click="
              search = '';
              selectCategory('');
            "
          >
            查看全部资源 ↗
          </button>
        </div>
        <div class="future-slot">
          <span>＋</span>
          <p>下一个好东西，正在路上。<small>软件包 / 系统镜像 / 开发材料</small></p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.vault-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 55px;
  padding-bottom: 55px;
  border-bottom: 1px solid var(--color-line);
  margin-bottom: 45px;
}
.intro {
  color: var(--color-muted);
  line-height: 1.9;
}
.vault-count {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 28px;
}
.vault-count strong {
  font: 38px var(--font-mono);
  color: var(--color-acid);
}
.vault-count span {
  font-size: 11px;
  color: var(--color-muted);
}
.vault-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 55px;
}
aside .eyebrow {
  margin-bottom: 20px;
}
.storage-note {
  margin-top: 35px;
  padding-top: 22px;
  border-top: 1px solid var(--color-line);
  font-size: 12px;
  color: var(--color-muted);
  line-height: 1.9;
}
.storage-note span {
  color: var(--color-acid);
}
.storage-note p {
  margin-top: 12px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 24px;
}
.search-row input {
  min-width: 0;
  flex: 1;
  padding: 14px;
}
.search-row span {
  white-space: nowrap;
  font-size: 11px;
  color: var(--color-muted);
}
.resource-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  border: 1px solid var(--color-line);
  padding: 28px;
  background: var(--color-surface);
  transition:
    border-color var(--motion-hover),
    transform var(--motion-settle);
}
.resource-card:hover {
  border-color: var(--color-acid);
  transform: translateY(-3px);
}
.package-icon {
  color: var(--color-acid);
  font: 45px var(--font-mono);
}
.package-icon small {
  display: block;
  text-align: center;
  font-size: 9px;
}
.resource-copy {
  flex: 1;
  min-width: 0;
}
.resource-copy h2 {
  margin: 12px 0;
  font-size: 23px;
  font-weight: 500;
}
.resource-copy > p:not(.eyebrow) {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.9;
}
.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 10px;
  color: var(--color-muted);
  margin-top: 24px;
}
.resource-meta span {
  border: 1px solid var(--color-line);
  padding: 4px 8px;
}
.card-arrow {
  color: var(--color-acid);
  font-size: 25px;
}
.future-slot {
  margin-top: 18px;
  padding: 24px;
  border: 1px dashed var(--color-line);
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--color-muted);
  font-size: 12px;
}
.future-slot > span {
  font-size: 28px;
}
.future-slot small {
  display: block;
  margin-top: 7px;
  font-size: 10px;
}
.empty {
  padding: 45px 20px;
  text-align: center;
  border: 1px dashed var(--color-line);
}
.empty h2 {
  font-size: 22px;
  margin: 12px 0;
}
.empty p {
  color: var(--color-muted);
  margin-bottom: 20px;
}
.empty-icon {
  color: var(--color-acid);
  font-size: 40px;
}
.resource-detail {
  max-width: 760px;
  margin: 30px auto;
  padding: 35px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  line-height: 1.9;
}
.resource-detail h2 {
  font-size: 30px;
  margin: 15px 0;
}
.resource-detail h3 {
  margin: 25px 0 12px;
  font-size: 17px;
}
.resource-detail p {
  color: var(--color-muted);
}
dl {
  border-block: 1px solid var(--color-line);
  margin: 25px 0;
  padding: 15px 0;
}
dl div {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 7px 0;
  font-size: 12px;
}
dt {
  width: 130px;
  color: var(--color-muted);
}
dd {
  margin: 0;
}
.download {
  display: inline-block;
  margin-top: 25px;
  padding: 12px 22px;
  background: var(--color-acid);
  color: #101211;
}
.source-link {
  display: block;
  margin-top: 16px;
}
.download-note {
  margin-top: 15px;
  font-size: 11px;
}
.article-link {
  display: block;
  color: var(--color-acid);
  font-size: 13px;
  padding: 8px 0;
}
@media (max-width: 800px) {
  .vault-hero {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .vault-layout {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .storage-note {
    display: none;
  }
  .resource-card {
    padding: 20px;
    gap: 15px;
  }
  .resource-detail {
    padding: 22px;
  }
  .resource-copy h2 {
    font-size: 20px;
  }
}
</style>
