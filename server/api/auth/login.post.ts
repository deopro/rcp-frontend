import type { AuthUser, LoginResponse } from '../../../features/auth/types'

const COOKIE_NAME = 'rcp_jwt'

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
    throw createError({ statusCode: 400, statusMessage: 'Identifier and password are required' })
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
    throw createError({
      statusCode: err.statusCode || 401,
      statusMessage: err.data?.error?.message || 'Invalid credentials',
    })
  }

  if (result.user?.status === 'inactive') {
    throw createError({ statusCode: 403, statusMessage: 'User is inactive' })
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
    throw createError({ statusCode: 403, statusMessage: 'User is inactive' })
  }

  setCookie(event, COOKIE_NAME, result.jwt, cookieOptions(60 * 60 * 24 * 7))

  return { jwt: result.jwt, user }
})
