import { useApiClient } from '~/shared/api/client'
import type { AppNotification, NotificationsListResponse } from './types'

export function useNotificationsApi() {
  const api = useApiClient()

  return {
    list(opts?: { unreadOnly?: boolean; limit?: number }) {
      const params = new URLSearchParams()
      if (opts?.unreadOnly) params.set('unread', '1')
      if (opts?.limit) params.set('limit', String(opts.limit))
      const qs = params.toString()
      return api.get<NotificationsListResponse>(`/api/notifications${qs ? `?${qs}` : ''}`)
    },

    unreadCount() {
      return api.get<{ data: { unread_count: number } }>('/api/notifications/unread-count')
    },

    markRead(documentId: string) {
      return api.post<{ data: AppNotification }>(`/api/notifications/${documentId}/read`)
    },

    markAllRead() {
      return api.post<{ data: { marked: number } }>('/api/notifications/read-all')
    },

    scan(opts?: { from?: string; to?: string }) {
      return api.post<{ data: { created: number; scanned_employees: number } }>(
        '/api/notifications/scan',
        opts || {},
      )
    },

    vapidPublicKey() {
      return api.get<{ data: { configured: boolean; public_key: string | null } }>(
        '/api/notifications/push/vapid-public-key',
      )
    },
  }
}
