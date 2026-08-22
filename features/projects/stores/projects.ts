import { defineStore } from 'pinia'
import { useProjectsApi } from '../api'
import type {
  Client,
  ClientInput,
  Project,
  ProjectInput,
  ProjectSummary,
  Skill,
  SkillInput,
} from '../types'

export const useProjectsStore = defineStore('projects', () => {
  const clients = ref<Client[]>([])
  const skills = ref<Skill[]>([])
  const projects = ref<Project[]>([])
  const summaries = ref<Record<string, ProjectSummary>>({})

  const loading = ref(false)
  const error = ref<string | null>(null)

  function api() {
    return useProjectsApi()
  }

  async function loadClients() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listClients()
      clients.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadSkills() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listSkills()
      skills.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadProjects() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listProjects()
      projects.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadProjectSummary(documentId: string) {
    const res = await api().getProjectSummary(documentId)
    summaries.value[documentId] = res.data
    return res.data
  }

  async function saveClient(input: ClientInput, documentId?: string) {
    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H3',location:'projects.ts:saveClient',message:'saveClient start',data:{isEdit:Boolean(documentId),name:input.name},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      if (documentId) {
        await api().updateClient(documentId, input)
      } else {
        await api().createClient(input)
      }
      await loadClients()
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H3',location:'projects.ts:saveClient-error',message:'saveClient failed',data:{isEdit:Boolean(documentId),err:String(err)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw err
    }
  }

  async function removeClient(documentId: string) {
    await api().deleteClient(documentId)
    await loadClients()
  }

  async function saveSkill(input: SkillInput, documentId?: string) {
    if (documentId) {
      await api().updateSkill(documentId, input)
    } else {
      await api().createSkill(input)
    }
    await loadSkills()
  }

  async function removeSkill(documentId: string) {
    await api().deleteSkill(documentId)
    await loadSkills()
  }

  async function saveProject(input: ProjectInput, documentId?: string) {
    if (documentId) {
      await api().updateProject(documentId, input)
    } else {
      await api().createProject(input)
    }
    await loadProjects()
  }

  async function removeProject(documentId: string) {
    await api().deleteProject(documentId)
    const { [documentId]: _, ...rest } = summaries.value
    summaries.value = rest
    await loadProjects()
  }

  return {
    clients,
    skills,
    projects,
    summaries,
    loading,
    error,
    loadClients,
    loadSkills,
    loadProjects,
    loadProjectSummary,
    saveClient,
    removeClient,
    saveSkill,
    removeSkill,
    saveProject,
    removeProject,
  }
})
