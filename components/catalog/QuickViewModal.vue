<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-stretch justify-center text-center md:items-center md:px-4"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            enter-to="opacity-100 translate-y-0 md:scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 md:scale-100"
            leave-to="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
          >
            <DialogPanel
              class="flex w-full transform text-left text-base transition md:my-10 md:max-w-3xl lg:max-w-4xl"
            >
              <div
                class="relative flex w-full items-start overflow-hidden rounded-lg bg-white shadow-2xl"
              >
                <!-- ✅ УЛУЧШЕНО: Кнопка закрытия с hover эффектом -->
                <button
                  type="button"
                  class="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-md bg-white/80 backdrop-blur-sm text-gray-400 transition-colors hover:bg-white hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Закрыть окно быстрого просмотра"
                  @click="handleClose"
                >
                  <span class="sr-only">Закрыть</span>
                  <XMarkIcon class="size-6" aria-hidden="true" />
                </button>

                <div class="grid w-full grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-12">
                  <div class="md:col-span-5 flex items-center justify-center">
                    <div class="sticky top-0">
                      <NuxtImg
                        v-if="product"
                        :src="product.image_path"
                        :alt="generateProductAlt(product.name, product.brand?.name)"
                        :title="product.name"
                        class="aspect-square w-full rounded-md bg-gray-100 object-cover"
                        format="webp"
                        :modifiers="{ quality: 90 }"
                      >
                        <template #placeholder>
                          <ProductImageSkeleton />
                        </template>
                      </NuxtImg>
                    </div>
                  </div>

                  <div
                    class="overflow-x-hidden md:col-span-7 overflow-y-auto max-h-[calc(100vh-8rem)]"
                  >
                    <DialogTitle class="text-xl font-semibold text-gray-900 pr-8">
                      {{ product?.name }}
                    </DialogTitle>

                    <p v-if="product?.brand?.name" class="mt-1 text-sm text-gray-500">
                      {{ product.brand.name }}
                    </p>

                    <div v-if="product?.profile_tags?.length" class="mt-3 flex flex-wrap gap-1.5">
                      <span
                        v-for="tag in product.profile_tags"
                        :key="tag"
                        class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {{ tag }}
                      </span>
                    </div>

                    <div class="mt-4 rounded-lg bg-gray-50 p-3">
                      <p class="text-2xl font-semibold text-gray-900">
                        {{ formattedPrice }}
                      </p>
                      <p class="mt-1 text-xs text-gray-500">
                        Выбранный объём: {{ selectedVariant?.label }}
                      </p>
                    </div>

                    <div v-if="product?.suits" class="mt-4">
                      <h4 class="text-sm font-medium text-gray-900">Кому подойдет</h4>
                      <p class="mt-1 text-sm text-gray-600">{{ product.suits }}</p>
                    </div>

                    <div v-if="product?.occasions" class="mt-4">
                      <h4 class="text-sm font-medium text-gray-900">Ситуации</h4>
                      <p class="mt-1 text-sm text-gray-600">{{ product.occasions }}</p>
                    </div>

                    <div v-if="product?.benefits" class="mt-4">
                      <h4 class="text-sm font-medium text-gray-900">Преимущества</h4>
                      <p class="mt-1 text-sm text-gray-600">{{ product.benefits }}</p>
                    </div>

                    <section class="mt-6" aria-labelledby="sizes-heading">
                      <h3 id="sizes-heading" class="text-sm font-medium text-gray-900">
                        Объём флакона
                      </h3>

                      <div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        <label
                          v-for="variant in variants"
                          :key="variant.id"
                          class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white p-2 transition-all has-checked:border-indigo-600 has-checked:bg-indigo-600 has-checked:shadow-md focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                          :class="{
                            'hover:border-indigo-300 hover:shadow-sm': variant.inStock,
                            'opacity-60': !variant.inStock,
                          }"
                        >
                          <input
                            class="absolute inset-0 appearance-none"
                            type="radio"
                            name="bottle"
                            :value="variant.id"
                            :checked="variant.id === selectedId"
                            :disabled="!variant.inStock"
                            :aria-label="`Объём ${variant.label}, цена ${variant.price ? formatPrice(variant.price) : 'нет в наличии'}`"
                            @change="selectedId = variant.id"
                          />

                          <!-- Размер -->
                          <span
                            class="text-sm font-medium transition-colors group-has-checked:text-white"
                            :class="variant.inStock ? 'text-gray-900' : 'text-gray-400'"
                          >
                            {{ variant.label }}
                          </span>

                          <!-- Цена -->
                          <span
                            v-if="variant.price !== null"
                            class="text-xs transition-colors group-has-checked:text-white/90"
                            :class="variant.inStock ? 'text-gray-500' : 'text-gray-400'"
                          >
                            {{ formatPrice(variant.price) }}
                          </span>

                          <!-- Нет в наличии -->
                          <span
                            v-else
                            class="text-xs text-gray-400 group-has-checked:text-white/90"
                          >
                            нет
                          </span>

                          <!-- ✅ ДОБАВЛЕНО: Индикатор выбранного -->
                          <span
                            v-if="variant.id === selectedId"
                            class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white"
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

                    <!-- ✅ УЛУЧШЕНО: Actions с визуальным feedback -->
                    <div
                      class="mt-6 flex gap-2 sticky bottom-0 bg-white pt-4 border-t border-gray-100"
                    >
                      <button
                        type="button"
                        class="inline-flex flex-1 items-center justify-center rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
                        :disabled="!canAddToCart || isAddingToCart"
                        :aria-label="`Добавить ${product?.name} объёмом ${selectedVariant?.label} в корзину`"
                        @click="handleAddToCart"
                      >
                        <!-- ✅ ДОБАВЛЕНО: Спиннер -->
                        <svg
                          v-if="isAddingToCart"
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

                        <span>{{ isAddingToCart ? 'Добавление...' : 'В корзину' }}</span>
                      </button>

                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md px-3 py-2 ring-1 ring-inset ring-gray-300 text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                        :aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
                        :aria-pressed="isFavorite"
                        @click="handleFavoriteToggle"
                      >
                        <HeartIcon
                          class="h-6 w-6 transition-all"
                          :class="isFavorite ? 'text-red-600 fill-red-600' : 'text-gray-600'"
                          aria-hidden="true"
                        />
                        <span class="sr-only">
                          {{ isFavorite ? 'Убрать из избранного' : 'Добавить в избранное' }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { useFavoritesStore } from '~/stores/favorites'
import ProductImageSkeleton from './ProductImageSkeleton.vue'
import {
  type BottleVariant,
  createBottleVariants,
  parseNotes,
  formatPrice,
  generateProductAlt,
} from '~/utils/constants'

// ✅ Props с валидацией
const props = defineProps<{
  open: boolean
  product: Product | null
}>()

// ✅ Типизированные emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'add-to-cart', payload: { product: Product; variant: BottleVariant }): void
  (e: 'favorite-toggle', product: Product): void
}>()

// ✅ Состояние
const selectedId = ref<string | null>(null)
const isAddingToCart = ref(false)
const favorites = useFavoritesStore()

// ✅ УЛУЧШЕНО: Создание вариантов флаконов без `as any`
const variants = computed<BottleVariant[]>(() => {
  if (!props.product) return []
  return createBottleVariants(props.product)
})

// ✅ Выбранный вариант
const selectedVariant = computed(() => {
  return variants.value.find((v) => v.id === selectedId.value) ?? variants.value[0]
})

// ✅ Форматированная цена
const formattedPrice = computed(() => {
  const variant = selectedVariant.value
  return variant?.price != null ? formatPrice(variant.price) : 'Нет в наличии'
})

// ✅ Можно ли добавить в корзину
const canAddToCart = computed(() => {
  return !!props.product && !!selectedVariant.value && selectedVariant.value.price != null
})

// ✅ Избранное
const isFavorite = computed(() => {
  return props.product ? favorites.isFavorite(props.product.id) : false
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      // Сброс состояния при закрытии
      isAddingToCart.value = false
      return
    }

    // При открытии выбираем первый доступный вариант
    const firstAvailable = variants.value.find((v) => v.inStock) ?? variants.value[0]
    selectedId.value = firstAvailable?.id ?? null
  },
  { immediate: true }
)

/**
 * Закрытие модалки
 */
function handleClose() {
  emit('update:open', false)
}

/**
 * Добавление в корзину с визуальным feedback
 */
async function handleAddToCart() {
  if (!canAddToCart.value) return

  isAddingToCart.value = true

  try {
    // Задержка для UX (опционально)
    await new Promise((resolve) => setTimeout(resolve, 300))

    emit('add-to-cart', {
      product: props.product!,
      variant: selectedVariant.value!,
    })

    // Закрываем модалку после успешного добавления
    handleClose()
  } catch (error) {
    console.error('[QuickViewModal] Failed to add to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

/**
 * Переключение избранного
 */
function handleFavoriteToggle() {
  if (!props.product) return
  emit('favorite-toggle', props.product)
}
</script>
