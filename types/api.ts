import type { Product } from './product'
import type { Aromabox } from './product'

export interface ProductsListResponse {
  items: Product[]
  count: number
  page: number
  perPage: number
}

export interface ProductDetailResponse extends Product {
  relatedProducts?: Product[]
}

export interface AromaboxListResponse {
  items: Aromabox[]
  count: number
  page: number
  perPage: number
}

export interface AromaboxDetailResponse extends Aromabox {
  related_sets?: Aromabox[]
}
