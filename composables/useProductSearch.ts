import { watchDebounced } from '@vueuse/core'
import type { ProductsListResponse } from '~/types/api'
import type { Product } from '~/types/product'
import { VALIDATION } from '~/utils/validation'

interface UseProductSearchOptions {
  limit?: number
}

export const useProductSearch = (options: UseProductSearchOptions = {}) => {
  const api = useApi()

  const query = ref('')
  const results = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isOpen = ref(false)

  const limit = options.limit ?? 6
  const normalizedQuery = computed(() => query.value.trim())

  async function executeSearch() {
    const term = normalizedQuery.value

    if (term.length < VALIDATION.SEARCH.MIN_LENGTH) {
      results.value = []
      isOpen.value = false
      error.value = null
      loading.value = false
      return
    }

    loading.value = true
    const requestedTerm = term

    try {
      const response = await api.get<ProductsListResponse>('/api/products', {
        search: term,
        page: 1,
        perPage: limit,
      })

      if (requestedTerm !== normalizedQuery.value) return

      results.value = response.items ?? []
      error.value = null
    } catch (err: any) {
      if (requestedTerm !== normalizedQuery.value) return

      error.value = err?.message ?? 'Не удалось выполнить поиск'
      results.value = []
    } finally {
      if (requestedTerm === normalizedQuery.value) {
        loading.value = false
      }
    }
  }

  watchDebounced(
    () => query.value,
    () => executeSearch(),
    { debounce: 250, maxWait: 600 }
  )

  function openDropdown() {
    isOpen.value = true
  }

  function closeDropdown() {
    isOpen.value = false
  }

  function clear() {
    query.value = ''
    results.value = []
    isOpen.value = false
    error.value = null
  }

  const hasSufficientQuery = computed(
    () => normalizedQuery.value.length >= VALIDATION.SEARCH.MIN_LENGTH
  )

  return {
    query,
    results,
    loading,
    error,
    isOpen,
    hasSufficientQuery,
    executeSearch,
    openDropdown,
    closeDropdown,
    clear,
  }
}
