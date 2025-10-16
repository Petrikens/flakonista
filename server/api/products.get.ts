// server/api/products.get.ts

import { serverSupabaseClient } from '#supabase/server'
import { eventHandler, createError, getQuery } from 'h3'
import type { H3Event } from 'h3'
import type { Gender, SeasonGroup } from '~/types/product'
import type { ProductsListResponse } from '~/types/api'
import {
  VALIDATION,
  isValidGender,
  isValidSeason,
  isValidSort,
  isValidProfileTag,
  filterValidValues,
} from '~/utils/validation'

/**
 * API endpoint для получения списка продуктов с фильтрацией и пагинацией
 * GET /api/products
 *
 * Query параметры:
 * - genders: string - пол (men,women,unisex)
 * - brands: string - ID брендов через запятую
 * - season: SeasonGroup - сезон
 * - profileAny: string - теги (любой из)
 * - profileAll: string - теги (все)
 * - sort: string - сортировка (newest|price_asc|price_desc)
 * - page: number - номер страницы
 * - perPage: number - элементов на странице
 */
export default eventHandler(async (event: H3Event): Promise<ProductsListResponse> => {
  const client = await serverSupabaseClient(event)

  // ✅ Получаем query параметры
  const query = getQuery(event)

  // ✅ ВАЛИДАЦИЯ И ПАРСИНГ: Genders
  const gendersRaw = String(query.genders ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const genders = filterValidValues(gendersRaw, isValidGender) as Gender[]

  if (gendersRaw.length > 0 && genders.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid gender values. Allowed: ${VALIDATION.GENDERS.join(', ')}`,
    })
  }

  // ✅ ВАЛИДАЦИЯ: Brands (UUID формат)
  const brandsRaw = String(query.brands ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Простая проверка на UUID формат (опционально)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const brands = brandsRaw.filter((id) => uuidRegex.test(id))

  // ✅ ВАЛИДАЦИЯ: Season
  let season: SeasonGroup | null = null
  if (query.season) {
    const seasonValue = String(query.season)
    if (isValidSeason(seasonValue)) {
      season = seasonValue
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid season. Allowed: ${VALIDATION.SEASONS.join(', ')}`,
      })
    }
  }

  // ✅ ВАЛИДАЦИЯ: Profile tags (any)
  const profileAnyRaw = String(query.profileAny ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const profileAny = filterValidValues(profileAnyRaw, isValidProfileTag)

  // ✅ ВАЛИДАЦИЯ: Profile tags (all)
  const profileAllRaw = String(query.profileAll ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const profileAll = filterValidValues(profileAllRaw, isValidProfileTag)

  // ✅ ВАЛИДАЦИЯ: Sort
  const sortValue = String(query.sort ?? 'newest')
  if (!isValidSort(sortValue)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid sort option. Allowed: ${VALIDATION.SORT_OPTIONS.join(', ')}`,
    })
  }
  const sort = sortValue

  // ✅ ВАЛИДАЦИЯ: Pagination
  const page = Math.max(
    VALIDATION.PAGINATION.MIN_PAGE,
    Math.min(VALIDATION.PAGINATION.MAX_PAGE, Number.parseInt(String(query.page ?? '1'), 10) || 1)
  )

  const perPage = Math.max(
    VALIDATION.PAGINATION.MIN_PER_PAGE,
    Math.min(
      VALIDATION.PAGINATION.MAX_PER_PAGE,
      Number.parseInt(String(query.perPage ?? '20'), 10) || VALIDATION.PAGINATION.DEFAULT_PER_PAGE
    )
  )

  // ✅ Рассчет диапазона
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // ✅ Построение запроса к Supabase
  let request = client.from('products').select('*, brands:brand_id(id, name)', { count: 'exact' })

  // Применяем фильтры
  if (genders.length > 0) {
    request = request.in('gender', genders)
  }

  if (brands.length > 0) {
    request = request.in('brand_id', brands)
  }

  if (season) {
    request = request.eq('season_group', season)
  }

  if (profileAny.length > 0) {
    request = request.overlaps('profile_tags', profileAny)
  }

  if (profileAll.length > 0) {
    request = request.contains('profile_tags', profileAll)
  }

  // Сортировка
  switch (sort) {
    case 'price_asc':
      request = request.order('price_10ml', { ascending: true, nullsFirst: true })
      break
    case 'price_desc':
      request = request.order('price_10ml', { ascending: false, nullsLast: true })
      break
    case 'newest':
    default:
      request = request.order('date_create', { ascending: false, nullsLast: true })
      break
  }

  // Пагинация
  request = request.range(from, to)

  // ✅ Выполнение запроса
  const { data, error, count } = await request

  if (error) {
    console.error('[API /products] Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
      // В production не показываем детали ошибки БД
      data: process.dev ? { detail: error.message } : undefined,
    })
  }

  // ✅ Возвращаем типизированный ответ
  return {
    items: data ?? [],
    count: count ?? 0,
    page,
    perPage,
  }
})
