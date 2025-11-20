<script setup lang="ts">
import type { ProductsListResponse } from '~/types/api'

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
</script>

<template>
  <CatalogView
    title="Каталог"
    :genders="['men', 'unisex', 'women']"
    :page-size="20"
    :initial-state-key="INITIAL_KEY"
  />
</template>
