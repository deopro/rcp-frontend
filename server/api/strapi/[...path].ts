type StrapiErrorBody = {
  error?: {
    status?: number
    name?: string
    message?: string
    details?: unknown
  }
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
  const targetUrl = `${config.public.apiUrl}/api/${path}`

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let body: unknown
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = await readBody(event)
  }

  try {
    if (method === 'DELETE') {
      await $fetch(targetUrl, { method: 'DELETE', query, headers })
      setResponseStatus(event, 204)
      return null
    }

    return await $fetch(targetUrl, {
      method,
      query,
      body,
      headers,
    })
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      status?: number
      statusMessage?: string
      message?: string
      data?: StrapiErrorBody
    }
    const statusCode = err.statusCode || err.status || 500
    const statusMessage =
      err.data?.error?.message || err.statusMessage || err.message || 'Request failed'

    throw createError({
      statusCode,
      statusMessage,
      data: err.data ?? { error: { message: statusMessage } },
    })
  }
})
