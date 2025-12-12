import { useUiStore } from '~/stores/ui'

// Workaround: some mobile browsers keep the <body> inert after returning from background
// when Headless UI dialogs were open. On visibility return we clear stray inert attributes
// and close global drawers to force a clean state.
export default defineNuxtPlugin(() => {
  const ui = useUiStore()

  function clearInert() {
    document.documentElement.removeAttribute('inert')
    document
      .querySelectorAll('[inert]')
      .forEach((el) => el.removeAttribute('inert'))
  }

  function resetOverlays() {
    ui.closeCart()
    ui.closeFavorites()
  }

  function handleRestore() {
    clearInert()
    resetOverlays()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleRestore()
  })

  // pageshow fires when returning from bfcache; useful for Safari
  window.addEventListener('pageshow', handleRestore)
})
