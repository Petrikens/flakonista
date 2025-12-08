<template>
  <div class="bg-white">
    <!-- Обработка пустого списка -->
    <div v-if="products.length === 0" class="py-12 text-center text-gray-500" role="status">
      <p class="text-lg">Товары не найдены</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
      <article
        v-for="product in products"
        :key="product.id"
        class="group relative"
        :aria-label="`Карточка товара: ${product.name}`"
      >
        <NuxtLink
          :to="productLink(product)"
          :aria-label="`Открыть страницу товара: ${product.name}`"
          class="block"
        >
          <div
            class="relative"
            @mousemove="handleImageMouseMove(product, $event)"
            @mouseenter="handleImageMouseEnter(product)"
            @mouseleave="handleImageMouseLeave(product)"
          >
            <NuxtImg
              v-if="productImage(product)"
              :src="productImage(product)"
              :alt="generateProductAlt(product.name, product.brand?.name)"
              :title="product.name"
              class="aspect-[3/4] w-full rounded-lg bg-gray-200 object-cover transition-opacity duration-200 group-hover:opacity-75"
              loading="lazy"
              format="webp"
              :modifiers="{ quality: 85 }"
              @error="() => handleImageError(product, productImage(product))"
            >
              <template #placeholder>
                <ProductImageSkeleton />
              </template>
            </NuxtImg>
            <div v-else class="aspect-[3/4] w-full rounded-lg bg-gray-200">
              <ProductImageSkeleton />
            </div>

            <div
              class="absolute inset-0 z-10 hidden items-end justify-center p-3 opacity-0 transition-opacity duration-200 md:flex md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            >
              <button
                type="button"
                class="w-full rounded-md bg-white/90 px-3 py-2 text-center text-sm font-medium text-gray-900 shadow ring-1 ring-black/5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                :aria-label="`Быстрый просмотр товара ${product.name}`"
                @click.prevent="openQuickView(product)"
              >
                Быстрый просмотр
              </button>
            </div>

            <!-- Кнопка избранного -->
            <button
              v-if="isMounted"
              type="button"
              class="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:scale-110 z-20"
              :aria-pressed="isFavoriteLocal(product.id)"
              :aria-label="
                isFavoriteLocal(product.id) ? 'Убрать из избранного' : 'Добавить в избранное'
              "
              @click.prevent="onToggleFavorite(product, $event)"
            >
              <HeartIcon
                class="h-5 w-5 transition-colors"
                :class="
                  isFavoriteLocal(product.id)
                    ? 'text-primary fill-primary'
                    : 'text-gray-600 hover:text-primary'
                "
                aria-hidden="true"
              />
            </button>
          </div>

          <!-- Информация о товаре -->
          <div class="mt-4 flex flex-col gap-1">
            <!-- Цена (обновляется при выборе объёма) -->
            <p class="text-lg font-medium text-gray-900">
              {{ selectedPrice(product) }}
            </p>

            <!-- Название товара -->
            <h3 class="text-base text-gray-700 line-clamp-2 min-h-[3.25rem]">
              {{ product.name }}
            </h3>

            <!-- Бренд -->
            <p v-if="product.brands?.name" class="text-sm text-gray-500">
              {{ product.brands.name }}
            </p>
          </div>
        </NuxtLink>

        <div class="flex flex-col">
          <!-- Выбор объёма -->
          <label class="mt-1 text-sm text-gray-700" :for="`select-${product.id}`">Объём</label>
          <select
            class="mt-1 rounded-md border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500 h-8"
            :id="`select-${product.id}`"
            :aria-label="`Выбрать объём для ${product.name}`"
            v-model="selectedByProduct[product.id]"
          >
            <option
              v-for="variant in variantsFor(product)"
              :key="variant.id"
              :value="variant.id"
              :disabled="!variant.inStock || variant.price == null"
            >
              {{ variant.label }}
              {{ variant.price != null ? `— ${formatPrice(variant.price)}` : ' — нет' }}
            </option>
          </select>
        </div>

        <!-- Кнопка в корзину -->
        <button
          type="button"
          class="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-primary hover:bg-primary/80 py-2 mt-2 text-center text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="addingToCart === product.id || !canAddSelected(product)"
          :aria-label="`Добавить ${product.name} в корзину`"
          @click.prevent="onAddToCart(product, $event)"
        >
          <!-- Индикатор загрузки -->
          <svg
            v-if="addingToCart === product.id"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          <span>{{ addingToCart === product.id ? 'Добавление...' : 'В корзину' }}</span>
        </button>
      </article>
    </div>
  </div>

  <!-- Модальное окно быстрого просмотра -->
  <ClientOnly>
    <QuickViewModal
      v-if="quickOpen && quickProduct"
      v-model:open="quickOpen"
      :product="quickProduct"
      @add-to-cart="handleQuickViewAddToCart"
      @favorite-toggle="handleQuickViewFavoriteToggle"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useMounted } from '@vueuse/core'
import type { BottleVariant } from '~/utils/constants'
import {
  getMinPrice,
  formatPrice,
  generateProductAlt,
  createBottleVariants,
} from '~/utils/constants'
import { isAromaboxProduct } from '~/utils/aromabox'

const props = defineProps<{
  products: Product[]
}>()

const favoritesStore = useFavoritesStore() as ReturnType<typeof useFavoritesStore>
const cartStore = useCartStore() as ReturnType<typeof useCartStore>
const isMounted = useMounted()
const isFavoriteLocal = (id: string) => (favoritesStore as any).isFavorite(id as any)

// Отслеживание процесса добавления в корзину
const addingToCart = ref<string | null>(null)

// Выбор варианта по товару
const selectedByProduct = ref<Record<string, string | null>>({})
const hoverImageIndex = ref<Record<string, number>>({})
const brokenImagesByProduct = ref<Record<string, string[]>>({})

function ensureHoverIndex(product: Product) {
  if (!(product.id in hoverImageIndex.value)) {
    hoverImageIndex.value[product.id] = 0
  }
}

watch(
  () => props.products.map((product) => product.id),
  (productIds) => {
    const existingIds = new Set(productIds)
    Object.keys(hoverImageIndex.value).forEach((id) => {
      if (!existingIds.has(id)) delete hoverImageIndex.value[id]
    })
    Object.keys(brokenImagesByProduct.value).forEach((id) => {
      if (!existingIds.has(id)) {
        const next = { ...brokenImagesByProduct.value }
        delete next[id]
        brokenImagesByProduct.value = next
      }
    })

    productIds.forEach((id) => {
      if (!(id in hoverImageIndex.value)) hoverImageIndex.value[id] = 0
      if (!(id in brokenImagesByProduct.value)) {
        brokenImagesByProduct.value = {
          ...brokenImagesByProduct.value,
          [id]: brokenImagesByProduct.value[id] ?? [],
        }
      }
    })
  },
  { immediate: true }
)

function validImages(product: Product): string[] {
  const base = product.image_path ?? []
  const broken = brokenImagesByProduct.value[product.id] ?? []
  return base.filter((src): src is string => !!src && !broken.includes(src))
}

function variantsFor(product: Product): BottleVariant[] {
  return createBottleVariants(product)
}

function productImage(product: Product): string {
  const images = validImages(product)
  if (!images.length) return ''
  const index = hoverImageIndex.value[product.id] ?? 0
  const safeIndex = Math.min(index, images.length - 1)
  return images[safeIndex]
}

function handleImageMouseEnter(product: Product) {
  ensureHoverIndex(product)
}

function handleImageMouseLeave(product: Product) {
  hoverImageIndex.value[product.id] = 0
}

function handleImageMouseMove(product: Product, event: MouseEvent) {
  try {
    const images = validImages(product)
    if (!images.length) return

    const target = event.currentTarget as HTMLElement | null
    if (!target) return
    const rect = target.getBoundingClientRect()
    if (rect.width === 0) return

    const relativeX = event.clientX - rect.left
    const ratio = Math.min(Math.max(relativeX / rect.width, 0), 0.9999)
    const nextIndex = Math.min(images.length - 1, Math.floor(ratio * images.length))

    if (nextIndex >= 0 && nextIndex < images.length) {
      hoverImageIndex.value[product.id] = nextIndex
    }
  } catch (error) {
    // Игнорируем ошибки при обработке движения мыши
    console.debug('[ProductGrid] Error in handleImageMouseMove:', error)
  }
}

function handleImageError(product: Product, src: string | null) {
  try {
    if (!src) return
    const broken = brokenImagesByProduct.value[product.id] ?? []
    if (broken.includes(src)) return

    brokenImagesByProduct.value = {
      ...brokenImagesByProduct.value,
      [product.id]: [...broken, src],
    }

    const images = validImages(product)
    if (!(product.id in hoverImageIndex.value)) return
    if (!images.length || hoverImageIndex.value[product.id] >= images.length) {
      hoverImageIndex.value[product.id] = 0
    }
  } catch (error) {
    // Игнорируем ошибки при обработке ошибок изображений
    console.debug('[ProductGrid] Error in handleImageError:', error)
  }
}

function getSelectedVariant(product: Product): BottleVariant | null {
  const current = selectedByProduct.value[product.id]
  const variants = variantsFor(product)
  if (!current) {
    const firstAvailable = variants.find((v) => v.inStock && v.price != null) ?? variants[0]
    if (firstAvailable) selectedByProduct.value[product.id] = firstAvailable.id
    return firstAvailable ?? null
  }
  return variants.find((v) => v.id === current) ?? null
}

function canAddSelected(product: Product): boolean {
  const v = getSelectedVariant(product)
  return !!v && v.price != null
}

function selectedPrice(product: Product): string {
  const v = getSelectedVariant(product)
  if (v && v.price != null) return formatPrice(v.price)
  const min = getMinPrice(product)
  return formatPrice(min)
}
function onToggleFavorite(product: Product, event: MouseEvent) {
  event.stopPropagation()
  ;(favoritesStore as any).toggle(product)
}

/**
 * Добавление в корзину с визуальным feedback
 */
async function onAddToCart(product: Product, event: MouseEvent) {
  event.stopPropagation()

  addingToCart.value = product.id

  try {
    // Симуляция задержки для UX
    await new Promise((resolve) => setTimeout(resolve, 300))
    const variant = getSelectedVariant(product)
    ;(cartStore as any).add(product, 1, variant)
  } catch (error) {
    console.error('[ProductGrid] Failed to add to cart:', error)
  } finally {
    addingToCart.value = null
  }
}

/**
 * Генерация ссылки на товар
 */
function productLink(product: Product): string {
  return isAromaboxProduct(product)
    ? `/catalog/aromaboxes/${product.id}`
    : `/products/${product.id}`
}

// Состояние быстрого просмотра (локальное, не сохраняется при навигации)
const quickOpen = ref<boolean>(false)
const quickProduct = ref<Product | null>(null)

/**
 * Открытие быстрого просмотра
 */
function openQuickView(product: Product) {
  quickProduct.value = product
  quickOpen.value = true
}

/**
 * Обработка добавления в корзину из быстрого просмотра
 */
function handleQuickViewAddToCart(payload: { product: Product; variant: BottleVariant }) {
  ;(cartStore as any).add(payload.product, 1, payload.variant)
}

/**
 * Обработка переключения избранного из быстрого просмотра
 */
function handleQuickViewFavoriteToggle(product: Product) {
  ;(favoritesStore as any).toggle(product)
}
</script>
