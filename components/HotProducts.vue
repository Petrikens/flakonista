<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 pb-6">{{ title }}</h2>

      <div class="lg:col-span-3">
        <ProductGrid :products="products" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Gender } from '~/types/product'

const props = defineProps<{
  title: string
  genders: Gender[]
  pageSize?: number
  initialStateKey?: string
}>()

const { products } = useInfiniteProducts({
  genders: props.genders,
  pageSize: props.pageSize ?? 20,
  initialStateKey: props.initialStateKey,
})
</script>
