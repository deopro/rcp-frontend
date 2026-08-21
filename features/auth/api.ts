import type { AuthUser, LoginResponse, SessionResponse } from './types'

export async function loginRequest(identifier: string, password: string): Promise<LoginResponse> {
  return await $fetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { identifier, password },
  })
}

export async function logoutRequest(): Promise<void> {
  await $fetch('/api/auth/logout', { method: 'POST' })
}

export async function fetchSession(): Promise<SessionResponse> {
  return await $fetch<SessionResponse>('/api/auth/session')
}

export async function updatePreferredLocale(preferred_locale: 'pt-PT' | 'en'): Promise<AuthUser> {
  return await $fetch<AuthUser>('/api/auth/locale', {
    method: 'PUT',
    body: { preferred_locale },
  })
}
