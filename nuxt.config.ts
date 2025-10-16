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
  ],
})
