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
  PRICE_PRIORITY: ['price_2ml', 'price_5ml', 'price_10ml', 'price_20ml', 'price_100ml'] as const,
} as const

/**
 * Получить минимальную доступную цену товара
 */
export function getMinPrice(product: {
  price_2ml: number | null
  price_5ml: number | null
  price_10ml: number | null
  price_20ml: number | null
  price_100ml: number | null
}): number {
  const prices = [
    product.price_2ml,
    product.price_5ml,
    product.price_10ml,
    product.price_20ml,
    product.price_100ml,
  ].filter((price): price is number => price !== null && price > 0)

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
  { id: '2ml', ml: 2, key: 'price_2ml' },
  { id: '5ml', ml: 5, key: 'price_5ml' },
  { id: '10ml', ml: 10, key: 'price_10ml' },
  { id: '20ml', ml: 20, key: 'price_20ml' },
  { id: '100ml', ml: 100, key: 'price_100ml' },
] as const

export type BottleSizeKey = (typeof BOTTLE_SIZES)[number]['key']

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
export function createBottleVariants(product: {
  price_2ml: number | null
  price_5ml: number | null
  price_10ml: number | null
  price_20ml: number | null
  price_100ml: number | null
}): BottleVariant[] {
  const variants: BottleVariant[] = []

  for (const size of BOTTLE_SIZES) {
    const price = product[size.key]

    // Добавляем вариант только если поле существует
    if (price !== undefined) {
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
      id: '2ml',
      ml: 2,
      label: '2 мл',
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
