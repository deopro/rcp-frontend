import { useApiClient } from '~/shared/api/client'
import { compactData, connectOne } from '~/shared/api/strapi-payload'
import type {
  Holiday,
  HolidayInput,
  Leave,
  LeaveInput,
  StrapiMeta,
} from './types'

type ListResponse<T> = { data: T[]; meta: StrapiMeta }
type OneResponse<T> = { data: T }

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useLeaveApi() {
  const api = useApiClient()

  return {
    listHolidays(page = 1, pageSize = 200) {
      return api.get<ListResponse<Holiday>>(
        `/api/holidays${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          sort: 'date:asc',
        })}`,
      )
    },

    createHoliday(data: HolidayInput) {
      return api.post<OneResponse<Holiday>>('/api/holidays', { data })
    },

    updateHoliday(documentId: string, data: Partial<HolidayInput>) {
      return api.put<OneResponse<Holiday>>(`/api/holidays/${documentId}`, { data })
    },

    deleteHoliday(documentId: string) {
      return api.del(`/api/holidays/${documentId}`)
    },

    listLeaves(page = 1, pageSize = 200) {
      return api.get<ListResponse<Leave>>(
        `/api/leaves${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[employee]': 'true',
          sort: 'start_date:desc',
        })}`,
      )
    },

    createLeave(data: LeaveInput) {
      const payload = compactData({
        employee: connectOne(data.employee),
        start_date: data.start_date,
        end_date: data.end_date,
        leave_type: data.leave_type,
        status: data.status,
        notes: data.notes,
      })
      return api.post<OneResponse<Leave>>('/api/leaves', { data: payload })
    },

    updateLeave(documentId: string, data: Partial<LeaveInput>) {
      const payload = compactData({
        employee: data.employee !== undefined ? connectOne(data.employee) : undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        leave_type: data.leave_type,
        status: data.status,
        notes: data.notes,
      })
      return api.put<OneResponse<Leave>>(`/api/leaves/${documentId}`, { data: payload })
    },

    deleteLeave(documentId: string) {
      return api.del(`/api/leaves/${documentId}`)
    },
  }
}
