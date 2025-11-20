import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-26',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  modules: [
    ['@nuxtjs/supabase', { redirect: false }],
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/sitemap',
  ],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://flakonista.by',
    },
  },
  sitemap: {
    hostname: process.env.NUXT_PUBLIC_SITE_URL || 'https://flakonista.by',
    gzip: true,
    routes: async () => {
      // Динамические маршруты для продуктов будут добавлены автоматически
      // если они доступны через API
      return []
    },
  },
  app: {
    head: {
      titleTemplate: '%s | Flakonista',
      title: 'Flakonista - Магазин парфюмерии',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Премиальная парфюмерия с доставкой по Беларуси. Широкий выбор оригинальных ароматов для мужчин и женщин.',
        },
        {
          name: 'keywords',
          content: 'парфюмерия, ароматы, духи, парфюм, Беларусь, доставка, оригинальные ароматы',
        },
        { name: 'author', content: 'Flakonista' },
        {
          name: 'robots',
          content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Flakonista' },
        { property: 'og:locale', content: 'ru_RU' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@flakonista' },
      ],
      link: [
        { rel: 'icon', type: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: process.env.NUXT_PUBLIC_SITE_URL || 'https://flakonista.by' },
      ],
    },
  },
})
