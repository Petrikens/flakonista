<template>
  <div class="bg-white">
    <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="productLink(product)"
        rel="noopener noreferrer"
        :aria-label="`Открыть страницу товара: ${product.name}`"
        class="group"
      >
        <div class="relative">
          <NuxtImg
            :src="product.image_path"
            :alt="product.image_path"
            class="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
            :custom="true"
            v-slot="{ src, isLoaded, imgAttrs }"
          >
            <img v-if="isLoaded" v-bind="imgAttrs" :src="src" />
            <img v-else src="https://placehold.co/400x400" alt="placeholder" />
          </NuxtImg>
          <div
            class="absolute inset-0 z-10 flex items-end justify-center p-3 opacity-0 transition-opacity duration-200 md:group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <button
              type="button"
              class="cursor-pointer w-full rounded-md bg-white/90 px-3 py-2 text-center text-sm font-medium text-gray-900 shadow ring-1 ring-black/5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              @click.prevent="openQuickView(product)"
            >
              Быстрый просмотр
            </button>
          </div>
          <button
            v-if="isMounted"
            type="button"
            class="absolute top-3 right-3 p-1 z-10"
            :aria-pressed="favorites.isFavorite(product.id)"
            :aria-label="favorites.isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'"
            @click.prevent="onToggleFavorite(product, $event)"
          >
            <HeartIcon
              class="h-6 w-6 cursor-pointer"
              :class="
                favorites.isFavorite(product.id)
                  ? 'text-red-600'
                  : 'text-gray-600 group-hover:text-gray-800'
              "
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-1">
          <p class="text-lg font-medium text-gray-900">от {{ product.price_2ml }} руб.</p>

          <h3 class="text-base text-gray-700 line-clamp-2 min-h-[3.25rem]">
            {{ product.name }}
          </h3>

          <p v-if="product.brand?.name" class="text-sm text-gray-500">
            {{ product.brand.name }}
          </p>

          <button
            type="button"
            class="cursor-pointer inline-block rounded-md border border-transparent bg-orange-600 py-1 mt-2 text-center font-medium text-white hover:bg-orange-700"
            @click.prevent="onAddToCart(product, $event)"
          >
            В корзину
          </button>
        </div>
      </NuxtLink>
    </div>
  </div>
  <ClientOnly>
    <QuickViewModal
      v-if="quickOpen && quickProduct"
      v-model:open="quickOpen"
      :product="quickProduct"
      @add-to-cart="(p) => cart.add(p, 1)"
      @favorite-toggle="(p) => favorites.toggle(p)"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useFavoritesStore } from '~/stores/favorites'
import { useCartStore } from '~/stores/cart'
import { useMounted } from '@vueuse/core'
import { useState } from '#app'
import QuickViewModal from './QuickViewModal.vue'

defineProps<{ products: Product[] }>()

const favorites = useFavoritesStore()
const cart = useCartStore()

function onToggleFavorite(p: Product, e: MouseEvent) {
  e.stopPropagation()
  favorites.toggle(p)
}

function onAddToCart(p: Product, e: MouseEvent) {
  e.stopPropagation()
  cart.add(p, 1)
}

function productLink(p: Product) {
  return `/products/${p.id}`
}

const quickOpen = useState<boolean>('catalog:quickOpen', () => false)
const quickProduct = useState<Product>('catalog:quickProduct', () => null)
function openQuickView(p: Product) {
  quickProduct.value = p
  quickOpen.value = true
}

const isMounted = useMounted()
</script>
