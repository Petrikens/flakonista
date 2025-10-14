import { defineStore } from 'pinia'
import type { Product } from '~/types/product'

type Id = Product['id']

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as Product[],
    ids: {} as Record<string | number, true>,
  }),

  getters: {
    count: (s) => s.items.length,
    isFavorite: (s) => (id: Id) => !!s.ids[id],
    products: (s) => s.items,
  },

  actions: {
    add(product: Product) {
      const id = product.id as Id
      if (this.ids[id]) return
      this.items.push(product)
      this.ids[id] = true
    },
    remove(id: Id) {
      if (!this.ids[id]) return
      this.items = this.items.filter((p) => p.id !== id)
      delete this.ids[id]
    },
    toggle(product: Product) {
      const id = product.id as Id
      this.ids[id] ? this.remove(id) : this.add(product)
    },
    clear() {
      this.items = []
      this.ids = {}
    },
  },

  persist: { key: 'favorites_v1', paths: ['items', 'ids'] },
})
