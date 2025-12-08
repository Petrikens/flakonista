<script setup lang="ts">
import type { AromaboxListResponse } from '~/types/api'
import type { Aromabox, Product } from '~/types/product'
import { normalizeAromabox } from '~/utils/aromabox'

const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const canonicalUrl = `${baseUrl}/catalog/aromaboxes`

const INITIAL_KEY = 'catalog:init:aromaboxes' as const

const { data } = await useAsyncData(
  INITIAL_KEY,
  () => $fetch<AromaboxListResponse | Aromabox[]>('/api/aromaboxes'),
  { server: true }
)

const aromaboxesState = useState<AromaboxListResponse | Aromabox[] | null>(
  INITIAL_KEY,
  () => data.value
)

const aromaboxItems = computed<Aromabox[]>(() => {
  const value = aromaboxesState.value
  if (!value) return []
  return Array.isArray(value) ? value : value.items ?? []
})

const products = computed<Product[]>(() => aromaboxItems.value.map(normalizeAromabox))

const total = computed(() => {
  const value = aromaboxesState.value
  if (!value) return 0
  if (Array.isArray(value)) return value.length
  return value.count ?? aromaboxItems.value.length
})
const isEmpty = computed(() => products.value.length === 0)

// SEO мета-теги
useSeoMeta({
  title: 'Парфюмерные наборы',
  description:
    'Широкий выбор оригинальных парфюмерных наборов для мужчин и женщин. Фильтры по брендам, сезону и цене. Доставка по Беларуси.',
  ogTitle: 'Парфюмерные наборы | Flakonista',
  ogDescription: 'Широкий выбор оригинальных парфюмерных наборов для мужчин и женщин.',
  ogImage: `${baseUrl}/images/logo.png`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Парфюмерные наборы | Flakonista',
  twitterDescription: 'Широкий выбор оригинальных парфюмерных наборов для мужчин и женщин.',
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
    { name: 'Аромабоксы', url: '/catalog/aromaboxes' },
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
  <section class="bg-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header class="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Коллекция</p>
          <h1 class="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Аромабоксы</h1>
          <p class="mt-3 max-w-3xl text-base text-gray-600">
            Специально собранные наборы нишевой парфюмерии. Выбирайте любимые ароматы и добавляйте
            их в корзину так же, как и любую позицию каталога.
          </p>
        </div>
        <div class="rounded-full bg-gray-50 px-5 py-2 text-sm font-medium text-gray-600">
          В наличии {{ total }} наборов
        </div>
      </header>

      <div
        v-if="isEmpty"
        class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500"
        role="status"
      >
        <p class="text-lg font-semibold text-gray-700">Скоро появятся новые наборы</p>
        <p class="mt-2 text-sm text-gray-500">
          Подпишитесь на обновления, чтобы первыми узнать о свежих подборках ароматов.
        </p>
      </div>

      <ProductGrid v-else :products="products" />
    </div>
  </section>
</template>
