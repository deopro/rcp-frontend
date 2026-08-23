import { useApiClient } from '~/shared/api/client'
import type { DashboardFilters, DashboardResult } from './types'

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useDashboardApi() {
  const api = useApiClient()

  return {
    load(opts: {
      from: string
      to: string
      filters?: DashboardFilters
    }) {
      return api.get<{ data: DashboardResult }>(
        `/api/dashboard${qs({
          from: opts.from,
          to: opts.to,
          department: opts.filters?.departmentId,
          team: opts.filters?.teamId,
          project: opts.filters?.projectId,
          employee: opts.filters?.employeeId,
        })}`,
      )
    },
  }
}
