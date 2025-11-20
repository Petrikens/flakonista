import type { FetchOptions } from 'ofetch'

type Query = Record<string, any>

interface UseApiConfig {
  baseURL?: string
  timeout?: number
  defaultQuery?: Query
  defaultHeaders?: Record<string, string>
  retry?: number
  retryDelay?: number
}

interface RequestOptions extends FetchOptions {
  query?: Query
  timeout?: number
  cancelPrevious?: boolean
}

export const useApi = (config: UseApiConfig = {}) => {
  const {
    baseURL = '',
    timeout = 15000,
    defaultQuery,
    defaultHeaders,
    retry = 1,
    retryDelay = 300,
  } = config

  const pending = ref(false)
  const error = ref<string | null>(null)
  const status = ref<number | null>(null)

  let controller: AbortController | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function makeSignal(ms: number) {
    if (timeoutId) clearTimeout(timeoutId)
    const c = new AbortController()
    timeoutId = setTimeout(() => c.abort(new DOMException('Timeout', 'TimeoutError')), ms)
    return c
  }
  function cleanupSignal() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  async function doFetch<T = unknown>(
    method: HTTPMethod,
    url: string,
    {
      query,
      body,
      timeout: to,
      cancelPrevious = method === 'GET',
      // prevent overriding our method via options
      method: _ignored,
      ...opts
    }: RequestOptions = {}
  ): Promise<T> {
    if (cancelPrevious && controller) controller.abort()

    error.value = null
    status.value = null
    pending.value = true

    controller = makeSignal(to ?? timeout)
    const signal = controller.signal

    try {
      const res = await $fetch<T>(url, {
        baseURL,
        method,
        query: defaultQuery ? { ...defaultQuery, ...query } : query,
        body,
        headers: defaultHeaders,
        signal,
        retry,
        retryDelay,
        ...opts,
      })
      return res
    } catch (e: any) {
      // Normalize common $fetch error shapes
      status.value = e?.status ?? e?.response?.status ?? null
      const statusMessage =
        e?.data?.statusMessage ??
        e?.response?._data?.statusMessage ??
        e?.response?._data?.message ??
        e?.message
      error.value = statusMessage || 'Request failed'
      throw e
    } finally {
      cleanupSignal()
      pending.value = false
    }
  }

  const get = <T = unknown>(url: string, query?: Query, opts?: RequestOptions) =>
    doFetch<T>('GET', url, { query, ...opts })
  const post = <T = unknown>(url: string, body?: any, opts?: RequestOptions) =>
    doFetch<T>('POST', url, { body, ...opts })
  const put = <T = unknown>(url: string, body?: any, opts?: RequestOptions) =>
    doFetch<T>('PUT', url, { body, ...opts })
  const patch = <T = unknown>(url: string, body?: any, opts?: RequestOptions) =>
    doFetch<T>('PATCH', url, { body, ...opts })
  const del = <T = unknown>(url: string, query?: Query, opts?: RequestOptions) =>
    doFetch<T>('DELETE', url, { query, ...opts })

  const cancel = () => controller?.abort()

  return { get, post, put, patch, delete: del, cancel, pending, error, status }
}
