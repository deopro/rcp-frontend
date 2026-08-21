import { useApiClient } from '~/shared/api/client'
import type {
  Department,
  DepartmentInput,
  Employee,
  EmployeeInput,
  StrapiMeta,
  Team,
  TeamInput,
  UserOption,
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

export function useOrganizationApi() {
  const api = useApiClient()

  return {
    listDepartments(page = 1, pageSize = 50) {
      return api.get<ListResponse<Department>>(
        `/api/departments${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[manager]': 'true',
          sort: 'name:asc',
        })}`,
      )
    },

    getDepartment(documentId: string) {
      return api.get<OneResponse<Department>>(
        `/api/departments/${documentId}${qs({ 'populate[manager]': 'true' })}`,
      )
    },

    createDepartment(data: DepartmentInput) {
      return api.post<OneResponse<Department>>('/api/departments', { data })
    },

    updateDepartment(documentId: string, data: Partial<DepartmentInput>) {
      return api.put<OneResponse<Department>>(`/api/departments/${documentId}`, { data })
    },

    deleteDepartment(documentId: string) {
      return api.del(`/api/departments/${documentId}`)
    },

    listTeams(page = 1, pageSize = 50) {
      return api.get<ListResponse<Team>>(
        `/api/teams${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[department]': 'true',
          'populate[team_leader]': 'true',
          sort: 'name:asc',
        })}`,
      )
    },

    getTeam(documentId: string) {
      return api.get<OneResponse<Team>>(
        `/api/teams/${documentId}${qs({
          'populate[department]': 'true',
          'populate[team_leader]': 'true',
          'populate[employees]': 'true',
        })}`,
      )
    },

    createTeam(data: TeamInput) {
      return api.post<OneResponse<Team>>('/api/teams', { data })
    },

    updateTeam(documentId: string, data: Partial<TeamInput>) {
      return api.put<OneResponse<Team>>(`/api/teams/${documentId}`, { data })
    },

    deleteTeam(documentId: string) {
      return api.del(`/api/teams/${documentId}`)
    },

    listEmployees(page = 1, pageSize = 50) {
      return api.get<ListResponse<Employee>>(
        `/api/employees${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[user]': 'true',
          'populate[team]': 'true',
          sort: 'full_name:asc',
        })}`,
      )
    },

    getEmployee(documentId: string) {
      return api.get<OneResponse<Employee>>(
        `/api/employees/${documentId}${qs({
          'populate[user]': 'true',
          'populate[team]': 'true',
        })}`,
      )
    },

    createEmployee(data: EmployeeInput) {
      return api.post<OneResponse<Employee>>('/api/employees', { data })
    },

    updateEmployee(documentId: string, data: Partial<EmployeeInput>) {
      return api.put<OneResponse<Employee>>(`/api/employees/${documentId}`, { data })
    },

    deleteEmployee(documentId: string) {
      return api.del(`/api/employees/${documentId}`)
    },

    listUserOptions() {
      return api.get<{ data: UserOption[] }>('/api/org/user-options')
    },
  }
}
