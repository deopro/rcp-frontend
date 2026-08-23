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
      // Clear local session first so UI can leave immediately.
      const logoutPromise = auth.logout()
      toast.info({
        title: t('auth.logoutTitle'),
        description: t('auth.logoutDescription'),
      })
      await navigateTo('/login')
      await logoutPromise
    } finally {
      loggingOut.value = false
    }
  }

  return { logout, loggingOut }
}
