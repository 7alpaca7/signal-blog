import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from '@/app/App.vue';
import { installServices } from '@/app/providers/create-services.js';
import { router } from '@/app/router/index.js';

import '@/shared/styles/tokens.css';
import '@/shared/styles/base.css';

const app = createApp(App);
app.use(createPinia());
installServices(app);
app.use(router);
// 先挂载加载层，再并行等待初始路由；不能让首页懒加载挡在加载反馈之前。
app.mount('#app');
