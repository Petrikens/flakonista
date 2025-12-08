import { eventHandler, getRouterParam, createError, setHeader, getQuery } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { Aromabox } from '~/types/product'
import type { AromaboxDetailResponse } from '~/types/api'

function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export default eventHandler(async (event: H3Event): Promise<AromaboxDetailResponse> => {
  const idParam = getRouterParam(event, 'id')

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Aromabox ID is required',
    })
  }

  if (!isValidUUID(idParam)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid aromabox ID format. Expected UUID.',
    })
  }

  const aromaboxId = idParam

  const query = getQuery(event)
  const withRelated = query.withRelated === 'true' || query.withRelated === '1'
  const relatedLimit = Math.min(
    20,
    Math.max(1, Number.parseInt(String(query.relatedLimit ?? '4'), 10) || 4)
  )

  const client = await serverSupabaseClient(event)

  try {
    const { data: aromabox, error: aromaboxError } = await client
      .from('perfume_sets')
      .select('*')
      .eq('id', aromaboxId)
      .single()

    if (aromaboxError) {
      if (aromaboxError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Aromabox not found',
        })
      }

      console.error('[API /aromaboxes/:id] Database error:', aromaboxError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch aromabox',
        data: process.dev ? { detail: aromaboxError.message } : undefined,
      })
    }

    if (!aromabox) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Aromabox not found',
      })
    }

    let relatedSets: Aromabox[] = []

    if (withRelated) {
      const { data: related, error: relatedError } = await client
        .from('perfume_sets')
        .select('*')
        .neq('id', aromaboxId)
        .eq('gender', aromabox.gender)
        .limit(relatedLimit)

      if (relatedError) {
        console.warn('[API /aromaboxes/:id] Failed to fetch related aromaboxes:', relatedError)
      } else {
        relatedSets = related ?? []
      }
    }

    const response: AromaboxDetailResponse = {
      ...aromabox,
      related_sets: withRelated ? relatedSets : undefined,
    }

    setHeader(event, 'Cache-Control', 'public, max-age=600, s-maxage=600')
    const etagSource = aromabox.updated_at || aromabox.created_at
    const etag = `"aromabox-${aromaboxId}-${etagSource ?? 'v1'}"`
    setHeader(event, 'ETag', etag)

    return response
  } catch (err: any) {
    if (err.statusCode) {
      throw err
    }

    console.error('[API /aromaboxes/:id] Unexpected error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
