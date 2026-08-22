import type { AuthUser, LoginResponse } from '../../../features/auth/types'
import { ApiErrorCode, codeFromMessage } from '../../../shared/api/error-codes'

const COOKIE_NAME = 'rcp_jwt'

function authError(statusCode: number, code: ApiErrorCode) {
  return createError({
    statusCode,
    statusMessage: code,
    data: { code },
  })
}

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const config = useRuntimeConfig()
  const body = await readBody<{ identifier?: string; password?: string }>(event)

  if (!body?.identifier || !body?.password) {
    throw authError(400, ApiErrorCode.AUTH_MISSING_FIELDS)
  }

  let result: LoginResponse
  try {
    result = await $fetch<LoginResponse>(`${config.public.apiUrl}/api/auth/local`, {
      method: 'POST',
      body: {
        identifier: body.identifier,
        password: body.password,
      },
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; data?: { error?: { message?: string } } }
    throw authError(err.statusCode || 401, codeFromMessage(err.data?.error?.message))
  }

  if (result.user?.status === 'inactive') {
    throw authError(403, ApiErrorCode.AUTH_USER_INACTIVE)
  }

  // Enrich with role via account endpoint when available
  let user: AuthUser = result.user
  try {
    user = await $fetch<AuthUser>(`${config.public.apiUrl}/api/account/me`, {
      headers: { Authorization: `Bearer ${result.jwt}` },
    })
  } catch {
    // Fall back to login payload
  }

  if (user.status === 'inactive') {
    throw authError(403, ApiErrorCode.AUTH_USER_INACTIVE)
  }

  setCookie(event, COOKIE_NAME, result.jwt, cookieOptions(60 * 60 * 24 * 7))

  return { jwt: result.jwt, user }
})
