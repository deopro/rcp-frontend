<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import { useForecastStore } from '~/features/forecast/stores/forecast'
import type { ForecastScope } from '~/features/forecast/types'
import ForecastChart from '~/features/forecast/components/ForecastChart.vue'
import ForecastHealthLegend from '~/features/forecast/components/ForecastHealthLegend.vue'

definePageMeta({
  roles: ['administrator', 'executive', 'department_manager', 'team_leader'],
})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const projects = useProjectsStore()
const store = useForecastStore()
const { showApiError } = useApiErrorToast()

const scopeOptions = computed(() => {
  const opts: { value: ForecastScope; label: string }[] = []
  if (auth.hasRole('administrator', 'executive')) {
    opts.push({ value: 'org', label: t('forecast.scopes.org') })
    opts.push({ value: 'department', label: t('forecast.scopes.department') })
  }
  if (auth.hasRole('administrator', 'executive', 'department_manager', 'team_leader')) {
    opts.push({ value: 'team', label: t('forecast.scopes.team') })
  }
  opts.push({ value: 'project', label: t('forecast.scopes.project') })
  return opts
})

const filteredTeams = computed(() => {
  const deptId = store.filters.departmentId
  if (!deptId) return org.teams
  return org.teams.filter((team) => team.department?.id === deptId)
})

const isTeamLeaderOnly = computed(
  () =>
    auth.hasRole('team_leader') &&
    !auth.hasRole('administrator', 'executive', 'department_manager'),
)

watch(
  () =>
    [
      store.from,
      store.to,
      store.scope,
      store.granularity,
      store.filters.departmentId,
      store.filters.teamId,
      store.filters.projectId,
    ] as const,
  async () => {
    try {
      await store.load()
    } catch (e) {
      showApiError(e)
    }
  },
)

onMounted(async () => {
  try {
    await org.loadTeams()
    if (isTeamLeaderOnly.value) {
      store.initForTeamLeader(org.teams.map((team) => team.id))
    } else {
      await Promise.all([org.loadDepartments(), projects.loadProjects()])
    }
    await store.load()
  } catch (e) {
    showApiError(e)
  }
})

function onScopeChange(raw: string) {
  store.scope = raw as ForecastScope
  store.clearFilters()
  if (isTeamLeaderOnly.value && raw === 'team' && org.teams.length) {
    store.setFilter('teamId', org.teams[0]!.id)
  }
  if (raw === 'project' && !projects.projects.length) {
    projects.loadProjects().catch((e) => showApiError(e))
  }
}

function onFilter(key: 'departmentId' | 'teamId' | 'projectId', raw: string) {
  store.setFilter(key, raw ? Number(raw) : undefined)
}

const seriesRows = computed(() => store.data?.series ?? [])
const {
  page,
  pageSize,
  pageCount,
  total,
  pageItems,
  from,
  to,
} = useClientPagination(seriesRows)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('forecast.title') }}</h2>
        <p class="text-sm text-muted">{{ t('forecast.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton variant="outline" size="sm" @click="store.shiftWindow(-4)">←</UiButton>
        <UiButton variant="outline" size="sm" @click="store.resetWindow()">
          {{ t('forecast.today') }}
        </UiButton>
        <UiButton variant="outline" size="sm" @click="store.shiftWindow(4)">→</UiButton>
      </div>
    </div>

    <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-1.5">
        <UiFormLabel for="fc-scope">{{ t('forecast.fields.scope') }}</UiFormLabel>
        <UiSelect id="fc-scope" :model-value="store.scope" @update:model-value="onScopeChange">
          <option v-for="opt in scopeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="fc-gran">{{ t('forecast.fields.granularity') }}</UiFormLabel>
        <UiSelect
          id="fc-gran"
          :model-value="store.granularity"
          @update:model-value="(v) => { store.granularity = v as typeof store.granularity }"
        >
          <option value="day">{{ t('forecast.granularity.day') }}</option>
          <option value="week">{{ t('forecast.granularity.week') }}</option>
          <option value="month">{{ t('forecast.granularity.month') }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="fc-from">{{ t('forecast.fields.from') }}</UiFormLabel>
        <UiInput
          id="fc-from"
          type="date"
          :model-value="store.from"
          @update:model-value="(v) => { store.fromDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="fc-to">{{ t('forecast.fields.to') }}</UiFormLabel>
        <UiInput
          id="fc-to"
          type="date"
          :model-value="store.to"
          @update:model-value="(v) => { store.toDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>

      <div v-if="store.scope === 'department' || store.scope === 'org'" class="space-y-1.5">
        <UiFormLabel for="fc-dept">{{ t('org.fields.department') }}</UiFormLabel>
        <UiSelect
          id="fc-dept"
          :model-value="store.filters.departmentId ? String(store.filters.departmentId) : ''"
          @update:model-value="(v) => onFilter('departmentId', v)"
        >
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="dept in org.departments" :key="dept.id" :value="String(dept.id)">
            {{ dept.name }}
          </option>
        </UiSelect>
      </div>

      <div
        v-if="store.scope === 'team' || store.scope === 'department' || isTeamLeaderOnly"
        class="space-y-1.5"
      >
        <UiFormLabel for="fc-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect
          id="fc-team"
          :model-value="store.filters.teamId ? String(store.filters.teamId) : ''"
          @update:model-value="(v) => onFilter('teamId', v)"
        >
          <option v-if="!isTeamLeaderOnly" value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in filteredTeams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>

      <div v-if="store.scope === 'project'" class="space-y-1.5 sm:col-span-2">
        <UiFormLabel for="fc-project">{{ t('projects.fields.name') }}</UiFormLabel>
        <UiSelect
          id="fc-project"
          :model-value="store.filters.projectId ? String(store.filters.projectId) : ''"
          @update:model-value="(v) => onFilter('projectId', v)"
        >
          <option value="">{{ t('org.select') }}</option>
          <option v-for="project in projects.projects" :key="project.id" :value="String(project.id)">
            {{ project.name }}
          </option>
        </UiSelect>
      </div>
    </div>

    <div v-if="store.loading && !store.data" class="text-sm text-muted">{{ t('forecast.loading') }}</div>

    <template v-else-if="store.data">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('forecast.kpis.utilization') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.baseline.utilization_pct }}%</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('forecast.kpis.bench') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.baseline.bench_pct }}%</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('forecast.kpis.remaining') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.baseline.remaining_hours }}h</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('forecast.kpis.overDays') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.baseline.over_allocation_days }}</p>
        </div>
      </div>

      <ForecastHealthLegend />

      <ForecastChart :data="store.data" />

      <section
        v-if="store.data.project_demand"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <h3 class="text-sm font-semibold">{{ t('forecast.projectDemand.title') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ store.data.project_demand.project_name }}</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p class="text-xs text-muted">{{ t('forecast.projectDemand.capacity') }}</p>
            <p class="font-semibold">{{ store.data.project_demand.capacity_hours }}h</p>
          </div>
          <div>
            <p class="text-xs text-muted">{{ t('forecast.projectDemand.allocated') }}</p>
            <p class="font-semibold">{{ store.data.project_demand.allocated_hours }}h</p>
          </div>
          <div>
            <p class="text-xs text-muted">{{ t('forecast.projectDemand.demand') }}</p>
            <p class="font-semibold">{{ store.data.project_demand.demand_pct }}%</p>
          </div>
        </div>
      </section>

      <div v-if="!store.data.series.length" class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted">
        {{ t('forecast.empty') }}
      </div>

      <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 font-medium">{{ t('forecast.columns.period') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('forecast.columns.utilization') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('forecast.columns.bench') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('forecast.columns.over') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('forecast.columns.health') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in pageItems" :key="row.period_start">
              <td class="px-4 py-3 font-mono text-xs">{{ row.label }}</td>
              <td class="px-4 py-3">{{ row.utilization_pct }}%</td>
              <td class="px-4 py-3">{{ row.bench_pct }}%</td>
              <td class="px-4 py-3">{{ row.over_allocated_hours }}h</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200': row.health === 'over',
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200': row.health === 'under',
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200': row.health === 'healthy',
                  }"
                >
                  {{ t(`forecast.health.${row.health}`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul v-if="store.data.series.length" class="space-y-3 md:hidden">
        <li
          v-for="row in pageItems"
          :key="row.period_start"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="font-mono text-xs font-medium">{{ row.label }}</p>
            <span
              class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
              :class="{
                'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200': row.health === 'over',
                'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200': row.health === 'under',
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200': row.health === 'healthy',
              }"
            >
              {{ t(`forecast.health.${row.health}`) }}
            </span>
          </div>
          <p class="mt-2 text-xs text-muted">
            {{ t('forecast.columns.utilization') }} {{ row.utilization_pct }}%
            · {{ t('forecast.columns.bench') }} {{ row.bench_pct }}%
            · {{ t('forecast.columns.over') }} {{ row.over_allocated_hours }}h
          </p>
        </li>
      </ul>

      <UiPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="pageCount"
        :total="total"
        :from="from"
        :to="to"
      />
    </template>
  </div>
</template>
