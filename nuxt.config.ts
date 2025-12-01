import { defineNuxtConfig } from 'nuxt/config'
import type { } from '@nuxt/schema'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
  ],

  typescript: {
    strict: true,
    typeCheck: true
  },

  rootDir: '.',

  srcDir: 'app/',

  nitro: {
    srcDir: './app/server'
  },

})