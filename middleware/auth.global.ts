import { useAuthStore } from '~/features/auth/stores/auth'

const PUBLIC_PATHS = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.some((path) => to.path === path || to.path.startsWith(`${path}/`))) {
    return
  }

  const auth = useAuthStore()
  const requestFetch = useRequestFetch()

  if (!auth.hydrated) {
    await auth.hydrate({ fetcher: requestFetch })
  }

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
