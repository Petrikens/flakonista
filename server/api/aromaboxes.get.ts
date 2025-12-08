import { serverSupabaseClient } from '#supabase/server'
import { eventHandler, createError, getQuery, setHeader } from 'h3'
import type { H3Event } from 'h3'
import type { Aromabox } from '~/types/product'

export default eventHandler(async (event: H3Event): Promise<Aromabox[]> => {
  const client = await serverSupabaseClient(event)

  try {
    let request = client.from('perfume_sets').select('*').order('name', { ascending: true })

    const { data, error } = await request

    if (error) {
      console.error('[API /brands] Database error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch aromaboxes',
        data: process.dev ? { detail: error.message } : undefined,
      })
    }

    const aromaboxes: Aromabox[] = data ?? []

    setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300')

    return aromaboxes
  } catch (err: any) {
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
