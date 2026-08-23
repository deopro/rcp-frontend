import { useAuthStore } from '~/features/auth/stores/auth'

export function useLogout() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const toast = useToast()
  const loggingOut = ref(false)

  async function logout() {
    if (loggingOut.value) return
    loggingOut.value = true
    try {
      await auth.logout()
      toast.info({
        title: t('auth.logoutTitle'),
        description: t('auth.logoutDescription'),
      })
      await navigateTo('/login', { external: true })
    } finally {
      loggingOut.value = false
    }
  }

  return { logout, loggingOut }
}
