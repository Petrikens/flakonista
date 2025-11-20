<script setup lang="ts">
import type { ProductsListResponse } from '~/types/api'

const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const canonicalUrl = `${baseUrl}/catalog/men`

const INITIAL_KEY = 'catalog:init:men' as const

const { data } = await useAsyncData(
  INITIAL_KEY,
  () =>
    $fetch<ProductsListResponse>('/api/products', {
      query: {
        genders: 'men,unisex',
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
  title: 'Парфюмерия для мужчин',
  description:
    'Мужская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов для мужчин. Фильтры по брендам, сезону и цене. Доставка по Беларуси.',
  ogTitle: 'Парфюмерия для мужчин | Flakonista',
  ogDescription:
    'Мужская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов для мужчин.',
  ogImage: `${baseUrl}/images/logo.png`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Парфюмерия для мужчин | Flakonista',
  twitterDescription: 'Мужская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов.',
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
const breadcrumbData = useBreadcrumbStructuredData([
  { name: 'Главная', url: '/' },
  { name: 'Каталог', url: '/catalog' },
  { name: 'Мужчинам', url: '/catalog/men' },
])

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
    title="Мужчинам"
    :genders="['men', 'unisex']"
    :page-size="20"
    :initial-state-key="INITIAL_KEY"
  />
</template>
