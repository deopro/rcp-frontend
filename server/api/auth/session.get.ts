import type { AuthUser, SessionResponse } from '../../../features/auth/types'

export default defineEventHandler(async (event): Promise<SessionResponse> => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'rcp_jwt')

  if (!token) {
    return { authenticated: false, token: null, user: null }
  }

  try {
    const user = await $fetch<AuthUser>(`${config.public.apiUrl}/api/account/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (user.status === 'inactive') {
      deleteCookie(event, 'rcp_jwt', { path: '/' })
      return { authenticated: false, token: null, user: null }
    }

    return { authenticated: true, token, user }
  } catch {
    // Fallback to Strapi users/me
    try {
      const user = await $fetch<AuthUser>(`${config.public.apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        query: { populate: 'role' },
      })
      return { authenticated: true, token, user }
    } catch {
      deleteCookie(event, 'rcp_jwt', { path: '/' })
      return { authenticated: false, token: null, user: null }
    }
  }
})
