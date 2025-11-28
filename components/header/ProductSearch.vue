<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { Product } from '~/types/product'

const { query, results, loading, error, isOpen, hasSufficientQuery, openDropdown, closeDropdown } =
  useProductSearch({ limit: 6 })

const highlightedIndex = ref(-1)
const dropdownId = 'header-search-results'
const inputId = 'header-search-input'
const hasBeenFocused = ref(false)

let closeTimer: ReturnType<typeof setTimeout> | null = null

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function scheduleClose() {
  clearCloseTimer()
  closeTimer = setTimeout(() => {
    closeDropdown()
  }, 120)
}

function handleFocus() {
  clearCloseTimer()
  hasBeenFocused.value = true
  if (hasSufficientQuery.value || results.value.length > 0 || loading.value) {
    openDropdown()
  }
}

function handleBlur() {
  scheduleClose()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && results.value.length) {
    event.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % results.value.length
    return
  }

  if (event.key === 'ArrowUp' && results.value.length) {
    event.preventDefault()
    highlightedIndex.value =
      highlightedIndex.value <= 0 ? results.value.length - 1 : highlightedIndex.value - 1
    return
  }

  if (event.key === 'Enter') {
    if (results.value.length) {
      event.preventDefault()
      const targetIndex = highlightedIndex.value >= 0 ? highlightedIndex.value : 0
      handleSelect(results.value[targetIndex])
    }
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
  }
}

function handleSubmit() {
  if (!results.value.length) return
  const targetIndex = highlightedIndex.value >= 0 ? highlightedIndex.value : 0
  handleSelect(results.value[targetIndex])
}

function handleSelect(product: Product) {
  query.value = product.name
  clearCloseTimer()
  closeDropdown()
  navigateTo(`/products/${product.id}`)
}

function getBrandName(product: Product) {
  return product.brands?.name ?? product.brand?.name ?? 'Без бренда'
}

function productImage(product: Product) {
  return Array.isArray(product.image_path) && product.image_path.length > 0
    ? product.image_path[0]
    : ''
}

watch(
  () => results.value,
  () => {
    highlightedIndex.value = -1
    // Автоматически открываем dropdown при появлении результатов или начала загрузки
    if (hasBeenFocused.value && (results.value.length > 0 || loading.value || error.value)) {
      clearCloseTimer()
      openDropdown()
    }
  }
)

watch(
  () => query.value,
  () => {
    // Открываем dropdown при вводе текста, если был фокус и запрос достаточен
    if (hasBeenFocused.value && hasSufficientQuery.value) {
      clearCloseTimer()
      openDropdown()
    }
  }
)

watch(
  () => loading.value,
  (value) => {
    // Открываем dropdown при начале загрузки, если был фокус
    if (value && hasBeenFocused.value) {
      clearCloseTimer()
      openDropdown()
    }
  }
)

watch(
  () => error.value,
  (value) => {
    // Открываем dropdown при появлении ошибки, если был фокус
    if (value && hasBeenFocused.value) {
      clearCloseTimer()
      openDropdown()
    }
  }
)

watch(
  () => isOpen.value,
  (value) => {
    if (!value) highlightedIndex.value = -1
  }
)
</script>

<template>
  <div class="relative lg:max-w-md ml-auto">
    <form class="relative" @submit.prevent="handleSubmit">
      <label :for="inputId" class="sr-only">Поиск аромата</label>

      <div class="relative">
        <input
          :id="inputId"
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="Поиск..."
          class="w-full rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 pr-12 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary"
          role="combobox"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          :aria-controls="isOpen ? dropdownId : undefined"
          :aria-activedescendant="
            isOpen && highlightedIndex >= 0 && results[highlightedIndex]
              ? `header-search-item-${results[highlightedIndex].id}`
              : undefined
          "
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />

        <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg
            v-if="loading"
            class="size-5 animate-spin text-primary"
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
              fill="none"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <MagnifyingGlassIcon v-else class="size-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>
    </form>

    <div
      v-if="isOpen"
      class="relative mt-2"
      @mousedown.prevent
      @mouseenter="clearCloseTimer"
      @mouseleave="scheduleClose"
    >
      <div
        class="absolute z-40 w-full rounded-2xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur"
        :id="dropdownId"
        role="listbox"
      >
        <div
          v-if="loading"
          class="flex items-center gap-2 px-4 py-3 text-sm text-gray-500"
          aria-live="polite"
        >
          <svg class="size-4 animate-spin text-primary" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Ищем аромат…</span>
        </div>

        <p v-else-if="error" class="px-4 py-3 text-sm text-red-600">
          {{ error }}
        </p>

        <ul v-else-if="results.length" class="divide-y divide-gray-100">
          <li
            v-for="(product, index) in results"
            :key="product.id"
            :id="`header-search-item-${product.id}`"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-left transition"
              :class="index === highlightedIndex ? 'bg-gray-50' : 'hover:bg-gray-50'"
              @mouseenter="highlightedIndex = index"
              @focus="highlightedIndex = index"
              @mousedown.prevent="handleSelect(product)"
              @click="handleSelect(product)"
            >
              <div class="size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <NuxtImg
                  v-if="productImage(product)"
                  :src="productImage(product)"
                  :alt="product.name"
                  class="size-full object-cover"
                  format="webp"
                  :modifiers="{ quality: 70 }"
                />
                <div
                  v-else
                  class="flex size-full items-center justify-center text-xs font-semibold text-gray-500"
                >
                  {{ product.name.slice(0, 2).toUpperCase() }}
                </div>
              </div>

              <div class="flex flex-1 flex-col">
                <p class="text-sm font-semibold text-gray-900">
                  {{ product.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getBrandName(product) }}
                </p>
              </div>

              <span class="text-xs text-gray-400">Открыть</span>
            </button>
          </li>
        </ul>

        <p v-else class="px-4 py-3 text-sm text-gray-500">
          {{
            hasSufficientQuery
              ? 'Мы не нашли совпадений, попробуйте другой запрос'
              : 'Введите минимум 2 символа для поиска'
          }}
        </p>
      </div>
    </div>
  </div>
</template>
