<script setup lang="ts">
import CatalogView from '~/components/catalog/CatalogView.vue'
import { useState } from '#app'

const INITIAL_KEY = 'catalog:init:women' as const

const { data } = await useAsyncData(
  INITIAL_KEY,
  () =>
    $fetch('/api/products', {
      query: {
        genders: 'women,unisex',
        sort: 'newest',
        page: 1,
        perPage: 20,
      },
    }),
  { server: true }
)

useState<any>(INITIAL_KEY, () => data.value)
</script>

<template>
  <CatalogView
    title="Женщинам"
    :genders="['women', 'unisex']"
    :page-size="20"
    :initial-state-key="INITIAL_KEY"
  />
</template>
