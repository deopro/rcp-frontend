import { resolveApiErrorToast } from '~/shared/api/error-codes'

export function useApiErrorToast() {
  const { t } = useI18n()
  const toast = useToast()

  function showApiError(error: unknown) {
    const { title, description } = resolveApiErrorToast(error, t)
    toast.error({ title, description })
  }

  return { showApiError }
}
