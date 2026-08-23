<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import { useReportsApi } from '~/features/reports/api'
import type { ReportFormat, ReportType } from '~/features/reports/types'

definePageMeta({
  roles: ['administrator', 'executive', 'department_manager', 'team_leader'],
})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const projects = useProjectsStore()
const reportsApi = useReportsApi()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const downloading = ref(false)

const reportTypes: ReportType[] = [
  'monthly-capacity',
  'employee-allocation',
  'project-allocation',
  'team',
  'department',
  'executive',
  'utilization',
  'bench',
  'skills',
  'forecast',
]

const selectedType = ref<ReportType>('employee-allocation')
const selectedFormat = ref<ReportFormat>('xlsx')
const fromDate = ref(mondayOfWeek(new Date()))
const toDate = ref(addDays(mondayOfWeek(new Date()), 27))
const departmentId = ref<number | undefined>(undefined)
const teamId = ref<number | undefined>(undefined)
const projectId = ref<number | undefined>(undefined)
const scope = ref<'org' | 'department' | 'team' | 'project'>('org')
const granularity = ref<'day' | 'week' | 'month'>('week')

const from = computed(() => toIso(fromDate.value))
const to = computed(() => toIso(toDate.value))

const isTeamLeaderOnly = computed(
  () =>
    auth.hasRole('team_leader') &&
    !auth.hasRole('administrator', 'executive', 'department_manager'),
)

const showOrgFilters = computed(() =>
  auth.hasRole('administrator', 'executive', 'department_manager'),
)

const showForecastOptions = computed(() => selectedType.value === 'forecast')

function mondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(mon.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

onMounted(async () => {
  try {
    await org.loadTeams()
    if (showOrgFilters.value) {
      await Promise.all([org.loadDepartments(), projects.loadProjects()])
    }
    if (isTeamLeaderOnly.value && org.teams.length === 1) {
      teamId.value = org.teams[0]!.id
      scope.value = 'team'
    }
  } catch (e) {
    showApiError(e)
  }
})

async function onDownload() {
  downloading.value = true
  try {
    await reportsApi.download({
      type: selectedType.value,
      format: selectedFormat.value,
      from: from.value,
      to: to.value,
      filters: {
        departmentId: departmentId.value,
        teamId: teamId.value,
        projectId: projectId.value,
        scope: showForecastOptions.value ? scope.value : undefined,
        granularity: showForecastOptions.value ? granularity.value : undefined,
      },
    })
    toast.success({ title: t('reports.downloadDone') })
  } catch (e) {
    showApiError(e)
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-4">
    <div>
      <h2 class="text-xl font-semibold">{{ t('reports.title') }}</h2>
      <p class="text-sm text-muted">{{ t('reports.subtitle') }}</p>
    </div>

    <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
      <div class="space-y-1.5 sm:col-span-2">
        <UiFormLabel for="report-type" required>{{ t('reports.fields.type') }}</UiFormLabel>
        <UiSelect id="report-type" v-model="selectedType">
          <option v-for="type in reportTypes" :key="type" :value="type">
            {{ t(`reports.types.${type}`) }}
          </option>
        </UiSelect>
      </div>

      <div class="space-y-1.5">
        <UiFormLabel for="report-format" required>{{ t('reports.fields.format') }}</UiFormLabel>
        <UiSelect id="report-format" v-model="selectedFormat">
          <option value="xlsx">{{ t('reports.formats.xlsx') }}</option>
          <option value="csv">{{ t('reports.formats.csv') }}</option>
          <option value="pdf">{{ t('reports.formats.pdf') }}</option>
        </UiSelect>
      </div>

      <div class="space-y-1.5">
        <UiFormLabel for="report-from">{{ t('forecast.fields.from') }}</UiFormLabel>
        <UiInput
          id="report-from"
          type="date"
          :model-value="from"
          @update:model-value="(v) => { fromDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="report-to">{{ t('forecast.fields.to') }}</UiFormLabel>
        <UiInput
          id="report-to"
          type="date"
          :model-value="to"
          @update:model-value="(v) => { toDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>

      <div v-if="showOrgFilters" class="space-y-1.5">
        <UiFormLabel for="report-dept">{{ t('org.fields.department') }}</UiFormLabel>
        <UiSelect
          id="report-dept"
          :model-value="departmentId ? String(departmentId) : ''"
          @update:model-value="(v) => { departmentId = v ? Number(v) : undefined }"
        >
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="dept in org.departments" :key="dept.id" :value="String(dept.id)">
            {{ dept.name }}
          </option>
        </UiSelect>
      </div>

      <div v-if="showOrgFilters || isTeamLeaderOnly" class="space-y-1.5">
        <UiFormLabel for="report-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect
          id="report-team"
          :model-value="teamId ? String(teamId) : ''"
          @update:model-value="(v) => { teamId = v ? Number(v) : undefined }"
        >
          <option v-if="!isTeamLeaderOnly" value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in org.teams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>

      <div v-if="showOrgFilters" class="space-y-1.5">
        <UiFormLabel for="report-project">{{ t('projects.fields.name') }}</UiFormLabel>
        <UiSelect
          id="report-project"
          :model-value="projectId ? String(projectId) : ''"
          @update:model-value="(v) => { projectId = v ? Number(v) : undefined }"
        >
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="project in projects.projects" :key="project.id" :value="String(project.id)">
            {{ project.name }}
          </option>
        </UiSelect>
      </div>

      <template v-if="showForecastOptions">
        <div class="space-y-1.5">
          <UiFormLabel for="report-scope">{{ t('forecast.fields.scope') }}</UiFormLabel>
          <UiSelect id="report-scope" v-model="scope">
            <option value="org">{{ t('forecast.scopes.org') }}</option>
            <option value="department">{{ t('forecast.scopes.department') }}</option>
            <option value="team">{{ t('forecast.scopes.team') }}</option>
            <option value="project">{{ t('forecast.scopes.project') }}</option>
          </UiSelect>
        </div>
        <div class="space-y-1.5">
          <UiFormLabel for="report-granularity">{{ t('forecast.fields.granularity') }}</UiFormLabel>
          <UiSelect id="report-granularity" v-model="granularity">
            <option value="day">{{ t('forecast.granularity.day') }}</option>
            <option value="week">{{ t('forecast.granularity.week') }}</option>
            <option value="month">{{ t('forecast.granularity.month') }}</option>
          </UiSelect>
        </div>
      </template>

      <div class="flex items-end sm:col-span-2">
        <UiButton :disabled="downloading" @click="onDownload">
          {{ downloading ? t('reports.downloading') : t('reports.download') }}
        </UiButton>
      </div>
    </div>

    <p class="text-xs text-muted">{{ t('reports.hint') }}</p>
  </div>
</template>
