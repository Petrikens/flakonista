<script setup lang="ts">
import Drawer from '~/components/Drawer.vue'
import { useUiStore } from '~/stores/ui'
import { useFavoritesStore } from '~/stores/favorites'
import { useCartStore } from '~/stores/cart'
import { generateProductAlt, CONSTANTS } from '~/utils/constants'
import { useRouter } from 'vue-router'

const ui = useUiStore()
const favorites = useFavoritesStore() as ReturnType<typeof useFavoritesStore>
const cart = useCartStore()
const router = useRouter()

function openProduct(id: string) {
  router.push(`/products/${id}`)
}
</script>

<template>
  <Drawer v-model="ui.isFavoritesOpen" title="Избранное">
    <div v-if="favorites.items.length === 0" class="text-sm text-gray-500">
      Список избранного пуст
    </div>
    <div v-else class="flow-root">
      <ul role="list" class="-my-6 divide-y divide-gray-200">
        <li v-for="product in favorites.items" :key="product.id" class="flex py-6">
          <NuxtLink
            :to="`/products/${product.id}`"
            class="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200"
            @click="ui.closeFavorites(), ui.closeCart()"
          >
            <img
              :src="product.image_path || CONSTANTS.PRODUCT_IMAGE_PLACEHOLDER"
              :alt="generateProductAlt(product.name, product.brand?.name || product.brands?.name)"
              class="size-full object-cover"
            />
          </NuxtLink>

          <div class="ml-4 flex flex-1 flex-col">
            <div class="flex justify-between text-base font-medium text-gray-900">
              <h3 class="pr-2">
                <NuxtLink
                  :to="`/products/${product.id}`"
                  @click="ui.closeFavorites(), ui.closeCart()"
                >
                  {{ product.name }}
                </NuxtLink>
              </h3>
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                @click="
                  favorites.$patch((s) => {
                    s.items = s.items.filter((p) => p.id !== product.id)
                    delete s.ids[product.id as any]
                  })
                "
              >
                Удалить
              </button>
            </div>
            <div class="mt-2 flex items-center gap-3 text-sm">
              <button
                class="text-indigo-600 hover:text-indigo-500"
                @click="cart.add(product), ui.closeFavorites(), ui.closeCart()"
              >
                В корзину
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </Drawer>
</template>
