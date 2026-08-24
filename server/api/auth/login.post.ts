import type { AuthUser, LoginResponse } from '../../../features/auth/types'
import { ApiErrorCode, codeFromMessage } from '../../../shared/api/error-codes'
import { isAccountBlocked } from '../../../shared/users/is-account-blocked'
import {
  JWT_COOKIE,
  authCookieOptions,
  authError,
  loadAccount,
} from '../../utils/auth-session'

type StrapiLoginPayload = {
  jwt: string
  user: AuthUser
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const config = useRuntimeConfig()
  const body = await readBody<{ identifier?: string; password?: string }>(event)

  if (!body?.identifier || !body?.password) {
    throw authError(400, ApiErrorCode.AUTH_MISSING_FIELDS)
  }

  let result: StrapiLoginPayload
  try {
    result = await $fetch<StrapiLoginPayload>(`${config.public.apiUrl}/api/auth/local`, {
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

  if (isAccountBlocked(result.user)) {
    throw authError(403, ApiErrorCode.AUTH_USER_INACTIVE)
  }

  const user = await loadAccount(config.public.apiUrl, result.jwt, result.user)

  if (isAccountBlocked(user)) {
    throw authError(403, ApiErrorCode.AUTH_USER_INACTIVE)
  }

  setCookie(event, JWT_COOKIE, result.jwt, authCookieOptions(60 * 60 * 24 * 7))

  return { jwt: result.jwt, user }
})
