import { defineStore } from 'pinia'
import type { Product } from '~/types/product'

type Id = Product['id']

export interface CartItem {
  id: Id
  product: Product
  qty: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    count: (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
    uniqueCount: (s) => s.items.length,
    getQty: (s) => (id: Id) => s.items.find((i) => i.id === id)?.qty ?? 0,
    has: (s) => (id: Id) => s.items.some((i) => i.id === id),
  },

  actions: {
    add(product: Product, delta = 1) {
      const id = product.id as Id
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx === -1) {
        this.items.push({ id, product, qty: Math.max(1, delta) })
      } else {
        this.items[idx].qty = Math.max(1, this.items[idx].qty + delta)
      }
    },
    decrement(id: Id, delta = 1) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx === -1) return
      const next = this.items[idx].qty - delta
      if (next <= 0) this.items.splice(idx, 1)
      else this.items[idx].qty = next
    },
    setQty(id: Id, qty: number) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx === -1) return
      if (qty <= 0) this.items.splice(idx, 1)
      else this.items[idx].qty = qty
    },
    remove(id: Id) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx !== -1) this.items.splice(idx, 1)
    },
    clear() {
      this.items = []
    },
  },

  persist: { key: 'cart_v1', paths: ['items'] },
})
