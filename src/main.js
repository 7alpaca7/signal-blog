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
await router.isReady();
app.mount('#app');
