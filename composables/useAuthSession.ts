import { fetchSession } from '~/features/auth/api'
import type { SessionResponse } from '~/features/auth/types'
import { useAuthStore } from '~/features/auth/stores/auth'

export const AUTH_SESSION_KEY = 'auth-session'

async function loadSession(): Promise<SessionResponse> {
  if (import.meta.server) {
    return await fetchSession(
      (url, opts) =>
        $fetch<SessionResponse>(url, {
          ...opts,
          headers: {
            ...useRequestHeaders(['cookie']),
            ...(opts as { headers?: Record<string, string> })?.headers,
          },
        }),
    )
  }

  return await fetchSession($fetch)
}

function applySession(auth: ReturnType<typeof useAuthStore>, session: SessionResponse | null) {
  if (!session) return

  auth.token = session.token
  auth.user = session.user
  auth.hydrated = true
}

/** SSR-safe session fetch shared between plugin, middleware, and client payload. */
export async function ensureAuthSession() {
  const auth = useAuthStore()

  const { data } = await useAsyncData(AUTH_SESSION_KEY, loadSession, {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
  })

  applySession(auth, data.value ?? null)

  return data.value
}

export function clearAuthSessionCache() {
  clearNuxtData(AUTH_SESSION_KEY)
}

export function syncAuthSessionCache(session: SessionResponse) {
  clearAuthSessionCache()
  const nuxtApp = useNuxtApp()
  nuxtApp.payload.data[AUTH_SESSION_KEY] = session
  applySession(useAuthStore(), session)
}
