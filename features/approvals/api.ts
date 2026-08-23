import { useApiClient } from '~/shared/api/client'
import { compactData, connectOne } from '~/shared/api/strapi-payload'
import type { Approval, ApprovalAction, ApprovalInput, StrapiMeta } from './types'

type ListResponse<T> = { data: T[]; meta: StrapiMeta }
type OneResponse<T> = { data: T; meta?: { allocations_updated?: number } }

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useApprovalsApi() {
  const api = useApiClient()

  return {
    list(page = 1, pageSize = 100) {
      return api.get<ListResponse<Approval>>(
        `/api/approvals${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[team]': 'true',
          'populate[submitted_by]': 'true',
          'populate[approved_by]': 'true',
          'populate[locked_by]': 'true',
          sort: 'period_start:desc',
        })}`,
      )
    },

    create(data: ApprovalInput) {
      const payload = compactData({
        team: connectOne(data.team),
        period_start: data.period_start,
        period_end: data.period_end,
        comments: data.comments,
        status: 'draft',
      })
      return api.post<OneResponse<Approval>>('/api/approvals', { data: payload })
    },

    update(documentId: string, data: Partial<ApprovalInput>) {
      const payload = compactData({
        team: data.team !== undefined ? connectOne(data.team) : undefined,
        period_start: data.period_start,
        period_end: data.period_end,
        comments: data.comments,
      })
      return api.put<OneResponse<Approval>>(`/api/approvals/${documentId}`, { data: payload })
    },

    delete(documentId: string) {
      return api.del(`/api/approvals/${documentId}`)
    },

    action(documentId: string, action: ApprovalAction, comments?: string) {
      return api.post<OneResponse<Approval>>(`/api/approvals/${documentId}/${action}`, {
        comments,
      })
    },
  }
}
