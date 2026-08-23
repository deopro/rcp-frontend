export type NotificationType =
  | 'approval_request'
  | 'approval_returned'
  | 'approval_approved'
  | 'approval_locked'
  | 'approval_reopened'
  | 'capacity_alert'
  | 'over_allocation'
  | 'bench_alert'
  | 'missing_allocation'

export type AppNotification = {
  id: number
  document_id: string
  type: NotificationType
  title: string
  body?: string | null
  payload?: Record<string, unknown> | null
  read_at?: string | null
  created_at?: string
}

export type NotificationsListResponse = {
  data: AppNotification[]
  meta: { unread_count: number }
}
