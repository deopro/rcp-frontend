import { toast } from 'vue-sonner'

export type ToastPayload = {
  title: string
  description?: string
}

export function useToast() {
  return {
    success(payload: ToastPayload | string) {
      if (typeof payload === 'string') {
        toast.success(payload)
        return
      }
      toast.success(payload.title, { description: payload.description })
    },
    error(payload: ToastPayload | string) {
      if (typeof payload === 'string') {
        toast.error(payload)
        return
      }
      toast.error(payload.title, { description: payload.description })
    },
    info(payload: ToastPayload | string) {
      if (typeof payload === 'string') {
        toast.message(payload)
        return
      }
      toast.message(payload.title, { description: payload.description })
    },
    warning(payload: ToastPayload | string) {
      if (typeof payload === 'string') {
        toast.warning(payload)
        return
      }
      toast.warning(payload.title, { description: payload.description })
    },
  }
}
