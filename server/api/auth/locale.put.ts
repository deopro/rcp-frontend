import type { AuthUser } from '../../../features/auth/types'

export default defineEventHandler(async (event): Promise<AuthUser> => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'rcp_jwt')
  const body = await readBody<{ preferred_locale?: string }>(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  if (body?.preferred_locale !== 'pt-PT' && body?.preferred_locale !== 'en') {
    throw createError({ statusCode: 400, statusMessage: 'preferred_locale must be pt-PT or en' })
  }

  try {
    return await $fetch<AuthUser>(`${config.public.apiUrl}/api/account/me`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { preferred_locale: body.preferred_locale },
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; data?: { error?: { message?: string } } }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.error?.message || 'Failed to update locale',
    })
  }
})
