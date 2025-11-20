<script setup lang="ts">
import type { ProductsListResponse } from '~/types/api'

const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const canonicalUrl = `${baseUrl}/catalog/women`

const INITIAL_KEY = 'catalog:init:women' as const

const { data } = await useAsyncData(
  INITIAL_KEY,
  () =>
    $fetch<ProductsListResponse>('/api/products', {
      query: {
        genders: 'women,unisex',
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
  title: 'Парфюмерия для женщин',
  description:
    'Женская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов для женщин. Фильтры по брендам, сезону и цене. Доставка по Беларуси.',
  ogTitle: 'Парфюмерия для женщин | Flakonista',
  ogDescription:
    'Женская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов для женщин.',
  ogImage: `${baseUrl}/images/logo.png`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Парфюмерия для женщин | Flakonista',
  twitterDescription: 'Женская парфюмерия и унисекс ароматы. Широкий выбор оригинальных ароматов.',
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
  { name: 'Женщинам', url: '/catalog/women' },
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
    title="Женщинам"
    :genders="['women', 'unisex']"
    :page-size="20"
    :initial-state-key="INITIAL_KEY"
  />
</template>
