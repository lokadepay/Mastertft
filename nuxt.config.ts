import { defineNuxtConfig } from 'nuxt/config'
import type { } from '@nuxt/schema'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
  ],

  vite: {
    resolve: {
      dedupe: ['vue', 'vue-router', '@vue/runtime-core', 'unhead', '@unhead/vue']
    }
  },

  typescript: {
    strict: false,
    typeCheck: false
  },

  srcDir: 'app/',
})