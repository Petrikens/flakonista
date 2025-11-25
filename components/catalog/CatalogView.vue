<template>
  <div class="bg-white">
    <FiltersMobile
      v-model:open="mobileFiltersOpen"
      :filters="filters"
      @toggle="handleToggle"
      @reset="resetFilters"
    />

    <main class="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900">{{ title }}</h1>

        <div class="flex items-center">
          <SortMenu :options="sortOptions" v-model="selectedSort" @select="onSortSelect" />
          <button
            type="button"
            class="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
            @click="mobileFiltersOpen = true"
          >
            <span class="sr-only">Фильтры</span>
            <FunnelIcon class="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <section aria-labelledby="products-heading" class="pt-6 pb-24">
        <h2 id="products-heading" class="sr-only">Товары</h2>

        <div class="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          <!-- Левая колонка -->
          <FiltersDesktop :filters="filters" @toggle="handleToggle" @reset="resetFilters" />

          <!-- Товары + бесконечная прокрутка -->
          <div class="lg:col-span-3">
            <ProductGrid :products="products" />

            <!-- Прогресс догрузки -->
            <div v-if="isLoadingMore" class="py-6 text-center text-sm text-gray-500">Загрузка…</div>

            <!-- Сентинел для IO -->
            <div ref="loadMoreEl" class="h-8"></div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <!-- Глобальный оверлей: только для первой загрузки -->
  <div
    v-if="!isMounted || initialLoading"
    class="flex items-center justify-center fixed left-0 top-0 z-50 h-full w-full bg-gray-100/50"
    role="status"
  >
    <svg
      aria-hidden="true"
      class="w-12 h-12 text-gray-200 animate-spin fill-primary"
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
import type { Gender } from '~/types/product'
import { FunnelIcon } from '@heroicons/vue/20/solid'
import { useIntersectionObserver, useMounted, useThrottleFn } from '@vueuse/core'

const props = defineProps<{
  title: string
  genders: Gender[]
  pageSize?: number
  initialStateKey?: string
}>()

const mobileFiltersOpen = ref(false)

const {
  products,
  hasNext,
  initialLoading,
  isLoadingMore,
  filters,
  sortOptions,
  selectedSort,
  fetchProducts,
  loadNextPage,
  resetFilters,
  onSortSelect,
  handleToggle,
  loadBrands,
} = useInfiniteProducts({
  genders: props.genders,
  pageSize: props.pageSize ?? 20,
  initialStateKey: props.initialStateKey,
})

// Бесконечная прокрутка — безопасный троттл
const loadMoreEl = ref<HTMLElement | null>(null)
const tryLoadMore = useThrottleFn(() => {
  loadNextPage()
}, 300)

useIntersectionObserver(
  loadMoreEl,
  ([entry]) => {
    if (entry.isIntersecting) tryLoadMore()
  },
  { rootMargin: '0px 0px 300px 0px' }
)

// Первый запрос
const isMounted = useMounted()
if (props.initialStateKey) {
  // Бренды отдельно, список уже пришёл с SSR
  loadBrands()
} else {
  // Параллельная загрузка
  Promise.all([loadBrands(), fetchProducts({ reset: true })])
}
</script>
