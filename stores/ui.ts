import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isCartOpen: false,
    isFavoritesOpen: false,
  }),
  actions: {
    openCart() {
      this.isCartOpen = true
    },
    closeCart() {
      this.isCartOpen = false
    },
    toggleCart() {
      this.isCartOpen = !this.isCartOpen
    },
    openFavorites() {
      this.isFavoritesOpen = true
    },
    closeFavorites() {
      this.isFavoritesOpen = false
    },
    toggleFavorites() {
      this.isFavoritesOpen = !this.isFavoritesOpen
    },
  },
  persist: { key: 'ui_drawers_v1', paths: [] } as any,
})
