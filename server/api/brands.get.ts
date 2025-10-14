import { serverSupabaseClient } from '#supabase/server'
import { eventHandler, createError } from 'h3'

export default eventHandler(async (event: any) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('brands')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data ?? []
})
