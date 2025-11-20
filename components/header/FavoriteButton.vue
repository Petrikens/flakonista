<script setup lang="ts">
import { HeartIcon } from '@heroicons/vue/24/outline'

const favorites = useFavoritesStore()
const ui = useUiStore()
const count = computed(() => favorites.items.length)
</script>

<template>
  <div class="ml-4 flow-root lg:ml-6">
    <button type="button" class="group -m-2 flex items-center p-2" @click="ui.openFavorites()">
      <HeartIcon
        class="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      <span
        class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800"
        aria-live="polite"
        role="status"
      >
        <ClientOnly fallback="0">{{ count }}</ClientOnly>
      </span>
      <span class="sr-only">Избранные товары</span>
    </button>
  </div>
</template>
