import type { AuthUser } from '../../../features/auth/types'
import type { ApiErrorCode } from '../../../shared/api/error-codes'

export const JWT_COOKIE = 'rcp_jwt'

const OIDC_COOKIE_MAX_AGE = 60 * 10

export function authError(statusCode: number, code: ApiErrorCode) {
  return createError({
    statusCode,
    statusMessage: code,
    data: { code },
  })
}

export function authCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export function oidcCookieOptions() {
  return authCookieOptions(OIDC_COOKIE_MAX_AGE)
}

export function safeInternalPath(value: unknown): string {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  return value
}

export async function loadAccount(apiUrl: string, jwt: string, fallback: AuthUser): Promise<AuthUser> {
  try {
    return await $fetch<AuthUser>(`${apiUrl}/api/account/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
  } catch {
    return fallback
  }
}

export function oidcEnabled(): boolean {
  const config = useRuntimeConfig()
  return (
    config.public.authMode === 'oidc' &&
    Boolean(config.public.oidcClientId && config.oidcClientSecret && config.oidcIssuer)
  )
}
