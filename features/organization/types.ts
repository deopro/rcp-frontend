/** Shared Strapi REST document shapes for organization entities */

export type OrgStatus = 'active' | 'inactive'

export type StrapiMeta = {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type UserRef = {
  id: number
  documentId?: string
  username?: string
  email?: string
}

export type Department = {
  id: number
  documentId: string
  name: string
  description?: string | null
  status: OrgStatus
  manager?: UserRef | null
  createdAt?: string
  updatedAt?: string
}

export type Team = {
  id: number
  documentId: string
  name: string
  description?: string | null
  status: OrgStatus
  department?: Pick<Department, 'id' | 'documentId' | 'name'> | null
  team_leader?: UserRef | null
  createdAt?: string
  updatedAt?: string
}

export type Employee = {
  id: number
  documentId: string
  employee_number: string
  full_name: string
  email: string
  position?: string | null
  daily_capacity: number
  status: OrgStatus
  hire_date?: string | null
  user?: UserRef | null
  team?: Pick<Team, 'id' | 'documentId' | 'name'> | null
  createdAt?: string
  updatedAt?: string
}

export type UserOption = {
  id: number
  username: string
  email: string
}

export type DepartmentInput = {
  name: string
  description?: string | null
  status: OrgStatus
  manager?: number | null
}

export type TeamInput = {
  name: string
  description?: string | null
  status: OrgStatus
  department?: number | null
  team_leader?: number | null
}

export type EmployeeInput = {
  employee_number: string
  full_name: string
  email: string
  position?: string | null
  daily_capacity: number
  status: OrgStatus
  hire_date?: string | null
  user?: number | null
  team?: number | null
}
