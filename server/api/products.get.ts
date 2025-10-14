import { serverSupabaseClient } from '#supabase/server'
import { eventHandler, createError, getQuery } from 'h3'
import type { SeasonGroup } from '~/types/product'

export default eventHandler(async (event: any) => {
  const client = await serverSupabaseClient(event)

  const q = getQuery(event) as Record<string, string | undefined>

  const genders = (q.genders ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const brands = (q.brands ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const season = q.season as SeasonGroup

  const profileAny = (q.profileAny ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const profileAll = (q.profileAll ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const sort = (q.sort ?? 'newest') as 'newest' | 'price_asc' | 'price_desc'

  const page = Math.max(1, Number.parseInt(q.page ?? '1', 10))
  const perPage = Math.min(100, Math.max(1, Number.parseInt(q.perPage ?? '20', 10)))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let req = client.from('products').select('*, brands:brand_id(id, name)', { count: 'exact' })

  if (genders.length) req = req.in('gender', genders)
  if (brands.length) req = req.in('brand_id', brands)
  if (season) req = req.eq('season_group', season)
  if (profileAny.length) req = req.overlaps('profile_tags', profileAny as any)
  if (profileAll.length) req = req.contains('profile_tags', profileAll as any)

  if (sort === 'price_asc') req = req.order('price_10ml', { ascending: true, nullsFirst: true })
  else if (sort === 'price_desc')
    req = req.order('price_10ml', { ascending: false, nullsLast: true })
  else req = req.order('date_create', { ascending: false, nullsLast: true })

  req = req.range(from, to)

  const { data, error, count } = await req
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    items: data ?? [],
    count: count ?? 0,
    page,
    perPage,
  }
})
