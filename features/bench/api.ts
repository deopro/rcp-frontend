import { useApiClient } from '~/shared/api/client'
import type { BenchResult, ForecastStub } from './types'

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useBenchApi() {
  const api = useApiClient()

  return {
    loadBench(opts: {
      from: string
      to: string
      teamId?: number
      skillIds?: number[]
    }) {
      return api.get<{ data: BenchResult }>(
        `/api/bench${qs({
          from: opts.from,
          to: opts.to,
          team: opts.teamId,
          skills: opts.skillIds?.length ? opts.skillIds.join(',') : undefined,
        })}`,
      )
    },

    loadForecastStub(opts: { from: string; to: string; scope?: string; teamId?: number }) {
      return api.get<{ data: ForecastStub }>(
        `/api/forecast${qs({
          from: opts.from,
          to: opts.to,
          scope: opts.scope || 'org',
          team: opts.teamId,
        })}`,
      )
    },
  }
}
