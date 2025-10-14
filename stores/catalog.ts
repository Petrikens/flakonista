import { defineStore } from 'pinia'
import type { Product } from '~/types/product'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    productsCatalog: [] as Product[],
  }),
  getters: {
    getproductsCatalog: (state) => () => state.productsCatalog,
  },
  actions: {
    updateProductsCatalog(catalog: Product[]) {
      console.log(catalog)
      this.productsCatalog = catalog
    },
  },
})
