/**
 * Typed Strapi API client. Attaches JWT from auth store and handles 401.
 */
import { useAuthStore } from '~/features/auth/stores/auth'

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
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl as string
  const auth = useAuthStore()
  const toast = useToast()
  const { t } = useI18n()

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }
    if (auth.token) {
      headers.set('Authorization', `Bearer ${auth.token}`)
    }

    const response = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
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
      throw new ApiError(t('auth.sessionExpiredTitle'), 401)
    }

    if (!response.ok) {
      let body: ApiErrorBody | undefined
      try {
        body = (await response.json()) as ApiErrorBody
      } catch {
        body = undefined
      }
      throw new ApiError(
        body?.error?.message || `Request failed (${response.status})`,
        response.status,
        body?.error?.details,
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
