import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    modules: [
        '@nuxtjs/tailwindcss',
    ],

    vite: {
        resolve: {
            dedupe: [
                'vue',
                '@vue/runtime-core',
                'vue-router',
                'unhead',
                '@unhead/vue'
            ]
        }
    },

    typescript: {
        strict: false,
        typeCheck: false
    },

    srcDir: 'app/',
})