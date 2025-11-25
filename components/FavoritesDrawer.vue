<script setup lang="ts">
import type { Product } from '~/types/product'
import {
  generateProductAlt,
  CONSTANTS,
  createBottleVariants,
  formatPrice,
  type BottleVariant,
} from '~/utils/constants'

const ui = useUiStore()
const favorites = useFavoritesStore() as ReturnType<typeof useFavoritesStore>
const cart = useCartStore()
const router = useRouter()

const selectedVariants = ref<Record<string, string | null>>({})

watch(
  () => favorites.items.map((product) => product.id),
  () => {
    const ids = new Set(favorites.items.map((product) => productKey(product.id)))
    const next: Record<string, string | null> = { ...selectedVariants.value }

    favorites.items.forEach((product) => {
      const key = productKey(product.id)
      const variants = variantsFor(product)
      if (!variants.length) {
        next[key] = null
        return
      }
      if (!next[key] || !variants.some((variant) => variant.id === next[key])) {
        const fallback = pickDefaultVariant(variants)
        next[key] = fallback?.id ?? null
      }
    })

    Object.keys(next).forEach((key) => {
      if (!ids.has(key)) delete next[key]
    })

    selectedVariants.value = next
  },
  { immediate: true }
)

function productKey(id: Product['id']): string {
  return String(id)
}

function variantsFor(product: Product): BottleVariant[] {
  return createBottleVariants(product)
}

function pickDefaultVariant(variants: BottleVariant[]): BottleVariant | null {
  return variants.find((variant) => variant.inStock && variant.price != null) ?? variants[0] ?? null
}

function getSelectedVariant(product: Product): BottleVariant | null {
  const key = productKey(product.id)
  const variants = variantsFor(product)
  const selectedId = selectedVariants.value[key]
  const current = variants.find((variant) => variant.id === selectedId) ?? null

  if (current) return current

  const fallback = pickDefaultVariant(variants)
  if (fallback) {
    selectedVariants.value = {
      ...selectedVariants.value,
      [key]: fallback.id,
    }
  }
  return fallback
}

function handleVariantChange(product: Product, event: Event) {
  const target = event.target as HTMLSelectElement
  const key = productKey(product.id)
  selectedVariants.value = {
    ...selectedVariants.value,
    [key]: target.value || null,
  }
}

function selectedVariantLabel(product: Product): string {
  return getSelectedVariant(product)?.label ?? 'Нет в наличии'
}

function selectedVariantPriceText(product: Product): string | null {
  const variant = getSelectedVariant(product)
  if (!variant || variant.price == null) return null
  return formatPrice(variant.price)
}

function canAddToCart(product: Product): boolean {
  const variant = getSelectedVariant(product)
  return !!variant && variant.price != null
}

function addFavoriteToCart(product: Product) {
  const variant = getSelectedVariant(product)
  if (!variant || variant.price == null) return
  cart.add(product, 1, variant)
  ui.closeFavorites()
  ui.closeCart()
}

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
              :src="product.image_path[0] || CONSTANTS.PRODUCT_IMAGE_PLACEHOLDER"
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
            <div class="mt-3">
              <label
                class="text-xs font-medium text-gray-500"
                :for="`favorite-variant-${product.id}`"
              >
                Объём
              </label>
              <select
                :id="`favorite-variant-${product.id}`"
                class="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                :value="
                  selectedVariants[productKey(product.id)] ?? getSelectedVariant(product)?.id ?? ''
                "
                @change="handleVariantChange(product, $event)"
              >
                <option
                  v-for="variant in variantsFor(product)"
                  :key="variant.id"
                  :value="variant.id"
                  :disabled="variant.price == null"
                >
                  {{ variant.label }}
                  {{
                    variant.price != null ? `— ${formatPrice(variant.price)}` : ' — нет в наличии'
                  }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                Выбранный объём:
                <span class="font-medium text-gray-900">{{ selectedVariantLabel(product) }}</span>
                <template v-if="selectedVariantPriceText(product)">
                  • {{ selectedVariantPriceText(product) }}
                </template>
              </p>
            </div>
            <div class="mt-3 flex items-center gap-3 text-sm">
              <button
                class="text-primary hover:text-primary/80"
                :disabled="!canAddToCart(product)"
                @click="addFavoriteToCart(product)"
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
