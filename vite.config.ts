/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mockApi } from './mock/plugin.ts'

// O front sempre chama /api/...; em dev o proxy repassa ao Kong sem o prefixo.
// `npm run dev:mock` troca o Kong por dados de exemplo (mock/), só em desenvolvimento.
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'mock' && mockApi()],
  server: {
    proxy:
      mode === 'mock'
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:8000',
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
