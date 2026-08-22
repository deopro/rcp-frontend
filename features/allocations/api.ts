import { useApiClient } from '~/shared/api/client'
import { compactData, connectOne } from '~/shared/api/strapi-payload'
import type {
  AllocationInput,
  CopyMode,
  CopyResult,
  GridAllocation,
  GridData,
} from './types'

type OneResponse<T> = { data: T }

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export function useAllocationsApi() {
  const api = useApiClient()

  return {
    loadGrid(from: string, to: string, teamId?: number) {
      return api.get<{ data: GridData }>(
        `/api/allocations/grid${qs({ from, to, team: teamId })}`,
      )
    },

    createAllocation(data: AllocationInput) {
      const payload = compactData({
        employee: connectOne(data.employee),
        project: connectOne(data.project),
        allocation_date: data.allocation_date,
        hours: data.hours,
        notes: data.notes,
        status: data.status || 'draft',
      })
      return api.post<OneResponse<GridAllocation>>('/api/allocations', { data: payload })
    },

    updateAllocation(documentId: string, data: Partial<AllocationInput>) {
      const payload = compactData({
        employee: data.employee !== undefined ? connectOne(data.employee) : undefined,
        project: data.project !== undefined ? connectOne(data.project) : undefined,
        allocation_date: data.allocation_date,
        hours: data.hours,
        notes: data.notes,
        status: data.status,
      })
      return api.put<OneResponse<GridAllocation>>(`/api/allocations/${documentId}`, {
        data: payload,
      })
    },

    deleteAllocation(documentId: string) {
      return api.del(`/api/allocations/${documentId}`)
    },

    copyAllocations(targetDate: string, mode: CopyMode, employeeIds?: number[]) {
      return api.post<{ data: CopyResult }>('/api/allocations/copy', {
        target_date: targetDate,
        mode,
        employee_ids: employeeIds,
      })
    },
  }
}
