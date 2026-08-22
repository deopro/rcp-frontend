import { useApiClient } from '~/shared/api/client'
import { compactData, connectOne } from '~/shared/api/strapi-payload'
import type {
  EmployeeSkill,
  EmployeeSkillInput,
  Skill,
  SkillCategory,
  SkillCategoryInput,
  SkillInput,
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

export function useSkillsApi() {
  const api = useApiClient()

  return {
    listCategories(page = 1, pageSize = 100) {
      return api.get<ListResponse<SkillCategory>>(
        `/api/skill-categories${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          sort: 'name:asc',
        })}`,
      )
    },

    createCategory(data: SkillCategoryInput) {
      return api.post<OneResponse<SkillCategory>>('/api/skill-categories', { data })
    },

    updateCategory(documentId: string, data: Partial<SkillCategoryInput>) {
      return api.put<OneResponse<SkillCategory>>(`/api/skill-categories/${documentId}`, { data })
    },

    deleteCategory(documentId: string) {
      return api.del(`/api/skill-categories/${documentId}`)
    },

    listSkills(page = 1, pageSize = 300) {
      return api.get<ListResponse<Skill>>(
        `/api/skills${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[skill_category]': 'true',
          sort: 'name:asc',
        })}`,
      )
    },

    createSkill(data: SkillInput) {
      const payload = compactData({
        name: data.name,
        description: data.description,
        skill_category: connectOne(data.skill_category),
      })
      return api.post<OneResponse<Skill>>('/api/skills', { data: payload })
    },

    updateSkill(documentId: string, data: Partial<SkillInput>) {
      const payload = compactData({
        name: data.name,
        description: data.description,
        skill_category:
          data.skill_category !== undefined ? connectOne(data.skill_category) : undefined,
      })
      return api.put<OneResponse<Skill>>(`/api/skills/${documentId}`, { data: payload })
    },

    deleteSkill(documentId: string) {
      return api.del(`/api/skills/${documentId}`)
    },

    listEmployeeSkills(page = 1, pageSize = 500) {
      return api.get<ListResponse<EmployeeSkill>>(
        `/api/employee-skills${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[employee][populate][team]': 'true',
          'populate[skill][populate][skill_category]': 'true',
          sort: 'createdAt:desc',
        })}`,
      )
    },

    createEmployeeSkill(data: EmployeeSkillInput) {
      const payload = compactData({
        employee: connectOne(data.employee),
        skill: connectOne(data.skill),
        proficiency_level: data.proficiency_level,
        years_experience: data.years_experience,
        certification: data.certification,
      })
      return api.post<OneResponse<EmployeeSkill>>('/api/employee-skills', { data: payload })
    },

    updateEmployeeSkill(documentId: string, data: Partial<EmployeeSkillInput>) {
      const payload = compactData({
        employee: data.employee !== undefined ? connectOne(data.employee) : undefined,
        skill: data.skill !== undefined ? connectOne(data.skill) : undefined,
        proficiency_level: data.proficiency_level,
        years_experience: data.years_experience,
        certification: data.certification,
      })
      return api.put<OneResponse<EmployeeSkill>>(`/api/employee-skills/${documentId}`, {
        data: payload,
      })
    },

    deleteEmployeeSkill(documentId: string) {
      return api.del(`/api/employee-skills/${documentId}`)
    },
  }
}
