/**
 * Browser → Nuxt proxy → Strapi. Uses httpOnly session cookie on the server.
 */
import { FetchError } from 'ofetch'
import { useAuthStore } from '~/features/auth/stores/auth'
import {
  ApiErrorCode,
  codeFromHttpStatus,
  resolveApiErrorToast,
} from '~/shared/api/error-codes'

export type ApiErrorBody = {
  error?: {
    status?: number
    name?: string
    message?: string
    details?: unknown
  }
}

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  details: unknown

  constructor(message: string, status: number, code: ApiErrorCode = ApiErrorCode.GENERIC, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** @deprecated Use resolveApiErrorToast or useApiErrorToast instead */
export function describeApiError(error: unknown, t: (key: string) => string): string {
  return resolveApiErrorToast(error, t).description
}

function toProxyPath(strapiPath: string): string {
  return strapiPath.replace(/^\/api\//, '/api/strapi/')
}

function messageFromFetchError(error: FetchError): string {
  const data = error.data as ApiErrorBody | { error?: { message?: string }; statusMessage?: string } | undefined
  if (data && typeof data === 'object') {
    if ('error' in data && data.error?.message) return data.error.message
    if ('statusMessage' in data && typeof data.statusMessage === 'string') return data.statusMessage
  }
  return error.statusMessage || error.message || `Request failed (${error.statusCode || 0})`
}

export function useApiClient() {
  const auth = useAuthStore()
  const toast = useToast()
  const { t } = useI18n()

  async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const method = options.method || 'GET'
    const proxyPath = toProxyPath(path)

    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H2',location:'client.ts:request-start',message:'api proxy request',data:{method,path,proxyPath},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    try {
      const result = await $fetch<T>(proxyPath, {
        method,
        body: options.body,
      })
      return result as T
    } catch (error: unknown) {
      if (!(error instanceof FetchError)) {
        // #region agent log
        fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H4',location:'client.ts:unknown-error',message:'non-fetch error',data:{method,path,err:String(error)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw new ApiError('Unexpected request failure', 0, ApiErrorCode.GENERIC)
      }

      const status = error.statusCode || 0
      const rawMessage = messageFromFetchError(error)

      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H1',location:'client.ts:fetch-error',message:'api proxy error',data:{method,path,status,rawMessage},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (status === 401) {
        auth.clearSession()
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
        toast.error({
          title: t('auth.sessionExpiredTitle'),
          description: t('auth.sessionExpiredDescription'),
        })
        await navigateTo({
          path: '/login',
          query: { redirect: useRoute().fullPath },
        })
        throw new ApiError(t('auth.sessionExpiredTitle'), 401, ApiErrorCode.GENERIC)
      }

      if (status === 0) {
        throw new ApiError(rawMessage, 0, ApiErrorCode.NETWORK)
      }

      const code = codeFromHttpStatus(status, rawMessage)
      throw new ApiError(rawMessage, status, code, error.data)
    }
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
