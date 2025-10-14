export type SortOption =
  | { name: 'По новизне'; current?: boolean }
  | { name: 'Сначала дешевые'; current?: boolean }
  | { name: 'Сначала дорогие'; current?: boolean }

export interface FilterOption {
  value: string
  label: string
  checked: boolean
}

export interface FilterSection {
  id: 'brand' | 'seasons' | 'profile' | (string & {})
  name: string
  options: FilterOption[]
}
