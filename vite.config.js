import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // relative asset paths so the build can be hosted from any folder
  plugins: [react(), tailwindcss()],
  // static demo in one bundle; Recharts puts it near 710 kB (~205 kB gzip), which is fine to load once
  build: { chunkSizeWarningLimit: 800 },
  // .claude/worktrees holds agent worktrees with their own copies of the tests
  test: { environment: 'node', exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'] },
})
