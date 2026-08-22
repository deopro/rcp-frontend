import { ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'

const PUBLIC_PATHS = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.some((path) => to.path === path || to.path.startsWith(`${path}/`))) {
    return
  }

  await ensureAuthSession()
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
