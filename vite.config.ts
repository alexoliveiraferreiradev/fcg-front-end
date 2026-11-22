/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { mockApi } from './mock/plugin.ts'

// O front sempre chama /api/...; em dev o proxy repassa ao Kong sem o prefixo.
// KONG_URL (variável de ambiente ou .env.local) aponta o proxy para outro Kong, como o do cluster na nuvem.
// `npm run dev:mock` troca o Kong por dados de exemplo (mock/), só em desenvolvimento.
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'mock' && mockApi()],
  server: {
    proxy:
      mode === 'mock'
        ? undefined
        : {
            '/api': {
              target: loadEnv(mode, process.cwd(), '').KONG_URL || 'http://localhost:8000',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
