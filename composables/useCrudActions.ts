import { getMissingRequiredFields, type RequiredField } from '~/shared/forms/validation'

export function useCrudActions() {
  const { t } = useI18n()
  const toast = useToast()
  const { confirm } = useConfirmDialog()

  async function confirmSave(isEdit: boolean): Promise<boolean> {
    const confirmed = await confirm({
      title: isEdit ? t('forms.confirmUpdateTitle') : t('forms.confirmCreateTitle'),
      message: isEdit ? t('forms.confirmUpdate') : t('forms.confirmCreate'),
      confirmLabel: isEdit ? t('actions.save') : t('actions.add'),
      variant: 'default',
    })
    if (!confirmed) {
      toast.info({ title: t('forms.actionCancelled') })
    }
    return confirmed
  }

  async function confirmDelete(): Promise<boolean> {
    const confirmed = await confirm({
      title: t('forms.confirmDeleteTitle'),
      message: t('forms.confirmDelete'),
      confirmLabel: t('actions.delete'),
      variant: 'danger',
    })
    if (!confirmed) {
      toast.info({ title: t('forms.actionCancelled') })
    }
    return confirmed
  }

  function validateRequired(fields: RequiredField[]): boolean {
    const missing = getMissingRequiredFields(fields)
    if (missing.length === 0) return true

    toast.warning({
      title: t('forms.validationTitle'),
      description: t('forms.validationDescription', { fields: missing.join(', ') }),
    })
    return false
  }

  function toastValidationError(description: string) {
    toast.warning({
      title: t('forms.validationTitle'),
      description,
    })
  }

  return {
    confirmSave,
    confirmDelete,
    validateRequired,
    toastValidationError,
  }
}
