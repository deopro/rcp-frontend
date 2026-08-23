<script setup lang="ts">
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import { useDashboardStore } from '../stores/dashboard'

defineProps<{
  showDepartment?: boolean
  showTeam?: boolean
  showProject?: boolean
  showEmployee?: boolean
}>()

const { t } = useI18n()
const store = useDashboardStore()
const org = useOrganizationStore()
const projects = useProjectsStore()

const filteredTeams = computed(() => {
  const deptId = store.filters.departmentId
  if (!deptId) return org.teams
  return org.teams.filter((team) => team.department?.id === deptId)
})

function onSelect(key: 'departmentId' | 'teamId' | 'projectId' | 'employeeId', raw: string) {
  store.setFilter(key, raw ? Number(raw) : undefined)
}

function reset() {
  store.clearFilters()
}
</script>

<template>
  <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
    <div v-if="showDepartment" class="space-y-1.5">
      <UiFormLabel for="dash-dept">{{ t('org.fields.department') }}</UiFormLabel>
      <UiSelect
        id="dash-dept"
        :model-value="store.filters.departmentId ? String(store.filters.departmentId) : ''"
        @update:model-value="(v) => onSelect('departmentId', v)"
      >
        <option value="">{{ t('skills.filters.all') }}</option>
        <option v-for="dept in org.departments" :key="dept.id" :value="String(dept.id)">
          {{ dept.name }}
        </option>
      </UiSelect>
    </div>

    <div v-if="showTeam" class="space-y-1.5">
      <UiFormLabel for="dash-team">{{ t('org.fields.team') }}</UiFormLabel>
      <UiSelect
        id="dash-team"
        :model-value="store.filters.teamId ? String(store.filters.teamId) : ''"
        @update:model-value="(v) => onSelect('teamId', v)"
      >
        <option value="">{{ t('skills.filters.all') }}</option>
        <option v-for="team in filteredTeams" :key="team.id" :value="String(team.id)">
          {{ team.name }}
        </option>
      </UiSelect>
    </div>

    <div v-if="showProject" class="space-y-1.5">
      <UiFormLabel for="dash-project">{{ t('projects.fields.name') }}</UiFormLabel>
      <UiSelect
        id="dash-project"
        :model-value="store.filters.projectId ? String(store.filters.projectId) : ''"
        @update:model-value="(v) => onSelect('projectId', v)"
      >
        <option value="">{{ t('skills.filters.all') }}</option>
        <option v-for="project in projects.projects" :key="project.id" :value="String(project.id)">
          {{ project.name }}
        </option>
      </UiSelect>
    </div>

    <div v-if="showEmployee" class="space-y-1.5">
      <UiFormLabel for="dash-employee">{{ t('org.fields.fullName') }}</UiFormLabel>
      <UiSelect
        id="dash-employee"
        :model-value="store.filters.employeeId ? String(store.filters.employeeId) : ''"
        @update:model-value="(v) => onSelect('employeeId', v)"
      >
        <option value="">{{ t('skills.filters.all') }}</option>
        <option v-for="emp in org.employees" :key="emp.id" :value="String(emp.id)">
          {{ emp.full_name }}
        </option>
      </UiSelect>
    </div>

    <div class="flex items-end sm:col-span-2 lg:col-span-4">
      <UiButton size="sm" variant="ghost" @click="reset">{{ t('dashboard.filters.reset') }}</UiButton>
    </div>
  </div>
</template>
