<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-50" @close="emit('update:open', false)">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/40" />
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
                <!-- Close -->
                <button
                  type="button"
                  class="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @click="emit('update:open', false)"
                >
                  <span class="sr-only">Закрыть</span>
                  <XMarkIcon class="size-6" aria-hidden="true" />
                </button>

                <div class="grid w-full grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-12">
                  <!-- Image -->
                  <div class="md:col-span-5">
                    <NuxtImg
                      :src="product?.image_path"
                      :alt="productAlt"
                      class="aspect-square w-full rounded-md bg-gray-100 object-cover"
                      :custom="true"
                      v-slot="{ src, isLoaded, imgAttrs }"
                    >
                      <img v-if="isLoaded" v-bind="imgAttrs" :src="src" />
                      <img v-else src="https://placehold.co/600x600" alt="" />
                    </NuxtImg>
                  </div>

                  <!-- Content -->
                  <div class="md:col-span-7">
                    <DialogTitle class="text-xl font-semibold text-gray-900">
                      {{ product?.name }}
                    </DialogTitle>

                    <p v-if="product?.brands?.name" class="mt-1 text-sm text-gray-500">
                      {{ product.brands.name }}
                    </p>

                    <!-- Price -->
                    <div class="mt-4">
                      <p class="text-2xl font-semibold text-gray-900">
                        {{ formattedPrice }}
                      </p>
                      <p class="mt-1 text-xs text-gray-500">
                        выбранный объём: {{ selectedVariant?.label }}
                      </p>
                    </div>
                    <div v-if="product?.suits" class="mt-4 text-sm text-gray-600 line-clamp-4">
                      Кому подойдет: {{ product?.suits }}
                    </div>

                    <div v-if="product?.occasions" class="mt-4 text-sm text-gray-600 line-clamp-4">
                      Cитуации: {{ product?.occasions }}
                    </div>

                    <!-- Variants (bottle sizes) -->
                    <section class="mt-6" aria-labelledby="sizes-heading">
                      <h3 id="sizes-heading" class="text-sm font-medium text-gray-900">
                        Объём флакона
                      </h3>

                      <div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        <label
                          v-for="v in variants"
                          :key="v.id"
                          class="group relative flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 has-checked:border-indigo-600 has-checked:bg-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <input
                            class="absolute inset-0 appearance-none"
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
                          <span
                            v-else
                            class="ml-1 text-xs text-gray-400 group-has-checked:text-white"
                          >
                            нет в наличии
                          </span>
                        </label>
                      </div>
                    </section>

                    <!-- Actions -->
                    <div class="mt-6 flex gap-2">
                      <button
                        type="button"
                        class="cursor-pointer inline-flex flex-1 items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-white font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        :disabled="!selectedVariant || selectedVariant.price === null"
                        @click="onAddToCart"
                      >
                        В корзину
                      </button>

                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-md px-3 py-2 ring-1 ring-inset ring-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        @click="emit('favorite-toggle', product!)"
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
                        <span class="sr-only">Добавить в избранное</span>
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
import { computed, ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { useFavoritesStore } from '~/stores/favorites'

type BottleVariant = {
  id: string // напр. "2ml"
  ml: number // 2
  label: string // "2 мл"
  price: number | null // null => нет цены/нет в наличии
  inStock: boolean // если надо, иначе derived из price
}

// props / emits
const props = defineProps<{
  open: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'add-to-cart', payload: { product: Product; variant: BottleVariant }): void
  (e: 'favorite-toggle', product: Product): void
}>()

// локальное выбранное значение
const selectedId = ref<string | null>(null)
const favorites = useFavoritesStore()

// извлекаем варианты флаконов из продукта
const variants = computed<BottleVariant[]>(() => {
  const p = props.product as any
  if (!p) return []

  // здесь маппим известные поля твоего товара -> варианты
  const candidates: Array<[id: string, ml: number, key: string]> = [
    ['2ml', 2, 'price_2ml'],
    ['5ml', 5, 'price_5ml'],
    ['10ml', 10, 'price_10ml'],
    ['30ml', 30, 'price_30ml'],
    ['50ml', 50, 'price_50ml'],
    ['100ml', 100, 'price_100ml'],
  ]

  const result: BottleVariant[] = []
  for (const [id, ml, key] of candidates) {
    if (key in p) {
      const price = typeof p[key] === 'number' ? (p[key] as number) : null
      result.push({
        id,
        ml,
        label: `${ml} мл`,
        price,
        inStock: price !== null && price > 0,
      })
    }
  }

  // если вдруг цен нет вообще — вернём хотя бы 2 мл, чтобы кнопка была disabled
  if (result.length === 0) {
    result.push({ id: '2ml', ml: 2, label: '2 мл', price: null, inStock: false })
  }
  return result
})

// выбранный вариант
const selectedVariant = computed(
  () => variants.value.find((v) => v.id === selectedId.value) ?? variants.value[0]
)

// при открытии модалки выбираем первый доступный вариант
watchEffect(() => {
  if (!props.open) return
  const firstAvailable = variants.value.find((v) => v.inStock) ?? variants.value[0]
  selectedId.value = firstAvailable?.id ?? null
})

const productAlt = computed(() => {
  const p = props.product as any
  return p?.name ? `Изображение: ${p.name}` : 'Изображение товара'
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
const formattedPrice = computed(() => {
  const v = selectedVariant.value
  return v?.price != null ? formatPrice(v.price) : 'Нет в наличии'
})

function onAddToCart() {
  if (!props.product || !selectedVariant.value || selectedVariant.value.price == null) return
  emit('add-to-cart', { product: props.product, variant: selectedVariant.value })
  emit('update:open', false)
}
</script>
