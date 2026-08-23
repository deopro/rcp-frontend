/**
 * Web Push subscription helper — ready when VAPID public key is configured.
 */
import { useNotificationsApi } from '~/features/notifications/api'

export function usePushNotifications() {
  const supported = computed(
    () =>
      import.meta.client &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window,
  )

  const permission = ref<NotificationPermission | 'unsupported'>('default')
  const configured = ref(false)

  async function refreshStatus() {
    if (!supported.value) {
      permission.value = 'unsupported'
      return
    }
    permission.value = Notification.permission
    try {
      const res = await useNotificationsApi().vapidPublicKey()
      configured.value = res.data.configured
    } catch {
      configured.value = false
    }
  }

  /**
   * Requests browser permission. Actual PushManager.subscribe is deferred until
   * VAPID keys + subscription storage are fully wired on the backend.
   */
  async function enable() {
    if (!supported.value) return { ok: false as const, reason: 'unsupported' as const }
    await refreshStatus()
    if (!configured.value) return { ok: false as const, reason: 'not_configured' as const }

    const result = await Notification.requestPermission()
    permission.value = result
    if (result !== 'granted') return { ok: false as const, reason: 'denied' as const }

    return { ok: true as const, reason: 'ready' as const }
  }

  return {
    supported,
    permission,
    configured,
    refreshStatus,
    enable,
  }
}
