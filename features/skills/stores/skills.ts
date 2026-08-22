import { defineStore } from 'pinia'
import { useSkillsApi } from '../api'
import type {
  EmployeeSkill,
  EmployeeSkillInput,
  MatrixFilters,
  Skill,
  SkillCategory,
  SkillCategoryInput,
  SkillInput,
} from '../types'

export const useSkillsStore = defineStore('skills', () => {
  const categories = ref<SkillCategory[]>([])
  const skills = ref<Skill[]>([])
  const employeeSkills = ref<EmployeeSkill[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = reactive<MatrixFilters>({
    search: '',
    categoryId: '',
    teamId: '',
    proficiency: '',
  })

  function api() {
    return useSkillsApi()
  }

  const filteredMatrix = computed(() => {
    const q = filters.search.trim().toLowerCase()
    return employeeSkills.value.filter((row) => {
      const employeeName = row.employee?.full_name?.toLowerCase() || ''
      const skillName = row.skill?.name?.toLowerCase() || ''
      const categoryId = row.skill?.skill_category?.id
      const teamId = row.employee?.team?.id
      const level = row.proficiency_level

      if (q && !employeeName.includes(q) && !skillName.includes(q)) return false
      if (filters.categoryId && String(categoryId) !== filters.categoryId) return false
      if (filters.teamId && String(teamId) !== filters.teamId) return false
      if (filters.proficiency && level !== filters.proficiency) return false
      return true
    })
  })

  const teamOptions = computed(() => {
    const map = new Map<number, string>()
    for (const row of employeeSkills.value) {
      const team = row.employee?.team
      if (team?.id && team.name) map.set(team.id, team.name)
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      const [catRes, skillRes, matrixRes] = await Promise.all([
        api().listCategories(),
        api().listSkills(),
        api().listEmployeeSkills(),
      ])
      categories.value = catRes.data || []
      skills.value = skillRes.data || []
      employeeSkills.value = matrixRes.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function saveCategory(input: SkillCategoryInput, documentId?: string) {
    if (documentId) await api().updateCategory(documentId, input)
    else await api().createCategory(input)
    await loadAll()
  }

  async function removeCategory(documentId: string) {
    await api().deleteCategory(documentId)
    await loadAll()
  }

  async function saveSkill(input: SkillInput, documentId?: string) {
    if (documentId) await api().updateSkill(documentId, input)
    else await api().createSkill(input)
    await loadAll()
  }

  async function removeSkill(documentId: string) {
    await api().deleteSkill(documentId)
    await loadAll()
  }

  async function saveEmployeeSkill(input: EmployeeSkillInput, documentId?: string) {
    if (documentId) await api().updateEmployeeSkill(documentId, input)
    else await api().createEmployeeSkill(input)
    await loadAll()
  }

  async function removeEmployeeSkill(documentId: string) {
    await api().deleteEmployeeSkill(documentId)
    await loadAll()
  }

  function resetFilters() {
    filters.search = ''
    filters.categoryId = ''
    filters.teamId = ''
    filters.proficiency = ''
  }

  return {
    categories,
    skills,
    employeeSkills,
    filteredMatrix,
    teamOptions,
    filters,
    loading,
    error,
    loadAll,
    saveCategory,
    removeCategory,
    saveSkill,
    removeSkill,
    saveEmployeeSkill,
    removeEmployeeSkill,
    resetFilters,
  }
})
