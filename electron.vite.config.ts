import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// @ts-ignore just ignore cuz tailwind version is new
// import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: [
          '@supabase/supabase-js',
          'better-sqlite3',
          'prisma',
          '@prisma/client',
          'bcrypt'
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, 'src/renderer/src') },
        { find: '@components', replacement: resolve(__dirname, 'src/renderer/src/components') },
        { find: '@lib', replacement: resolve(__dirname, 'src/renderer/src/lib') }
      ]
    },
    css: {
      postcss: './postcss.config.js'
    },
    plugins: [react()]
  }
})
