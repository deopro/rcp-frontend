type StrapiErrorBody = {
  error?: {
    status?: number
    name?: string
    message?: string
    details?: unknown
  }
}

function isNetworkError(error: unknown): boolean {
  const err = error as { message?: string; cause?: { code?: string } }
  const message = (err.message || '').toLowerCase()
  const code = err.cause?.code
  return (
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNRESET'
  )
}

function buildTargetUrl(base: string, path: string, query: Record<string, unknown>): string {
  const url = new URL(`${base}/api/${path}`)
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item))
    } else {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const method = event.method
  const query = getQuery(event)
  const token = getCookie(event, 'rcp_jwt')
  const targetUrl = buildTargetUrl(config.public.apiUrl, path, query)

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let body: unknown
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = await readBody(event)
    headers['Content-Type'] = 'application/json'
  }

  try {
    if (method === 'DELETE') {
      await $fetch(targetUrl, { method: 'DELETE', headers })
      setResponseStatus(event, 204)
      return null
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as StrapiErrorBody | unknown
      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data
            ? (data as StrapiErrorBody).error?.message
            : undefined
        throw createError({
          statusCode: response.status,
          statusMessage: message || response.statusText || 'Request failed',
          data,
        })
      }
      return data
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (contentType) setHeader(event, 'Content-Type', contentType)
    const disposition = response.headers.get('content-disposition')
    if (disposition) setHeader(event, 'Content-Disposition', disposition)
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText || 'Request failed',
      })
    }
    return buffer
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      status?: number
      statusMessage?: string
      message?: string
      data?: StrapiErrorBody
    }
    if (err.statusCode) throw error

    if (isNetworkError(error)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'API unavailable',
        data: { error: { message: 'API unavailable' } },
      })
    }

    const statusCode = err.status || 500
    const statusMessage =
      err.data?.error?.message || err.statusMessage || err.message || 'Request failed'

    throw createError({
      statusCode,
      statusMessage,
      data: err.data ?? { error: { message: statusMessage } },
    })
  }
})
