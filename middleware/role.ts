import { ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'
import type { RcpRoleType } from '~/features/auth/types'

/**
 * Usage: definePageMeta({ middleware: ['auth', 'role'], roles: ['administrator'] })
 * Roles are read from route.meta.roles
 */
export default defineNuxtRouteMiddleware(async (to) => {
  await ensureAuthSession()
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  const allowed = (to.meta.roles as RcpRoleType[] | undefined) || []
  if (allowed.length === 0) {
    return
  }

  if (!auth.roleType || !allowed.includes(auth.roleType)) {
    return navigateTo('/')
  }
})
