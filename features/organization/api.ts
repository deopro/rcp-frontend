import { useApiClient } from '~/shared/api/client'
import { compactData, connectOne } from '~/shared/api/strapi-payload'
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
      const payload = compactData({
        name: data.name,
        description: data.description,
        status: data.status,
        manager: connectOne(data.manager),
      })
      return api.post<OneResponse<Department>>('/api/departments', { data: payload })
    },

    updateDepartment(documentId: string, data: Partial<DepartmentInput>) {
      const payload = compactData({
        name: data.name,
        description: data.description,
        status: data.status,
        manager: data.manager !== undefined ? connectOne(data.manager) : undefined,
      })
      return api.put<OneResponse<Department>>(`/api/departments/${documentId}`, { data: payload })
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
      const payload = compactData({
        name: data.name,
        description: data.description,
        status: data.status,
        department: connectOne(data.department),
        team_leader: connectOne(data.team_leader),
      })
      return api.post<OneResponse<Team>>('/api/teams', { data: payload })
    },

    updateTeam(documentId: string, data: Partial<TeamInput>) {
      const payload = compactData({
        name: data.name,
        description: data.description,
        status: data.status,
        department: data.department !== undefined ? connectOne(data.department) : undefined,
        team_leader: data.team_leader !== undefined ? connectOne(data.team_leader) : undefined,
      })
      return api.put<OneResponse<Team>>(`/api/teams/${documentId}`, { data: payload })
    },

    deleteTeam(documentId: string) {
      return api.del(`/api/teams/${documentId}`)
    },

    listEmployees(page = 1, pageSize = 50) {
      return api.get<ListResponse<Employee>>(
        `/api/employees${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[team]': 'true',
          sort: 'full_name:asc',
        })}`,
      )
    },

    getEmployee(documentId: string) {
      return api.get<OneResponse<Employee>>(
        `/api/employees/${documentId}${qs({
          'populate[team]': 'true',
        })}`,
      )
    },

    createEmployee(data: EmployeeInput) {
      const payload = compactData({
        employee_number: data.employee_number,
        full_name: data.full_name,
        email: data.email,
        position: data.position,
        daily_capacity: data.daily_capacity,
        status: data.status,
        hire_date: data.hire_date,
        user: connectOne(data.user),
        team: connectOne(data.team),
      })
      return api.post<OneResponse<Employee>>('/api/employees', { data: payload })
    },

    updateEmployee(documentId: string, data: Partial<EmployeeInput>) {
      const payload = compactData({
        employee_number: data.employee_number,
        full_name: data.full_name,
        email: data.email,
        position: data.position,
        daily_capacity: data.daily_capacity,
        status: data.status,
        hire_date: data.hire_date,
        user: data.user !== undefined ? connectOne(data.user) : undefined,
        team: data.team !== undefined ? connectOne(data.team) : undefined,
      })
      return api.put<OneResponse<Employee>>(`/api/employees/${documentId}`, { data: payload })
    },

    deleteEmployee(documentId: string) {
      return api.del(`/api/employees/${documentId}`)
    },

    listUserOptions() {
      return api.get<{ data: UserOption[] }>('/api/org/user-options')
    },
  }
}
