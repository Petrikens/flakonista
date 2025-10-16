import { defineStore } from 'pinia'
import type { Product } from '~/types/product'
import type { BottleVariant } from '~/utils/constants'

type Id = Product['id']

export interface CartItem {
  id: Id
  product: Product
  qty: number
  variantId?: string | null
  variant?: Pick<BottleVariant, 'id' | 'ml' | 'label' | 'price'> | null
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    count: (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
    uniqueCount: (s) => s.items.length,
    // Количество по продукту (суммарно по всем вариантам)
    getQty: (s) => (id: Id) =>
      s.items.filter((i) => i.id === id).reduce((sum, i) => sum + i.qty, 0),
    // Есть ли хотя бы один вариант товара в корзине
    has: (s) => (id: Id) => s.items.some((i) => i.id === id),
    // Количество по конкретному варианту
    getQtyByVariant:
      (s) =>
      (id: Id, variantId: string | null = null) =>
        s.items.find((i) => i.id === id && (i.variantId ?? null) === variantId)?.qty ?? 0,
  },

  actions: {
    add(product: Product, delta = 1, variant?: BottleVariant | null) {
      const id = product.id as Id
      const variantId = variant?.id ?? null
      const idx = this.items.findIndex((i) => i.id === id && (i.variantId ?? null) === variantId)
      if (idx === -1) {
        this.items.push({
          id,
          product,
          qty: Math.max(1, delta),
          variantId,
          variant: variant
            ? { id: variant.id, ml: variant.ml, label: variant.label, price: variant.price }
            : null,
        })
      } else {
        this.items[idx].qty = Math.max(1, this.items[idx].qty + delta)
      }
    },
    decrement(id: Id, delta = 1, variantId: string | null = null) {
      const idx = this.items.findIndex((i) => i.id === id && (i.variantId ?? null) === variantId)
      if (idx === -1) return
      const next = this.items[idx].qty - delta
      if (next <= 0) this.items.splice(idx, 1)
      else this.items[idx].qty = next
    },
    setQty(id: Id, qty: number, variantId: string | null = null) {
      const idx = this.items.findIndex((i) => i.id === id && (i.variantId ?? null) === variantId)
      if (idx === -1) return
      if (qty <= 0) this.items.splice(idx, 1)
      else this.items[idx].qty = qty
    },
    remove(id: Id, variantId: string | null = null) {
      const idx = this.items.findIndex((i) => i.id === id && (i.variantId ?? null) === variantId)
      if (idx !== -1) this.items.splice(idx, 1)
    },
    clear() {
      this.items = []
    },
  },

  persist: { key: 'cart_v1', paths: ['items'] } as any,
})
