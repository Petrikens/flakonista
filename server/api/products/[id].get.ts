import { eventHandler, getRouterParam, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')!
  const idNum = Number(idParam)
  const id = Number.isFinite(idNum) ? idNum : idParam

  const client = await serverSupabaseClient(event)

  // подстрой названия таблиц/полей под свои
  const { data, error } = await client
    .from('products')
    .select('*, brands:brand_id(id, name)', { count: 'exact' })
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return data
})
