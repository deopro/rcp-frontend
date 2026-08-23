<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import DashboardCharts from '~/features/dashboard/components/DashboardCharts.vue'
import DashboardFilters from '~/features/dashboard/components/DashboardFilters.vue'
import DashboardKpiGrid from '~/features/dashboard/components/DashboardKpiGrid.vue'
import DashboardPendingPanel from '~/features/dashboard/components/DashboardPendingPanel.vue'
import DashboardQuickActions from '~/features/dashboard/components/DashboardQuickActions.vue'
import { useDashboardStore } from '~/features/dashboard/stores/dashboard'

const { t, locale } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const projects = useProjectsStore()
const store = useDashboardStore()
const { showApiError } = useApiErrorToast()

const roleType = computed(() => auth.roleType)

const variant = computed<'employee' | 'manager' | 'executive'>(() => {
  if (roleType.value === 'employee') return 'employee'
  if (roleType.value === 'executive' || roleType.value === 'administrator') return 'executive'
  return 'manager'
})

const titleKey = computed(() => {
  if (roleType.value === 'employee') return 'dashboard.titles.employee'
  if (roleType.value === 'team_leader') return 'dashboard.titles.teamLeader'
  if (roleType.value === 'department_manager') return 'dashboard.titles.departmentManager'
  return 'dashboard.titles.executive'
})

const weekLabel = computed(() => {
  const from = new Date(store.from + 'T12:00:00')
  const to = new Date(store.to + 'T12:00:00')
  const fmt = (d: Date) => d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
})

const showFilters = computed(() =>
  auth.hasRole('administrator', 'executive', 'department_manager', 'team_leader'),
)

const filterProps = computed(() => ({
  showDepartment: auth.hasRole('administrator', 'executive', 'department_manager'),
  showTeam: auth.hasRole('administrator', 'executive', 'department_manager', 'team_leader'),
  showProject: auth.hasRole('administrator', 'executive', 'department_manager', 'team_leader'),
  showEmployee: auth.hasRole(
    'administrator',
    'executive',
    'department_manager',
    'team_leader',
  ),
}))

watch(
  () =>
    [
      store.from,
      store.to,
      store.filters.departmentId,
      store.filters.teamId,
      store.filters.projectId,
      store.filters.employeeId,
    ] as const,
  async () => {
    try {
      await store.load()
    } catch (e) {
      showApiError(e)
    }
  },
  { immediate: false },
)

onMounted(async () => {
  try {
    const loads: Promise<unknown>[] = [store.load()]
    if (showFilters.value) {
      loads.push(org.loadTeams())
      if (filterProps.value.showDepartment) loads.push(org.loadDepartments())
      if (filterProps.value.showEmployee) loads.push(org.loadEmployees())
      if (filterProps.value.showProject) loads.push(projects.loadProjects())
    }
    await Promise.all(loads)
  } catch (e) {
    showApiError(e)
  }
})

async function refresh() {
  try {
    await store.load()
  } catch (e) {
    showApiError(e)
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t(titleKey) }}</h2>
        <p class="text-sm text-muted">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(-1)">←</UiButton>
        <UiButton variant="outline" size="sm" @click="store.goToToday()">
          {{ t('allocations.today') }}
        </UiButton>
        <span class="text-sm font-medium">{{ weekLabel }}</span>
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(1)">→</UiButton>
        <UiButton size="sm" variant="ghost" @click="refresh">{{ t('actions.refresh') }}</UiButton>
      </div>
    </div>

    <DashboardFilters v-if="showFilters" v-bind="filterProps" />

    <UiPageSkeleton v-if="store.loading && !store.data" variant="dashboard" />

    <template v-else-if="store.data">
      <DashboardKpiGrid :kpis="store.data.kpis" :variant="variant" />

      <DashboardQuickActions v-if="variant === 'employee'" />

      <DashboardCharts :data="store.data" />

      <DashboardPendingPanel
        v-if="variant !== 'employee'"
        :approvals="store.data.pending.approvals"
        :leave="store.data.pending.leave"
        :show-approvals="variant === 'manager'"
      />

      <section
        v-if="variant === 'executive'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <NuxtLink
          to="/bench"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.bench') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('bench.subtitle') }}</p>
        </NuxtLink>
        <NuxtLink
          to="/forecast"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.forecast') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('forecast.subtitle') }}</p>
        </NuxtLink>
        <NuxtLink
          to="/ai"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.ai') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('ai.subtitle') }}</p>
        </NuxtLink>
        <NuxtLink
          to="/approvals"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.approvals') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('approvals.subtitle') }}</p>
        </NuxtLink>
        <NuxtLink
          to="/projects"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.projects') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('projects.subtitle') }}</p>
        </NuxtLink>
        <NuxtLink
          to="/reports"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
        >
          <h3 class="text-sm font-semibold">{{ t('nav.reports') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('dashboard.links.reports') }}</p>
        </NuxtLink>
      </section>
    </template>
  </div>
</template>
