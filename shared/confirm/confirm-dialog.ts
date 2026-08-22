export type ConfirmVariant = 'default' | 'danger'

export type ConfirmDialogOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

type ConfirmResolver = (value: boolean) => void

export const confirmDialogState = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: '',
  cancelLabel: '',
  variant: 'default' as ConfirmVariant,
})

let resolveConfirm: ConfirmResolver | null = null

export function resolveConfirmDialog(confirmed: boolean) {
  confirmDialogState.open = false
  resolveConfirm?.(confirmed)
  resolveConfirm = null
}

export function openConfirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  confirmDialogState.title = options.title
  confirmDialogState.message = options.message
  confirmDialogState.confirmLabel = options.confirmLabel ?? ''
  confirmDialogState.cancelLabel = options.cancelLabel ?? ''
  confirmDialogState.variant = options.variant ?? 'default'
  confirmDialogState.open = true

  return new Promise<boolean>((resolve) => {
    resolveConfirm = resolve
  })
}
