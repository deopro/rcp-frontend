import { ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'
import type { RcpRoleType } from '~/features/auth/types'
import { getRouteAllowedRoles, normalizeRoutePath } from '~/shared/navigation/nav-access'

const PUBLIC_PATHS = ['/login', '/forbidden']

export default defineNuxtRouteMiddleware(async (to) => {
  const path = normalizeRoutePath(to.path)
  if (PUBLIC_PATHS.includes(path)) {
    return
  }

  await ensureAuthSession()
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return
  }

  const metaRoles = to.meta.roles as RcpRoleType[] | undefined
  const allowed = metaRoles?.length ? metaRoles : getRouteAllowedRoles(path)
  if (!allowed?.length) {
    return
  }

  if (!auth.roleType || !allowed.includes(auth.roleType)) {
    return navigateTo({
      path: '/forbidden',
      query: { from: to.fullPath },
    })
  }
})
