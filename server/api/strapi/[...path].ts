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

  // #region agent log
  fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H6',location:'strapi/[...path].ts:proxy',message:'strapi proxy request',data:{method,path,hasToken:Boolean(token),targetUrl},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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

    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H1',location:'strapi/[...path].ts:proxy-error',message:'strapi proxy failed',data:{method,path,statusCode,statusMessage},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    throw createError({
      statusCode,
      statusMessage,
      data: err.data ?? { error: { message: statusMessage } },
    })
  }
})
