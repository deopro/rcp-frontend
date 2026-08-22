import { useAuthStore } from '~/features/auth/stores/auth'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // SSR may hydrate as guest if cookies were not forwarded; re-read cookie on client boot
  if (!auth.isAuthenticated) {
    await auth.hydrate({ force: true })
  }
})
