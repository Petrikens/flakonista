<script setup lang="ts">
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'

const cart = useCartStore()
const ui = useUiStore()
</script>

<template>
  <div class="ml-4 flow-root lg:ml-6">
    <button type="button" class="group -m-2 flex items-center p-2" @click="ui.openCart()">
      <ShoppingBagIcon
        class="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      <span
        class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800"
        aria-live="polite"
        role="status"
      >
        {{ cart.count }}
      </span>
      <span class="sr-only">Товары в корзине, открыть корзину</span>
    </button>
  </div>
</template>
