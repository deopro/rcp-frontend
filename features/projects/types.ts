/** Project domain types (Milestone 4) */

export type OrgStatus = 'active' | 'inactive'

export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled'

export type StrapiMeta = {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type ClientRef = {
  id: number
  documentId: string
  name: string
  status?: OrgStatus
}

export type SkillRef = {
  id: number
  documentId: string
  name: string
  skill_category?: { id: number; name: string } | null
}

export type EmployeeRef = {
  id: number
  documentId: string
  full_name: string
  employee_number?: string
  daily_capacity?: number
}

export type Client = {
  id: number
  documentId: string
  name: string
  description?: string | null
  contact_email?: string | null
  status: OrgStatus
  createdAt?: string
  updatedAt?: string
}

export type Skill = {
  id: number
  documentId: string
  name: string
  description?: string | null
  skill_category?: { id: number; documentId?: string; name: string } | null
  createdAt?: string
  updatedAt?: string
}

export type Project = {
  id: number
  documentId: string
  name: string
  code: string
  description?: string | null
  status: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  client?: ClientRef | null
  required_skills?: SkillRef[]
  assigned_employees?: EmployeeRef[]
  createdAt?: string
  updatedAt?: string
}

export type ProjectSummary = {
  project_id: number
  document_id: string
  from: string | null
  to: string | null
  working_days: number
  assigned_count: number
  capacity_hours: number
  allocated_hours: number
  remaining_hours: number
}

export type ClientInput = {
  name: string
  description?: string | null
  contact_email?: string | null
  status: OrgStatus
}

export type SkillInput = {
  name: string
  description?: string | null
  skill_category?: number | null
}

export type ProjectInput = {
  name: string
  code: string
  description?: string | null
  status: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  client?: number | null
  required_skills?: number[]
  assigned_employees?: number[]
}
