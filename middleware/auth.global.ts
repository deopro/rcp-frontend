import { useAuthStore } from '~/features/auth/stores/auth'

const PUBLIC_PATHS = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.some((path) => to.path === path || to.path.startsWith(`${path}/`))) {
    return
  }

  const auth = useAuthStore()

  if (!auth.hydrated) {
    await auth.hydrate()
  }

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
