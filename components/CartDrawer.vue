<script setup lang="ts">
import Drawer from '~/components/Drawer.vue'
import { useUiStore } from '~/stores/ui'
import { useCartStore } from '~/stores/cart'
import { computed } from 'vue'
import { getMinPrice, formatPrice, generateProductAlt, CONSTANTS } from '~/utils/constants'
import { useRouter } from 'vue-router'

const ui = useUiStore()
const cart = useCartStore()
const router = useRouter()

const subtotal = computed(() => {
  return cart.items.reduce((sum, item) => {
    const basePrice = item.variant?.price ?? getMinPrice(item.product)
    return sum + (basePrice ?? 0) * item.qty
  }, 0)
})

function removeItem(id: number | string, variantId: string | null) {
  cart.remove(id as any, variantId)
}

function goToCheckout() {
  ui.enableCheckoutOnce()
  router.push('/checkout')
}
</script>

<template>
  <Drawer v-model="ui.isCartOpen" title="Корзина">
    <div v-if="cart.items.length === 0" class="text-sm text-gray-500">Корзина пуста</div>
    <div v-else class="flow-root">
      <ul role="list" class="-my-6 divide-y divide-gray-200">
        <li
          v-for="item in cart.items"
          :key="`${item.id}:${item.variantId ?? 'base'}`"
          class="flex py-6"
        >
          <NuxtLink
            :to="`/products/${item.product.id}`"
            class="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200"
            @click="ui.closeCart(), ui.closeFavorites()"
          >
            <img
              :src="item.product.image_path || CONSTANTS.PRODUCT_IMAGE_PLACEHOLDER"
              :alt="
                generateProductAlt(
                  item.product.name,
                  item.product.brand?.name || item.product.brands?.name
                )
              "
              class="size-full object-cover"
            />
          </NuxtLink>

          <div class="ml-4 flex flex-1 flex-col">
            <div>
              <div class="flex justify-between text-base font-medium text-gray-900">
                <h3 class="pr-2">
                  <NuxtLink
                    :to="`/products/${item.product.id}`"
                    @click="ui.closeCart(), ui.closeFavorites()"
                  >
                    {{ item.product.name }}
                  </NuxtLink>
                </h3>
                <p class="ml-4">
                  {{
                    formatPrice(
                      ((item.variant?.price ?? getMinPrice(item.product)) || 0) * item.qty
                    )
                  }}
                </p>
              </div>
              <p v-if="item.variant" class="mt-1 text-sm text-gray-500">{{ item.variant.label }}</p>
            </div>
            <div class="mt-2 flex items-end justify-between text-sm">
              <div class="flex items-center gap-2 text-gray-500">
                <span>Кол-во</span>
                <input
                  type="number"
                  min="1"
                  class="w-16 rounded-md border border-gray-300 px-2 py-1 text-gray-900"
                  :value="item.qty"
                  @change="
                    (e: any) =>
                      cart.setQty(item.id as any, Number(e.target.value), item.variantId ?? null)
                  "
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700"
                  @click="cart.decrement(item.id as any, 1, item.variantId ?? null)"
                >
                  −
                </button>
                <button
                  type="button"
                  class="font-medium text-indigo-600 hover:text-indigo-500"
                  @click="removeItem(item.id as any, item.variantId ?? null)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="flex justify-between text-base font-medium text-gray-900">
        <p>Итого</p>
        <p>{{ formatPrice(subtotal) }}</p>
      </div>
      <p class="mt-0.5 text-sm text-gray-500">Доставка и налоги рассчитываются при оформлении.</p>
      <div class="mt-6">
        <button
          :disabled="cart.items.length === 0"
          class="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="goToCheckout"
        >
          Перейти к оформлению
        </button>
      </div>
    </template>
  </Drawer>
</template>
