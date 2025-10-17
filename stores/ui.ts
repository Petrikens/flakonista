import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isCartOpen: false,
    isFavoritesOpen: false,
    allowCheckout: false,
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
    enableCheckoutOnce() {
      // Set a one-shot flag to allow opening checkout
      this.allowCheckout = true
    },
    consumeCheckoutAccess() {
      // Reset flag after being checked on the checkout page
      this.allowCheckout = false
    },
  },
  persist: { key: 'ui_drawers_v1', paths: [] } as any,
})
