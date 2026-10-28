import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

import { contentPlugin } from './scripts/content/content-plugin.js';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // 演示构建必须明确 opt-in，防止未来发布时误将样例当成正式内容。
  if (command === 'build' && env.VITE_ALLOW_DEMO_BUILD !== 'true') {
    throw new Error('当前仅提供演示数据。预览构建请使用 npm run build -- --mode demo。');
  }

  return {
    plugins: [vue(), contentPlugin()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { port: 5173, strictPort: true },
    preview: { port: 4173, strictPort: true },
  };
});
