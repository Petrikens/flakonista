// utils/constants.ts

/**
 * Константы приложения
 */
export const CONSTANTS = {
  // Placeholder изображения для товаров
  PRODUCT_IMAGE_PLACEHOLDER: '/images/product-placeholder.png',

  // Минимальная цена для отображения (если все цены null)
  MIN_DISPLAY_PRICE: 0,

  // Приоритет цен для отображения (от меньшего к большему объему)
  PRICE_PRIORITY: [
    'price_3ml',
    'price_5ml',
    'price_10ml',
    'price_15ml',
    'price_60ml',
    'price_70ml',
    'price_80ml',
    'price_90ml',
    'price_100ml',
    'price_105ml',
  ] as const,
} as const

/**
 * Получить минимальную доступную цену товара
 */
export function getMinPrice(product: {
  price_3ml?: number | null | undefined
  price_5ml?: number | null | undefined
  price_10ml?: number | null | undefined
  price_15ml?: number | null | undefined
  price_60ml?: number | null | undefined
  price_70ml?: number | null | undefined
  price_80ml?: number | null | undefined
  price_90ml?: number | null | undefined
  price_100ml?: number | null | undefined
  price_105ml?: number | null | undefined
}): number {
  const prices = [
    product?.price_3ml,
    product?.price_5ml,
    product?.price_10ml,
    product?.price_15ml,
    product?.price_60ml,
    product?.price_70ml,
    product?.price_80ml,
    product?.price_90ml,
    product?.price_100ml,
    product?.price_105ml,
  ].filter((price): price is number => price !== null && price !== undefined && price > 0)

  return prices.length > 0 ? Math.min(...prices) : CONSTANTS.MIN_DISPLAY_PRICE
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Генерация alt текста для изображения товара
 */
export function generateProductAlt(productName: string, brandName?: string): string {
  return brandName
    ? `Фотография парфюма ${productName} от ${brandName}`
    : `Фотография парфюма ${productName}`
}

export const BOTTLE_SIZES = [
  { id: '3ml', ml: 3, key: 'price_3ml' },
  { id: '5ml', ml: 5, key: 'price_5ml' },
  { id: '10ml', ml: 10, key: 'price_10ml' },
  { id: '15ml', ml: 15, key: 'price_15ml' },
  { id: '60ml', ml: 60, key: 'price_60ml' },
  { id: '70ml', ml: 70, key: 'price_70ml' },
  { id: '80ml', ml: 80, key: 'price_80ml' },
  { id: '90ml', ml: 90, key: 'price_90ml' },
  { id: '100ml', ml: 100, key: 'price_100ml' },
  { id: '105ml', ml: 105, key: 'price_105ml' },
] as const

export type BottleSizeKey = (typeof BOTTLE_SIZES)[number]['key']
export type BottlePriceFields = Partial<Record<BottleSizeKey, number | null | undefined>>

/**
 * Интерфейс варианта флакона для UI
 */
export interface BottleVariant {
  id: string
  ml: number
  label: string
  price: number | null
  inStock: boolean
}

/**
 * Создать варианты флаконов из продукта
 */
export function createBottleVariants(product: BottlePriceFields): BottleVariant[] {
  const variants: BottleVariant[] = []

  for (const size of BOTTLE_SIZES) {
    const price = product[size.key] ?? null

    // Добавляем вариант только если поле существует
    if (price) {
      variants.push({
        id: size.id,
        ml: size.ml,
        label: `${size.ml} мл`,
        price: typeof price === 'number' ? price : null,
        inStock: typeof price === 'number' && price > 0,
      })
    }
  }

  // Fallback: если нет вариантов, добавляем один неактивный
  if (variants.length === 0) {
    variants.push({
      id: '3ml',
      ml: 3,
      label: '3 мл',
      price: null,
      inStock: false,
    })
  }

  return variants
}

/**
 * Парсинг нот аромата из строки
 */
export function parseNotes(notesString: string | null): string[] {
  if (!notesString) return []
  return notesString
    .split(',')
    .map((note) => note.trim())
    .filter(Boolean)
}

export const SEASON_LABELS: Record<string, string> = {
  all_seasons: 'Всесезонный',
  spring_summer: 'Весна–Лето',
  fall_winter: 'Осень–Зима',
} as const

/**
 * Получить название сезона
 */
export function getSeasonLabel(season: string | null | undefined): string {
  if (!season) return 'Не указан'
  return SEASON_LABELS[season] || season
}
