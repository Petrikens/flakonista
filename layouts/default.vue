<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Skip link для доступности -->
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
    >
      Skip to content
    </a>

    <Header />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <Footer />
    <!-- Global drawers -->
    <CartDrawer />
    <FavoritesDrawer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/header/Header.vue'
import Footer from '@/components/Footer.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import FavoritesDrawer from '@/components/FavoritesDrawer.vue'
</script>
