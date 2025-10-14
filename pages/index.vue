<template>
  <Hero />
  <Features />
  <Categories />
  <HotProducts />
  <div
    v-if="!isMounted"
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
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import Hero from '@/components/Hero.vue'
import Features from '@/components/Features.vue'
import Categories from '@/components/Categories.vue'
import HotProducts from '@/components/HotProducts.vue'
import { useMounted } from '@vueuse/core'

const isMounted = useMounted()
</script>

<style>
@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
