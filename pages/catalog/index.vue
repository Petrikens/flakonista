<script setup lang="ts">
import type { ProductsListResponse } from '~/types/api'

const config = useRuntimeConfig()
const route = useRoute()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const canonicalUrl = `${baseUrl}/catalog`

const INITIAL_KEY = 'catalog:init:catalog' as const

const { data } = await useAsyncData(
  INITIAL_KEY,
  () =>
    $fetch<ProductsListResponse>('/api/products', {
      query: {
        genders: 'men,unisex,women',
        sort: 'newest',
        page: 1,
        perPage: 20,
      },
    }),
  { server: true }
)

useState<ProductsListResponse | null>(INITIAL_KEY, () => data.value)

// SEO мета-теги
useSeoMeta({
  title: 'Каталог',
  description:
    'Каталог премиальной парфюмерии. Широкий выбор оригинальных ароматов для мужчин и женщин. Фильтры по брендам, полу, сезону и цене.',
  ogTitle: 'Каталог парфюмерии | Flakonista',
  ogDescription:
    'Каталог премиальной парфюмерии. Широкий выбор оригинальных ароматов для мужчин и женщин.',
  ogImage: `${baseUrl}/images/logo.png`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Каталог парфюмерии | Flakonista',
  twitterDescription: 'Каталог премиальной парфюмерии. Широкий выбор оригинальных ароматов.',
  twitterImage: `${baseUrl}/images/logo.png`,
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})

// Структурированные данные для хлебных крошек
const breadcrumbData = useBreadcrumbStructuredData(
  [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
  ],
  baseUrl
)

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbData),
    },
  ],
})
</script>

<template>
  <CatalogView
    title="Каталог"
    :genders="['men', 'unisex', 'women']"
    :page-size="20"
    :initial-state-key="INITIAL_KEY"
  />
</template>
