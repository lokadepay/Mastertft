import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    modules: [
        '@nuxtjs/tailwindcss',
    ],

    app: {
        head: {
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' }
            ]
        }
    },

    css: [
        '~/assets/styles/main.scss'
    ],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    additionalData: '@use "~/assets/styles/variables" as *;'
                }
            }
        },
        resolve: {
            dedupe: ['vue', '@vue/runtime-core', 'vue-router', 'unhead', '@unhead/vue']
        }
    },

    typescript: {
        strict: false,
        typeCheck: false
    },

    serverDir: 'app/server',

    srcDir: 'app/',
})