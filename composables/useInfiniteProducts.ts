import { watchDebounced } from '@vueuse/core'
import type { Product, Brand, Gender, SeasonGroup } from '~/types/product'
import type { SortOption, FilterSection, FilterOption } from '~/types/catalog'
import type { ProductsListResponse } from '~/types/api'
import { SEASONS, PROFILE_TAGS } from '~/utils/catalog'

interface UseInfiniteProductsOptions {
  genders: Gender[]
  pageSize?: number
  initialStateKey?: string
}

interface ProductsQueryParams {
  genders: string
  sort: 'newest' | 'price_asc' | 'price_desc'
  page: number
  perPage: number
  brands?: string
  season?: SeasonGroup
  profileAny?: string
}
export const useInfiniteProducts = (opts: UseInfiniteProductsOptions) => {
  const keySuffix = [...opts.genders].sort().join(',')

  // Локальные состояния (не сохраняются при навигации между страницами)
  const products = ref<Product[]>([])
  const total = ref<number>(0)
  const page = ref<number>(1)
  const perPage = ref<number>(opts.pageSize ?? 20)

  const initialLoading = ref<boolean>(true)
  const isLoadingMore = ref<boolean>(false)
  const isLoadingBrands = ref<boolean>(false)
  const error = ref<string | null>(null)

  const selected = reactive({
    brandIds: [] as string[],
    season: '' as '' | SeasonGroup,
    profileAny: [] as string[],
  })

  // Кеш брендов сохраняется между страницами (бренды меняются редко)
  const brandOptionsRaw = useState<FilterOption[]>(`catalog:brands:${keySuffix}`, () => [])

  const filters = computed<FilterSection[]>(() => [
    {
      id: 'brand',
      name: 'Бренд',
      options: brandOptionsRaw.value.map((b: FilterOption) => ({
        ...b,
        checked: selected.brandIds.includes(String(b.value)),
      })),
    },
    {
      id: 'seasons',
      name: 'Сезонность',
      options: SEASONS.map((s) => ({
        value: s.value,
        label: s.label,
        checked: selected.season === s.value,
      })),
    },
    {
      id: 'profile',
      name: 'Профиль',
      options: PROFILE_TAGS.map((t) => ({
        value: t,
        label: t,
        checked: selected.profileAny.includes(t),
      })),
    },
  ])

  // Сортировки
  const sortOptions: SortOption[] = [
    { name: 'По новизне' },
    { name: 'Сначала дешевые' },
    { name: 'Сначала дорогие' },
  ]
  const selectedSort = ref<SortOption>(sortOptions[0])

  const orderSpec = computed(() => {
    switch (selectedSort.value.name) {
      case 'Сначала дешевые':
        return { sort: 'price_asc' as const }
      case 'Сначала дорогие':
        return { sort: 'price_desc' as const }
      case 'По новизне':
      default:
        return { sort: 'newest' as const }
    }
  })

  const hasNext = computed(() => products.value.length < total.value)
  const isEmpty = computed(() => !initialLoading.value && products.value.length === 0)

  const api = useApi()

  // Инициализация из SSR данных
  // Используем useState с безопасным инициализатором
  // Nuxt автоматически синхронизирует данные из payload, если они есть
  if (opts.initialStateKey) {
    // Безопасный инициализатор: возвращает null, но Nuxt получит данные из payload при гидратации
    const initial = useState<ProductsListResponse | null>(opts.initialStateKey, () => null)

    // Инициализируем состояние из SSR данных
    // На сервере: данные будут доступны сразу из useState
    // На клиенте: данные будут доступны после гидратации из payload
    if (initial.value?.items && initial.value.items.length > 0) {
      products.value = initial.value.items
      total.value = initial.value.count ?? 0
      page.value = initial.value.items.length === perPage.value ? 2 : 1
      initialLoading.value = false
      isLoadingMore.value = false
      error.value = null
    }

    // Дополнительная проверка для клиента: читаем напрямую из payload.state
    // useState сохраняет данные в payload.state, а useAsyncData - в payload.data
    if (process.client) {
      const nuxtApp = useNuxtApp()
      // Проверяем payload.state (где useState хранит данные)
      const stateData = (nuxtApp.payload.state as any)?.[opts.initialStateKey] as
        | ProductsListResponse
        | undefined
      // Также проверяем payload.data (где useAsyncData хранит данные)
      const asyncData = nuxtApp.payload.data[opts.initialStateKey] as
        | { data?: ProductsListResponse }
        | undefined
      const payloadData = stateData ?? asyncData?.data

      if (payloadData?.items && payloadData.items.length > 0 && products.value.length === 0) {
        products.value = payloadData.items
        total.value = payloadData.count ?? 0
        page.value = payloadData.items.length === perPage.value ? 2 : 1
        initialLoading.value = false
        isLoadingMore.value = false
        error.value = null
      }
    }
  }

  // Построение параметров запроса из текущего состояния
  function buildQueryParams(extra?: { page?: number }): ProductsQueryParams {
    const q: ProductsQueryParams = {
      genders: opts.genders.join(','),
      sort: orderSpec.value.sort,
      page: extra?.page ?? page.value,
      perPage: perPage.value,
    }

    if (selected.brandIds.length) q.brands = selected.brandIds.join(',')
    if (selected.season) q.season = selected.season
    if (selected.profileAny.length) q.profileAny = selected.profileAny.join(',')

    return q
  }

  async function loadBrands() {
    if (brandOptionsRaw.value.length > 0) return // кеш
    isLoadingBrands.value = true
    try {
      const data = await api.get<Brand[]>('/api/brands')
      brandOptionsRaw.value = (data ?? []).map((b) => ({
        value: b.id,
        label: b.name,
        checked: false,
      }))
    } catch (e: any) {
      console.error('[useInfiniteProducts] Failed to load brands:', e?.message)
    } finally {
      isLoadingBrands.value = false
    }
  }

  async function fetchProducts({ reset = false }: { reset?: boolean } = {}) {
    if (reset) {
      page.value = 1
      initialLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    try {
      error.value = null

      const res = await api.get<ProductsListResponse>('/api/products', buildQueryParams())

      if (typeof res.count === 'number') total.value = res.count
      const incoming = res.items ?? []

      if (reset) {
        products.value = incoming
      } else {
        const byId = new Map<string, Product>()
        for (const p of products.value) byId.set(p.id, p)
        for (const p of incoming) byId.set(p.id, p)
        products.value = Array.from(byId.values())
      }

      if (incoming.length === perPage.value) {
        page.value = (res.page ?? page.value) + 1
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Не удалось загрузить товары'
      console.error('[useInfiniteProducts] Failed to fetch products:', e)
    } finally {
      if (reset) initialLoading.value = false
      else isLoadingMore.value = false
    }
  }

  function loadNextPage() {
    if (!hasNext.value) return
    if (isLoadingMore.value || initialLoading.value) return
    if (error.value) error.value = null
    fetchProducts()
  }

  function resetFilters() {
    selected.brandIds = []
    selected.season = ''
    selected.profileAny = []
  }

  function onSortSelect(option: SortOption) {
    selectedSort.value = option
  }

  function handleToggle(payload: { sectionId: string; value: string; checked: boolean }) {
    switch (payload.sectionId) {
      case 'brand':
        selected.brandIds = payload.checked
          ? Array.from(new Set([...selected.brandIds, payload.value]))
          : selected.brandIds.filter((id) => id !== payload.value)
        break

      case 'seasons': {
        selected.season = payload.checked ? (payload.value as SeasonGroup) : ''
        break
      }

      case 'profile':
        selected.profileAny = payload.checked
          ? Array.from(new Set([...selected.profileAny, payload.value]))
          : selected.profileAny.filter((v) => v !== payload.value)
        break
    }
  }

  watchDebounced(
    () => [
      selected.brandIds.slice(),
      selected.season,
      selected.profileAny.slice(),
      orderSpec.value.sort,
      perPage.value,
    ],
    () => fetchProducts({ reset: true }),
    { debounce: 250, maxWait: 600 }
  )

  return {
    products,
    total,

    page,
    perPage,
    hasNext,
    isEmpty,
    error,

    initialLoading,
    isLoadingMore,
    isLoadingBrands,

    filters,
    selected,
    sortOptions,
    selectedSort,
    orderSpec,

    fetchProducts,
    loadNextPage,
    resetFilters,
    loadBrands,
    onSortSelect,
    handleToggle,
  }
}
