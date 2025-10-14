<script setup lang="ts">
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useFavoritesStore } from '~/stores/favorites'

const favorites = useFavoritesStore()
</script>

<template>
  <div class="ml-4 flow-root lg:ml-6">
    <NuxtLink to="/favorites" class="group -m-2 flex items-center p-2">
      <HeartIcon
        class="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      <span
        class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800"
        aria-live="polite"
        role="status"
      >
        {{ favorites.count }}
      </span>
      <span class="sr-only">Избранные товары</span>
    </NuxtLink>
  </div>
</template>
