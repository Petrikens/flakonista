<template>
  <div class="bg-white">
    <div class="pt-6">
      <div
        class="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-24"
      >
        <div class="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {{ product?.name }}
          </h1>
          <p v-if="product?.brands?.name" class="mt-1 text-sm text-gray-500">
            {{ product.brands.name }}
          </p>
        </div>

        <div class="mt-4 lg:row-span-3 lg:mt-0">
          <h2 class="sr-only">Информация о товаре</h2>
          <p class="text-3xl tracking-tight text-gray-900">
            {{ selectedPriceText }}
          </p>
          <p class="mt-1 text-xs text-gray-500">выбранный объём: {{ selectedVariant?.label }}</p>

          <div v-if="product?.season_group" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Сезон:</b> {{ handleSeasonGroup }}
          </div>

          <div v-if="product?.top_notes" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Верхние ноты:</b> {{ product?.top_notes }}
          </div>

          <div v-if="product?.heart_notes" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Ноты сердца:</b> {{ product?.heart_notes }}
          </div>

          <div v-if="product?.basic_notes" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Базовые ноты:</b> {{ product?.basic_notes }}
          </div>

          <div v-if="product?.suits" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Кому подойдет:</b> {{ product?.suits }}
          </div>

          <div v-if="product?.benefits" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Преимущества:</b> {{ product?.benefits }}
          </div>

          <div v-if="product?.occasions" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Ситуации:</b> {{ product?.occasions }}
          </div>

          <div v-if="product?.profile_tags" class="mt-4 text-sm text-gray-600 line-clamp-4">
            <b>Профиль аромата:</b> {{ handleProfileTags }}
          </div>
          <div class="mt-8">
            <h3 class="text-sm font-medium text-gray-900">Объём флакона</h3>
            <fieldset class="mt-3" aria-label="Выберите объём флакона">
              <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                <label
                  v-for="v in variants"
                  :key="v.id"
                  class="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 has-checked:border-indigo-600 has-checked:bg-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <input
                    class="absolute inset-0 appearance-none cursor-pointer"
                    type="radio"
                    name="bottle"
                    :value="v.id"
                    :checked="v.id === selectedId"
                    :disabled="!v.inStock"
                    @change="selectedId = v.id"
                    :aria-label="v.label"
                  />
                  <span
                    class="text-sm font-medium group-has-checked:text-white"
                    :class="v.inStock ? 'text-gray-900' : 'text-gray-400'"
                  >
                    {{ v.label }}
                  </span>
                  <span
                    v-if="v.price !== null"
                    class="ml-1 text-xs group-has-checked:text-white"
                    :class="v.inStock ? 'text-gray-500' : 'text-gray-400'"
                  >
                    ({{ formatPrice(v.price) }})
                  </span>
                  <span v-else class="ml-1 text-xs text-gray-400 group-has-checked:text-white">
                    нет в наличии
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <div class="mt-6 flex gap-2">
            <button
              type="button"
              class="cursor-pointer inline-flex flex-1 items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-white font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              :disabled="!selectedVariant || selectedVariant.price === null"
              @click="addToCart()"
            >
              В корзину
            </button>

            <button
              v-if="isMounted"
              type="button"
              :aria-pressed="favorites.isFavorite(product.id)"
              :aria-label="
                favorites.isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'
              "
              @click.stop="onToggleFavorite(product, $event)"
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
        </div>

        <div
          class="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pr-8 lg:pb-16"
        >
          <NuxtImg
            :src="product?.image_path"
            :alt="product?.name || 'Фото товара'"
            class="row-span-2 aspect-3/4 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="!isMounted || !product"
    class="flex items-center justify-center fixed left-0 top-0 z-50 h-full w-full bg-gray-100/50"
    role="status"
  >
    <svg
      aria-hidden="true"
      class="w-12 h-12 text-gray-200 animate-spin fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.59C100 78.205 77.614 100.591 50 100.591C22.386 100.591 0 78.205 0 50.59C0 22.977 22.386 0.591 50 0.591C77.614 0.591 100 22.977 100 50.59Z"
        fill="currentColor"
      />
      <path
        d="M93.968 39.041C96.393 38.404 97.862 35.912 97.008 33.554C95.293 28.823 92.871 24.369 89.817 20.348C85.845 15.119 80.883 10.724 75.212 7.413C69.542 4.102 63.275 1.94 56.77 1.051C51.767 0.368 46.698 0.447 41.735 1.279C39.261 1.693 37.813 4.198 38.45 6.623C39.087 9.049 41.569 10.472 44.051 10.107C47.851 9.549 51.719 9.527 55.54 10.049C60.864 10.777 65.993 12.546 70.633 15.255C75.274 17.965 79.335 21.562 82.585 25.841C84.918 28.912 86.8 32.291 88.181 35.876C89.083 38.216 91.542 39.678 93.968 39.041Z"
        fill="currentFill"
      />
    </svg>
    <span class="sr-only">Загрузка…</span>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useAsyncData } from '#app'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useMounted } from '@vueuse/core'

type BottleVariant = {
  id: string
  ml: number
  label: string
  price: number | null
  inStock: boolean
}

const route = useRoute()
const cart = useCartStore()
const favorites = useFavoritesStore()
const id = route.params.id

const { data: product } = await useAsyncData<Product>(
  `product:${id}`,
  () => $fetch(`/api/products/${route.params.id}`),
  { server: true }
)

const variants = computed<BottleVariant[]>(() => {
  const p: any = product.value
  if (!p) return []
  const map: Array<[string, number, string]> = [
    ['2ml', 2, 'price_2ml'],
    ['5ml', 5, 'price_5ml'],
    ['10ml', 10, 'price_10ml'],
    ['30ml', 30, 'price_30ml'],
    ['50ml', 50, 'price_50ml'],
    ['100ml', 100, 'price_100ml'],
  ]
  const out: BottleVariant[] = []
  for (const [id, ml, key] of map) {
    if (key in p) {
      const price = typeof p[key] === 'number' ? (p[key] as number) : null
      out.push({ id, ml, label: `${ml} мл`, price, inStock: price !== null && price > 0 })
    }
  }
  return out.length ? out : [{ id: '2ml', ml: 2, label: '2 мл', price: null, inStock: false }]
})

const selectedId = ref<string | null>(null)
const selectedVariant = computed(
  () => variants.value.find((v) => v.id === selectedId.value) ?? variants.value[0]
)

watchEffect(() => {
  if (!product.value) return
  const firstAvailable = variants.value.find((v) => v.inStock) ?? variants.value[0]
  selectedId.value = firstAvailable?.id ?? null
})

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${n} ₽`
  }
}
const selectedPriceText = computed(() => {
  const v = selectedVariant.value
  return v?.price != null ? formatPrice(v.price) : 'Нет в наличии'
})

const handleSeasonGroup = computed(() => {
  if (product.value?.season_group === 'all_seasons') {
    return 'Всесезонный'
  } else if (product.value?.season_group === 'spring_summer') {
    return 'Весна - лето'
  } else if (product.value?.season_group === 'fall_winter') {
    return 'Осень - зима'
  }
})

const handleProfileTags = computed(() => {
  if (product.value?.profile_tags) {
    return product.value.profile_tags.join(', ')
  }
})

function addToCart() {
  if (!product.value || !selectedVariant.value || selectedVariant.value.price == null) return
  cart.add(product.value, 1)
}

function onToggleFavorite() {
  if (!product.value) return
  favorites.toggle(product.value)
}
const isMounted = useMounted()
</script>
