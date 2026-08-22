/** Skills domain types (Milestone 5) */

export type ProficiencyLevel = 'basic' | 'intermediate' | 'advanced' | 'expert'

export type StrapiMeta = {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type SkillCategoryRef = {
  id: number
  documentId: string
  name: string
}

export type SkillCategory = {
  id: number
  documentId: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export type Skill = {
  id: number
  documentId: string
  name: string
  description?: string | null
  skill_category?: SkillCategoryRef | null
  createdAt?: string
  updatedAt?: string
}

export type EmployeeRef = {
  id: number
  documentId: string
  full_name: string
  employee_number?: string
  team?: { id: number; name?: string } | null
}

export type EmployeeSkill = {
  id: number
  documentId: string
  proficiency_level: ProficiencyLevel
  years_experience: number
  certification?: string | null
  employee?: EmployeeRef | null
  skill?: (Skill & { skill_category?: SkillCategoryRef | null }) | null
  createdAt?: string
  updatedAt?: string
}

export type SkillCategoryInput = {
  name: string
  description?: string | null
}

export type SkillInput = {
  name: string
  description?: string | null
  skill_category?: number | null
}

export type EmployeeSkillInput = {
  employee: number
  skill: number
  proficiency_level: ProficiencyLevel
  years_experience: number
  certification?: string | null
}

export type MatrixFilters = {
  search: string
  categoryId: string
  teamId: string
  proficiency: string
}
