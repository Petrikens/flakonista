// server/utils/validation.ts

import type { Gender, SeasonGroup } from '~/types/product'
import { PROFILE_TAGS } from '~/utils/catalog'

/**
 * Константы для валидации API запросов
 */
export const VALIDATION = {
  // Допустимые значения пола
  GENDERS: ['men', 'women', 'unisex'] as const,

  // Допустимые значения сезонов
  SEASONS: ['fall_winter', 'spring_summer', 'all_seasons'] as const,

  // Допустимые значения сортировки
  SORT_OPTIONS: ['newest', 'price_asc', 'price_desc'] as const,

  // Допустимые профильные теги (из utils/catalog)
  PROFILE_TAGS: PROFILE_TAGS,

  // Лимиты пагинации
  PAGINATION: {
    MIN_PAGE: 1,
    MAX_PAGE: 1000,
    MIN_PER_PAGE: 1,
    MAX_PER_PAGE: 100,
    DEFAULT_PER_PAGE: 20,
  },
} as const

/**
 * Проверка, является ли строка валидным полом
 */
export function isValidGender(value: string): value is Gender {
  return VALIDATION.GENDERS.includes(value as any)
}

/**
 * Проверка, является ли строка валидным сезоном
 */
export function isValidSeason(value: string): value is SeasonGroup {
  return VALIDATION.SEASONS.includes(value as any)
}

/**
 * Проверка, является ли строка валидной сортировкой
 */
export function isValidSort(value: string): value is 'newest' | 'price_asc' | 'price_desc' {
  return VALIDATION.SORT_OPTIONS.includes(value as any)
}

/**
 * Проверка, является ли строка валидным профильным тегом
 */
export function isValidProfileTag(value: string): boolean {
  return VALIDATION.PROFILE_TAGS.includes(value as any)
}

/**
 * Фильтрация массива строк, оставляя только валидные значения
 */
export function filterValidValues<T>(
  values: string[],
  validator: (v: string) => boolean
): string[] {
  return values.filter(validator)
}
