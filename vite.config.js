import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
    },
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: false,
      open: true,
      proxy: {
        // Anthropic API proxy
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: () => '/v1/messages',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', env.VITE_ANTHROPIC_API_KEY || '');
              proxyReq.setHeader('anthropic-version', '2023-06-01');
            });
          },
        },
        // OpenAI API proxy
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: () => '/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_OPENAI_API_KEY || ''}`);
            });
          },
        },
        // Gemini API proxy — /api/gemini/<model>
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            const model = path.replace('/api/gemini/', '') || 'gemini-2.0-flash';
            return `/v1beta/models/${model}:generateContent?key=${env.VITE_GEMINI_API_KEY || ''}`;
          },
        },
      },
    },
  };
});
