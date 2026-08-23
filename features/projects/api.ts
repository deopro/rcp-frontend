import { useApiClient } from '~/shared/api/client'
import { compactData, connectMany, connectOne } from '~/shared/api/strapi-payload'
import type {
  Client,
  ClientInput,
  Project,
  ProjectInput,
  ProjectSummary,
  Skill,
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

export function useProjectsApi() {
  const api = useApiClient()

  return {
    listClients(page = 1, pageSize = 100) {
      return api.get<ListResponse<Client>>(
        `/api/clients${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          sort: 'name:asc',
        })}`,
      )
    },

    createClient(data: ClientInput) {
      return api.post<OneResponse<Client>>('/api/clients', { data })
    },

    updateClient(documentId: string, data: Partial<ClientInput>) {
      return api.put<OneResponse<Client>>(`/api/clients/${documentId}`, { data })
    },

    deleteClient(documentId: string) {
      return api.del(`/api/clients/${documentId}`)
    },

    listSkills(page = 1, pageSize = 200) {
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

    listProjects(page = 1, pageSize = 50) {
      return api.get<ListResponse<Project>>(
        `/api/projects${qs({
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
          'populate[client]': 'true',
          'populate[required_skills]': 'true',
          'populate[assigned_employees][fields][0]': 'full_name',
          'populate[assigned_employees][fields][1]': 'id',
          sort: 'name:asc',
        })}`,
      )
    },

    getProject(documentId: string) {
      return api.get<OneResponse<Project>>(
        `/api/projects/${documentId}${qs({
          'populate[client]': 'true',
          'populate[required_skills]': 'true',
          'populate[assigned_employees][fields][0]': 'full_name',
          'populate[assigned_employees][fields][1]': 'id',
        })}`,
      )
    },

    createProject(data: ProjectInput) {
      const payload = compactData({
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        client: connectOne(data.client),
        required_skills: connectMany(data.required_skills),
        assigned_employees: connectMany(data.assigned_employees),
      })
      return api.post<OneResponse<Project>>('/api/projects', { data: payload })
    },

    updateProject(documentId: string, data: Partial<ProjectInput>) {
      const payload = compactData({
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        client: data.client !== undefined ? connectOne(data.client) : undefined,
        required_skills:
          data.required_skills !== undefined ? connectMany(data.required_skills) : undefined,
        assigned_employees:
          data.assigned_employees !== undefined ? connectMany(data.assigned_employees) : undefined,
      })
      return api.put<OneResponse<Project>>(`/api/projects/${documentId}`, { data: payload })
    },

    deleteProject(documentId: string) {
      return api.del(`/api/projects/${documentId}`)
    },

    getProjectSummary(documentId: string) {
      return api.get<{ data: ProjectSummary }>(`/api/projects/${documentId}/summary`)
    },
  }
}
