<template>
  <div class="bg-white min-h-screen">
    <nav v-if="product" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <NuxtLink to="/" class="text-gray-500 hover:text-gray-700 transition-colors">
            Главная
          </NuxtLink>
        </li>
        <li class="text-gray-400">/</li>
        <li>
          <NuxtLink :to="catalogLink" class="text-gray-500 hover:text-gray-700 transition-colors">
            {{ catalogName }}
          </NuxtLink>
        </li>
        <li class="text-gray-400">/</li>
        <li class="text-gray-900 font-medium truncate max-w-xs">
          {{ product.name }}
        </li>
      </ol>
    </nav>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div v-if="product" class="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        <div class="lg:sticky lg:top-6">
          <div class="flex flex-col gap-4">
            <div class="relative">
              <NuxtImg
                v-if="activeImage"
                :key="activeImage"
                :src="activeImage"
                :alt="generateProductAlt(product.name, product.brand?.name)"
                :title="product.name"
                class="w-full rounded-lg bg-gray-100 object-cover shadow-lg aspect-square"
                format="webp"
                :modifiers="{ quality: 90 }"
                @error="() => markImageAsBroken(activeImage)"
              >
                <template #placeholder>
                  <ProductImageSkeleton />
                </template>
              </NuxtImg>
              <div v-else class="aspect-square w-full rounded-lg bg-gray-100">
                <ProductImageSkeleton />
              </div>
            </div>

            <div
              v-if="productImages.length > 1"
              class="grid grid-cols-4 gap-3"
              role="listbox"
              aria-label="Галерея изображений товара"
            >
              <button
                v-for="(image, index) in productImages"
                :key="image"
                type="button"
                class="group relative overflow-hidden rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                :class="
                  index === activeImageIndex
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-gray-200'
                "
                :aria-selected="index === activeImageIndex"
                @mouseenter="activeImageIndex = index"
                @focus="activeImageIndex = index"
                @click="activeImageIndex = index"
              >
                <NuxtImg
                  :src="image"
                  :alt="generateProductAlt(product.name, product.brand?.name)"
                  class="aspect-square w-full object-cover"
                  format="webp"
                  :modifiers="{ quality: 70 }"
                  loading="lazy"
                  @error="() => markImageAsBroken(image)"
                >
                  <template #placeholder>
                    <ProductImageSkeleton />
                  </template>
                </NuxtImg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-10 lg:mt-0">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                {{ product.name }}
              </h1>
              <p v-if="product.brand?.name" class="mt-2 text-lg text-gray-500">
                {{ product.brand.name }}
              </p>
            </div>

            <button
              v-if="isMounted"
              type="button"
              class="ml-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              :aria-pressed="isFavorite"
              :aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
              @click="handleFavoriteToggle"
            >
              <HeartIcon
                class="h-6 w-6 transition-colors"
                :class="isFavorite ? 'text-primary fill-primary' : 'text-gray-600'"
                aria-hidden="true"
              />
            </button>
          </div>

          <div v-if="product.profile_tags?.length" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in product.profile_tags"
              :key="tag"
              class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-white"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-6 rounded-lg bg-gray-50 p-4">
            <p class="text-3xl font-bold text-gray-900">
              {{ selectedPriceText }}
            </p>
            <p class="mt-1 text-sm text-gray-500">Выбранный объём: {{ selectedVariant?.label }}</p>
          </div>

          <section class="mt-8" aria-labelledby="sizes-heading">
            <h3 id="sizes-heading" class="text-sm font-medium text-gray-900">Объём флакона</h3>

            <div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              <label
                v-for="variant in variants"
                :key="variant.id"
                class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white p-3 transition-all has-checked:border-primary/20 has-checked:bg-primary has-checked:shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                :class="{
                  'hover:border-primary/20 hover:shadow-sm': variant.inStock,
                }"
              >
                <input
                  class="absolute inset-0 appearance-none cursor-pointer"
                  type="radio"
                  name="bottle"
                  :value="variant.id"
                  :checked="variant.id === selectedId"
                  :disabled="!variant.inStock"
                  :aria-label="`Объём ${variant.label}, цена ${variant.price ? formatPrice(variant.price) : 'нет в наличии'}`"
                  @change="selectedId = variant.id"
                />

                <span
                  class="text-sm font-medium transition-colors group-has-checked:text-white"
                  :class="variant.inStock ? 'text-gray-900' : 'text-gray-400'"
                >
                  {{ variant.label }}
                </span>

                <span
                  v-if="variant.price !== null"
                  class="mt-1 text-xs transition-colors group-has-checked:text-white/90"
                  :class="variant.inStock ? 'text-gray-500' : 'text-gray-400'"
                >
                  {{ formatPrice(variant.price) }}
                </span>

                <!-- Нет в наличии -->
                <span v-else class="mt-1 text-xs text-gray-400 group-has-checked:text-white/90">
                  нет
                </span>

                <!-- Галочка -->
                <span
                  v-if="variant.id === selectedId"
                  class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white"
                  aria-hidden="true"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                    <path
                      d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                    />
                  </svg>
                </span>
              </label>
            </div>
          </section>

          <!-- ✅ УЛУЧШЕНО: Кнопка в корзину -->
          <button
            type="button"
            class="mt-8 w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-all hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            :disabled="!canAddToCart || isAddingToCart"
            :aria-label="`Добавить ${product.name} объёмом ${selectedVariant?.label} в корзину`"
            @click="handleAddToCart"
          >
            <!-- Спиннер -->
            <svg
              v-if="isAddingToCart"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>

            <span>{{ isAddingToCart ? 'Добавление...' : 'Добавить в корзину' }}</span>
          </button>

          <!-- ✅ УЛУЧШЕНО: Детали товара -->
          <div class="mt-10 space-y-6">
            <!-- Сезон -->
            <div v-if="product.season_group">
              <h3 class="text-sm font-medium text-gray-900">Сезон</h3>
              <p class="mt-2 text-sm text-gray-600">
                {{ getSeasonLabel(product.season_group) }}
              </p>
            </div>

            <!-- Ноты аромата -->
            <div v-if="hasNotes" class="space-y-3">
              <h3 class="text-sm font-medium text-gray-900">Пирамида аромата</h3>

              <div v-if="topNotes.length" class="flex gap-3">
                <span class="text-sm font-medium text-gray-500 min-w-[5rem]">Верхние:</span>
                <p class="text-sm text-gray-600">{{ topNotes.join(', ') }}</p>
              </div>

              <div v-if="heartNotes.length" class="flex gap-3">
                <span class="text-sm font-medium text-gray-500 min-w-[5rem]">Средние:</span>
                <p class="text-sm text-gray-600">{{ heartNotes.join(', ') }}</p>
              </div>

              <div v-if="baseNotes.length" class="flex gap-3">
                <span class="text-sm font-medium text-gray-500 min-w-[5rem]">Базовые:</span>
                <p class="text-sm text-gray-600">{{ baseNotes.join(', ') }}</p>
              </div>
            </div>

            <!-- Кому подойдет -->
            <div v-if="product.suits">
              <h3 class="text-sm font-medium text-gray-900">Кому подойдет</h3>
              <p class="mt-2 text-sm text-gray-600">{{ product.suits }}</p>
            </div>

            <!-- Преимущества -->
            <div v-if="product.benefits">
              <h3 class="text-sm font-medium text-gray-900">Преимущества</h3>
              <p class="mt-2 text-sm text-gray-600">{{ product.benefits }}</p>
            </div>

            <!-- Ситуации -->
            <div v-if="product.occasions">
              <h3 class="text-sm font-medium text-gray-900">Подходит для</h3>
              <p class="mt-2 text-sm text-gray-600">{{ product.occasions }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ ДОБАВЛЕНО: Скелетон при загрузке (вместо оверлея) -->
      <div v-else-if="pending" class="lg:grid lg:grid-cols-2 lg:gap-x-12">
        <!-- Скелетон изображения -->
        <div class="aspect-square lg:sticky lg:top-6">
          <ProductImageSkeleton />
        </div>

        <!-- Скелетон контента -->
        <div class="mt-10 lg:mt-0 space-y-6 animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="h-24 bg-gray-200 rounded"></div>
          <div class="grid grid-cols-4 gap-2">
            <div class="h-16 bg-gray-200 rounded"></div>
            <div class="h-16 bg-gray-200 rounded"></div>
            <div class="h-16 bg-gray-200 rounded"></div>
            <div class="h-16 bg-gray-200 rounded"></div>
          </div>
          <div class="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- ✅ Обработка ошибки -->
      <div v-else-if="error" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Товар не найден</h3>
        <p class="mt-1 text-sm text-gray-500">Возможно, он был удален или не существует</p>
        <div class="mt-6">
          <NuxtLink
            to="/catalog/men"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Вернуться в каталог
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useMounted } from '@vueuse/core'
import {
  type BottleVariant,
  createBottleVariants,
  parseNotes,
  formatPrice,
  generateProductAlt,
  getSeasonLabel,
} from '~/utils/constants'

type FavoritesStore = ReturnType<typeof useFavoritesStore> & {
  isFavorite: (productId: Product['id']) => boolean
  toggle: (product: Product) => void
}

// ✅ Получаем ID из роута
const route = useRoute()
const productId = route.params.id as string

// ✅ УЛУЧШЕНО: Валидация ID
if (!productId || typeof productId !== 'string') {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid product ID',
  })
}

// ✅ Загрузка данных
const {
  data: product,
  pending,
  error,
} = await useAsyncData(
  `product:${productId}`,
  () => $fetch<Product>(`/api/products/${productId}`),
  {
    server: true,
    // ✅ Кеширование на клиенте
    getCachedData(key) {
      const data = useNuxtApp().payload.data[key]
      if (data && Date.now() - data.fetchedAt < 1000 * 60 * 5) {
        return data
      }
    },
  }
)

// ✅ Обработка 404
if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  })
}

// ✅ SEO
const config = useRuntimeConfig()
const baseUrl = config.public.siteUrl || 'https://flakonista.by'
const productUrl = computed(() => `${baseUrl}/products/${productId}`)
const productImage = computed(() => {
  const image = product.value?.image_path?.[0]
  if (!image) return `${baseUrl}/images/logo.png`
  return image.startsWith('http') ? image : `${baseUrl}${image}`
})

useSeoMeta({
  title: () => (product.value ? product.value.name : 'Загрузка...'),
  description: () => {
    if (!product.value) return 'Премиальная парфюмерия с доставкой по Беларуси'
    const desc =
      product.value.benefits ||
      product.value.suits ||
      `Парфюм ${product.value.name}${product.value.brand?.name ? ` от ${product.value.brand.name}` : ''}`
    return desc.length > 160 ? desc.substring(0, 157) + '...' : desc
  },
  ogTitle: () => product.value?.name || 'Flakonista',
  ogDescription: () => {
    if (!product.value) return 'Премиальная парфюмерия с доставкой по Беларуси'
    const desc =
      product.value.benefits ||
      product.value.suits ||
      `Парфюм ${product.value.name}${product.value.brand?.name ? ` от ${product.value.brand.name}` : ''}`
    return desc.length > 200 ? desc.substring(0, 197) + '...' : desc
  },
  ogImage: () => productImage.value,
  ogUrl: () => productUrl.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => product.value?.name || 'Flakonista',
  twitterDescription: () => {
    if (!product.value) return 'Премиальная парфюмерия с доставкой по Беларуси'
    const desc = product.value.benefits || product.value.suits || `Парфюм ${product.value.name}`
    return desc.length > 200 ? desc.substring(0, 197) + '...' : desc
  },
  twitterImage: () => productImage.value,
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => productUrl.value,
    },
  ],
})

// ✅ Каталог ссылки и названия (определены до использования в breadcrumbData)
const catalogLink = computed(() => {
  if (!product.value?.gender) return '/catalog/men'
  return product.value.gender === 'women' ? '/catalog/women' : '/catalog/men'
})

const catalogName = computed(() => {
  if (!product.value?.gender) return 'Каталог'
  return product.value.gender === 'women' ? 'Женщинам' : 'Мужчинам'
})

// Структурированные данные для продукта
const productStructuredData = computed(() => {
  if (!product.value) return null
  return useProductStructuredData(product.value, baseUrl)
})

// Структурированные данные для хлебных крошек
const breadcrumbData = computed(() => {
  if (!product.value) return null
  return useBreadcrumbStructuredData(
    [
      { name: 'Главная', url: '/' },
      { name: catalogName.value, url: catalogLink.value },
      { name: product.value.name, url: `/products/${product.value.id}` },
    ],
    baseUrl
  )
})

watch(
  [productStructuredData, breadcrumbData],
  ([productData, breadcrumb]) => {
    if (!productData || !breadcrumb) return

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(productData),
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(breadcrumb),
        },
      ],
    })
  },
  { immediate: true }
)

// ✅ Состояние
const cart = useCartStore() as ReturnType<typeof useCartStore>
const favorites = useFavoritesStore() as FavoritesStore
const isMounted = useMounted()
const selectedId = ref<string | null>(null)
const isAddingToCart = ref(false)
const brokenImages = ref<string[]>([])
const productImages = computed(() => {
  const images = product.value?.image_path ?? []
  return images.filter((src): src is string => !!src && !brokenImages.value.includes(src))
})
const activeImageIndex = ref(0)
const activeImage = computed(() => productImages.value[activeImageIndex.value] ?? null)

// ✅ Варианты флаконов (без `as any`)
const variants = computed<BottleVariant[]>(() => {
  if (!product.value) return []
  return createBottleVariants(product.value)
})

const selectedVariant = computed(() => {
  return variants.value.find((v) => v.id === selectedId.value) ?? variants.value[0]
})

const selectedPriceText = computed(() => {
  const variant = selectedVariant.value
  return variant?.price != null ? formatPrice(variant.price) : 'Нет в наличии'
})

const canAddToCart = computed(() => {
  return !!product.value && !!selectedVariant.value && selectedVariant.value.price != null
})

const isFavorite = computed(() => {
  return product.value ? favorites.isFavorite(product.value.id) : false
})

const topNotes = computed(() => parseNotes(product.value?.top_notes ?? null))
const heartNotes = computed(() => parseNotes(product.value?.heart_notes ?? null))
const baseNotes = computed(() => parseNotes(product.value?.basic_notes ?? null))
const hasNotes = computed(
  () => topNotes.value.length > 0 || heartNotes.value.length > 0 || baseNotes.value.length > 0
)

watch(
  () => product.value,
  (newProduct) => {
    if (!newProduct) return

    const firstAvailable = variants.value.find((v) => v.inStock) ?? variants.value[0]
    selectedId.value = firstAvailable?.id ?? null
  },
  { immediate: true }
)

watch(
  () => product.value?.id,
  () => {
    activeImageIndex.value = 0
    brokenImages.value = []
  }
)

watch(productImages, (images) => {
  if (!images.length) {
    activeImageIndex.value = 0
    return
  }

  if (activeImageIndex.value > images.length - 1) {
    activeImageIndex.value = 0
  }
})

function markImageAsBroken(src: string | null) {
  if (!src || brokenImages.value.includes(src)) return
  brokenImages.value = [...brokenImages.value, src]
}

async function handleAddToCart() {
  if (!canAddToCart.value) return

  isAddingToCart.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    cart.add(product.value!, 1, selectedVariant.value!)
  } catch (error) {
    console.error('[ProductPage] Failed to add to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

/**
 * Переключение избранного
 */
function handleFavoriteToggle() {
  if (!product.value) return
  favorites.toggle(product.value)
}
</script>
