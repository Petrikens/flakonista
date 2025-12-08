import type { Aromabox, Product } from '~/types/product'

/**
 * Преобразует сущность аромабокса к структуре Product,
 * чтобы переиспользовать общие компоненты каталога.
 */
export function normalizeAromabox(aromabox: Aromabox): Product {
  return {
    id: aromabox.id,
    name: aromabox.name,
    gender: aromabox.gender,
    suits: aromabox.suits,
    benefits: aromabox.benefits,
    season_group: aromabox.season_group,
    occasions: null,
    profile_tags: aromabox.profile_tags ?? [],
    date_create: aromabox.created_at,
    price_3ml: aromabox.price_3ml ?? null,
    price_5ml: aromabox.price_5ml ?? null,
    price_10ml: aromabox.price_10ml ?? null,
    price_15ml: null,
    price_60ml: null,
    price_70ml: null,
    price_80ml: null,
    price_90ml: null,
    price_100ml: null,
    price_105ml: null,
    top_notes: null,
    heart_notes: null,
    basic_notes: null,
    brand_id: 'aromabox',
    image_path: aromabox.image_path ?? [],
    brands: null,
    brand: undefined,
  }
}

/**
 * Быстрая проверка, что продукт относится к аромабоксам.
 */
export function isAromaboxProduct(product: Pick<Product, 'brand_id'>): boolean {
  return product.brand_id === 'aromabox'
}
