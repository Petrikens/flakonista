// server/api/products/[id].get.ts

import { eventHandler, getRouterParam, createError, setHeader, getQuery } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Product } from '~/types/product'

/**
 * Интерфейс детального ответа о продукте
 */
interface ProductDetailResponse extends Product {
  // Связанные товары (рекомендации)
  related_products?: Product[]
}

/**
 * Валидация UUID формата
 */
function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * API endpoint для получения детальной информации о продукте
 * GET /api/products/:id
 *
 * Path параметры:
 * - id: string (UUID) - ID продукта
 *
 * Query параметры:
 * - withRelated: boolean - включить похожие товары (по бренду/полу)
 * - relatedLimit: number - количество похожих товаров (по умолчанию 4)
 *
 * Кеширование: 10 минут (товары меняются редко)
 */
export default eventHandler(async (event: H3Event): Promise<ProductDetailResponse> => {
  // ✅ ВАЛИДАЦИЯ: Получаем и проверяем ID
  const idParam = getRouterParam(event, 'id')

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // ✅ ВАЛИДАЦИЯ: Проверяем формат UUID
  if (!isValidUUID(idParam)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product ID format. Expected UUID.',
    })
  }

  const productId = idParam

  // ✅ Query параметры
  const query = getQuery(event)
  const withRelated = query.withRelated === 'true' || query.withRelated === '1'
  const relatedLimit = Math.min(
    20,
    Math.max(1, Number.parseInt(String(query.relatedLimit ?? '4'), 10) || 4)
  )

  const client = await serverSupabaseClient(event)

  try {
    // ✅ ЗАПРОС: Получаем основной продукт
    const { data: product, error: productError } = await client
      .from('products')
      .select('*, brands:brand_id(id, name)')
      .eq('id', productId)
      .single()

    // ✅ ОБРАБОТКА ОШИБОК: Различаем 404 и 500
    if (productError) {
      // PGRST116 = Row not found (404)
      if (productError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found',
        })
      }

      // Другие ошибки БД (500)
      console.error('[API /products/:id] Database error:', productError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch product',
        data: process.dev ? { detail: productError.message } : undefined,
      })
    }

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    // ✅ СВЯЗАННЫЕ ТОВАРЫ: Если запрошены
    let relatedProducts: Product[] = []

    if (withRelated) {
      const { data: related, error: relatedError } = await client
        .from('products')
        .select('*, brands:brand_id(id, name)')
        .neq('id', productId) // Исключаем текущий товар
        .or(`brand_id.eq.${product.brand_id},gender.eq.${product.gender}`) // Тот же бренд ИЛИ пол
        .limit(relatedLimit)

      if (relatedError) {
        // Не критично, просто логируем
        console.warn('[API /products/:id] Failed to fetch related products:', relatedError)
      } else {
        relatedProducts = related ?? []
      }
    }

    // ✅ Формируем ответ
    const response: ProductDetailResponse = {
      ...product,
      related_products: withRelated ? relatedProducts : undefined,
    }

    // ✅ HTTP КЕШИРОВАНИЕ: 10 минут
    // Детали товара меняются редко
    setHeader(event, 'Cache-Control', 'public, max-age=600, s-maxage=600')

    // ✅ ETag на основе даты обновления товара
    const etag = `"product-${productId}-${product.date_create}"`
    setHeader(event, 'ETag', etag)

    return response
  } catch (err: any) {
    // Если это уже обработанная ошибка - пробрасываем
    if (err.statusCode) {
      throw err
    }

    // Неожиданная ошибка
    console.error('[API /products/:id] Unexpected error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
