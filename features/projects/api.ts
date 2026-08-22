import { useApiClient } from '~/shared/api/client'
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
          sort: 'name:asc',
        })}`,
      )
    },

    createSkill(data: SkillInput) {
      return api.post<OneResponse<Skill>>('/api/skills', { data })
    },

    updateSkill(documentId: string, data: Partial<SkillInput>) {
      return api.put<OneResponse<Skill>>(`/api/skills/${documentId}`, { data })
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
          'populate[assigned_employees]': 'true',
          sort: 'name:asc',
        })}`,
      )
    },

    getProject(documentId: string) {
      return api.get<OneResponse<Project>>(
        `/api/projects/${documentId}${qs({
          'populate[client]': 'true',
          'populate[required_skills]': 'true',
          'populate[assigned_employees]': 'true',
        })}`,
      )
    },

    createProject(data: ProjectInput) {
      return api.post<OneResponse<Project>>('/api/projects', { data })
    },

    updateProject(documentId: string, data: Partial<ProjectInput>) {
      return api.put<OneResponse<Project>>(`/api/projects/${documentId}`, { data })
    },

    deleteProject(documentId: string) {
      return api.del(`/api/projects/${documentId}`)
    },

    getProjectSummary(documentId: string) {
      return api.get<{ data: ProjectSummary }>(`/api/projects/${documentId}/summary`)
    },
  }
}
