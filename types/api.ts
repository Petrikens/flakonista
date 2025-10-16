import type { Product } from './product'

export interface ProductsListResponse {
  items: Product[]
  count: number
  page: number
  perPage: number
}

export interface ProductDetailResponse extends Product {
  relatedProducts?: Product[]
}
