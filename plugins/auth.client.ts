import { clearAuthSessionCache, ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Run after hydration so we do not change layout/auth state mid-hydrate.
  nuxtApp.hook('app:mounted', async () => {
    const auth = useAuthStore()

    if (auth.isAuthenticated) return

    clearAuthSessionCache()
    await ensureAuthSession()

    if (!auth.isAuthenticated) return

    const route = useRoute()
    if (route.path === '/login') {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      await navigateTo(redirect)
    }
  })
})
