// server/api/brands.get.ts

import { serverSupabaseClient } from '#supabase/server'
import { eventHandler, createError, getQuery, setHeader } from 'h3'
import type { H3Event } from 'h3'
import type { Brand } from '~/types/product'

/**
 * Интерфейс ответа API для списка брендов
 */
interface BrandsResponse extends Brand {
  // Опционально: количество продуктов бренда
  products_count?: number
}

/**
 * API endpoint для получения списка брендов
 * GET /api/brands
 *
 * Query параметры:
 * - withCount: boolean - включить количество товаров для каждого бренда
 *
 * Кеширование: 5 минут (бренды редко меняются)
 */
export default eventHandler(async (event: H3Event): Promise<BrandsResponse[]> => {
  const client = await serverSupabaseClient(event)

  // ✅ Получаем query параметры
  const query = getQuery(event)
  const withCount = query.withCount === 'true' || query.withCount === '1'

  try {
    let request = client
      .from('brands')
      .select(withCount ? 'id, name, products:products(count)' : 'id, name')
      .order('name', { ascending: true })

    const { data, error } = await request

    if (error) {
      console.error('[API /brands] Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch brands',
        data: process.dev ? { detail: error.message } : undefined,
      })
    }

    // ✅ Трансформация данных если запрошен подсчет
    let brands: BrandsResponse[]

    if (withCount) {
      brands = (data ?? []).map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        products_count: brand.products?.[0]?.count ?? 0,
      }))
    } else {
      brands = (data ?? []).map((brand: any) => ({
        id: brand.id,
        name: brand.name,
      }))
    }

    // ✅ ДОБАВЛЕНО: HTTP кеширование (5 минут)
    // Бренды редко меняются, можно кешировать
    setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300')

    // ✅ ДОБАВЛЕНО: ETag для условных запросов (опционально)
    const etag = `"brands-${brands.length}-${withCount}"`
    setHeader(event, 'ETag', etag)

    return brands
  } catch (err: any) {
    // Если ошибка уже createError - пробрасываем
    if (err.statusCode) {
      throw err
    }

    // Неожиданная ошибка
    console.error('[API /brands] Unexpected error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
