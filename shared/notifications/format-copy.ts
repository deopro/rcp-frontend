import type { AppNotification } from '~/features/notifications/types'

type Translate = (key: string, values?: Record<string, unknown>) => string
type TranslateExists = (key: string) => boolean

function str(payload: Record<string, unknown> | null | undefined, key: string): string {
  const value = payload?.[key]
  return value == null ? '' : String(value)
}

function period(payload: Record<string, unknown> | null | undefined): string {
  const start = str(payload, 'period_start').slice(0, 10)
  const end = str(payload, 'period_end').slice(0, 10)
  if (start && end) return `${start} → ${end}`
  const from = str(payload, 'from').slice(0, 10)
  const to = str(payload, 'to').slice(0, 10)
  if (from && to) return `${from} → ${to}`
  return str(payload, 'period')
}

/** Rebuild notification title/body from type + payload so locale switches stay in sync. */
export function formatNotificationCopy(
  t: Translate,
  te: TranslateExists,
  n: Pick<AppNotification, 'type' | 'title' | 'body' | 'payload'>,
): { title: string; body: string } {
  const payload = n.payload || {}
  const teamId = str(payload, 'team_id')
  const team =
    str(payload, 'team_name') ||
    (teamId ? t('notifications.copy.teamFallback', { id: teamId }) : '')
  const range = period(payload)
  const employee = str(payload, 'employee_name')
  const date = str(payload, 'date').slice(0, 10)
  const comments = str(payload, 'comments').trim()
  const utilization = str(payload, 'utilization_pct')
  const level = str(payload, 'level')
  const values: Record<string, unknown> = {
    team,
    range,
    employee,
    date,
    comments,
    allocated: str(payload, 'allocated'),
    available: str(payload, 'available'),
    remaining: str(payload, 'remaining_hours'),
    benchPct: str(payload, 'bench_pct'),
    utilization,
  }

  const prefix = `notifications.copy.${n.type}`
  const titleKey =
    n.type === 'capacity_alert' && (level === 'high' || Number(utilization) > 95)
      ? `${prefix}.titleHigh`
      : n.type === 'capacity_alert'
        ? `${prefix}.titleLow`
        : `${prefix}.title`
  const bodyKey = n.type === 'approval_returned' && comments ? `${prefix}.bodyWithComments` : `${prefix}.body`

  if (!te(titleKey)) {
    return { title: n.title, body: n.body || '' }
  }

  return {
    title: t(titleKey, values),
    body: te(bodyKey) ? t(bodyKey, values) : n.body || '',
  }
}
