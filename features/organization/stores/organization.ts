import { defineStore } from 'pinia'
import { useOrganizationApi } from '../api'
import type {
  Department,
  DepartmentInput,
  Employee,
  EmployeeInput,
  Team,
  TeamInput,
  UserOption,
} from '../types'

export const useOrganizationStore = defineStore('organization', () => {
  const departments = ref<Department[]>([])
  const teams = ref<Team[]>([])
  const employees = ref<Employee[]>([])
  const userOptions = ref<UserOption[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  function api() {
    return useOrganizationApi()
  }

  async function loadDepartments() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listDepartments()
      departments.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadTeams() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listTeams()
      teams.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadEmployees() {
    loading.value = true
    error.value = null
    try {
      const res = await api().listEmployees()
      employees.value = res.data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadEmployee(documentId: string) {
    const res = await api().getEmployee(documentId)
    return res.data || null
  }

  async function loadUserOptions() {
    try {
      const res = await api().listUserOptions()
      userOptions.value = res.data || []
    } catch {
      userOptions.value = []
    }
  }

  async function saveDepartment(input: DepartmentInput, documentId?: string) {
    if (documentId) {
      await api().updateDepartment(documentId, input)
    } else {
      await api().createDepartment(input)
    }
    await loadDepartments()
  }

  async function removeDepartment(documentId: string) {
    await api().deleteDepartment(documentId)
    await loadDepartments()
  }

  async function saveTeam(input: TeamInput, documentId?: string) {
    if (documentId) {
      await api().updateTeam(documentId, input)
    } else {
      await api().createTeam(input)
    }
    await loadTeams()
  }

  async function removeTeam(documentId: string) {
    await api().deleteTeam(documentId)
    await loadTeams()
  }

  async function saveEmployee(input: EmployeeInput, documentId?: string) {
    if (documentId) {
      await api().updateEmployee(documentId, input)
    } else {
      await api().createEmployee(input)
    }
    await loadEmployees()
  }

  async function removeEmployee(documentId: string) {
    await api().deleteEmployee(documentId)
    await loadEmployees()
  }

  return {
    departments,
    teams,
    employees,
    userOptions,
    loading,
    error,
    loadDepartments,
    loadTeams,
    loadEmployees,
    loadEmployee,
    loadUserOptions,
    saveDepartment,
    removeDepartment,
    saveTeam,
    removeTeam,
    saveEmployee,
    removeEmployee,
  }
})
