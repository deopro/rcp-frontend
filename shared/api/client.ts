/**
 * Browser → Nuxt proxy → Strapi. Session JWT is read from httpOnly cookie on the server.
 */
import { FetchError } from 'ofetch'
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

async function handleUnauthorized() {
  if (!import.meta.client) return

  try {
    const auth = useAuthStore()
    const toast = useToast()
    const { t } = useI18n()

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
  } catch {
    // Ignore composable errors during session cleanup.
  }
}

export function useApiClient() {
  async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const method = options.method || 'GET'
    const proxyPath = toProxyPath(path)

    try {
      const result = await $fetch<T>(proxyPath, {
        method,
        body: options.body,
        credentials: 'include',
      })
      return result as T
    } catch (error: unknown) {
      if (!(error instanceof FetchError)) {
        throw new ApiError('Unexpected request failure', 0, ApiErrorCode.GENERIC)
      }

      const status = error.statusCode || 0
      const rawMessage = messageFromFetchError(error)

      if (status === 401) {
        await handleUnauthorized()
        throw new ApiError('Session expired', 401, ApiErrorCode.GENERIC)
      }

      if (status === 0) {
        throw new ApiError(rawMessage, 0, ApiErrorCode.NETWORK)
      }

      const detailCode = (error.data as { error?: { details?: { code?: string } } })?.error
        ?.details?.code
      const code =
        detailCode === 'CAPACITY_EXCEEDED'
          ? ApiErrorCode.CAPACITY_EXCEEDED
          : detailCode === 'PERIOD_LOCKED'
            ? ApiErrorCode.PERIOD_LOCKED
            : codeFromHttpStatus(status, rawMessage)
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
