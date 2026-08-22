import {
  confirmDialogState,
  openConfirmDialog,
  resolveConfirmDialog,
  type ConfirmDialogOptions,
} from '~/shared/confirm/confirm-dialog'

export function useConfirmDialog() {
  const { t } = useI18n()

  async function confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return openConfirmDialog({
      confirmLabel: options.confirmLabel ?? t('forms.confirmAction'),
      cancelLabel: options.cancelLabel ?? t('actions.cancel'),
      ...options,
    })
  }

  function accept() {
    resolveConfirmDialog(true)
  }

  function dismiss() {
    resolveConfirmDialog(false)
  }

  return {
    state: confirmDialogState,
    confirm,
    accept,
    dismiss,
  }
}
