import type { AuthUser, LoginResponse, SessionResponse } from './types'

type SessionFetcher = <T>(url: string, opts?: object) => Promise<T>

export type { SessionFetcher }

export async function fetchSession(fetcher: SessionFetcher = $fetch): Promise<SessionResponse> {
  return await fetcher<SessionResponse>('/api/auth/session')
}

export async function loginRequest(identifier: string, password: string): Promise<LoginResponse> {
  return await $fetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { identifier, password },
  })
}

export async function logoutRequest(): Promise<void> {
  await $fetch('/api/auth/logout', { method: 'POST' })
}

export async function updatePreferredLocale(preferred_locale: 'pt-PT' | 'en'): Promise<AuthUser> {
  return await $fetch<AuthUser>('/api/auth/locale', {
    method: 'PUT',
    body: { preferred_locale },
  })
}
