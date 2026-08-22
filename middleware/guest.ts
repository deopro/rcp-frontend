import { ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  await ensureAuthSession()
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
