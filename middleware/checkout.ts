import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  if (to.path !== '/checkout') return
  const cart = useCartStore()
  const ui = useUiStore()
  // Guard: require items in cart and the explicit flag set by cart button
  if (cart.items.length === 0 || !ui.allowCheckout) {
    return navigateTo('/')
  }
  // consume flag immediately
  ui.consumeCheckoutAccess()
})
