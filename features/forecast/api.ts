import { useApiClient } from '~/shared/api/client'
import type {
  ForecastFilters,
  ForecastGranularity,
  ForecastResult,
  ForecastScope,
} from './types'

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useForecastApi() {
  const api = useApiClient()

  return {
    load(opts: {
      from: string
      to: string
      scope?: ForecastScope
      granularity?: ForecastGranularity
      filters?: ForecastFilters
    }) {
      return api.get<{ data: ForecastResult }>(
        `/api/forecast${qs({
          from: opts.from,
          to: opts.to,
          scope: opts.scope,
          granularity: opts.granularity,
          department: opts.filters?.departmentId,
          team: opts.filters?.teamId,
          project: opts.filters?.projectId,
        })}`,
      )
    },
  }
}
