<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useSkillsStore } from '~/features/skills/stores/skills'
import { useBenchStore } from '~/features/bench/stores/bench'

definePageMeta({})

const { t, locale } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const skillsStore = useSkillsStore()
const store = useBenchStore()
const { showApiError } = useApiErrorToast()

const weekLabel = computed(() => {
  const from = new Date(store.from + 'T12:00:00')
  const to = new Date(store.to + 'T12:00:00')
  const fmt = (d: Date) => d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
})

watch(
  () => [store.teamId, store.skillIds.join(','), store.from, store.to] as const,
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
    await Promise.all([org.loadTeams(), skillsStore.loadAll(), store.load()])
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
        <h2 class="text-xl font-semibold">{{ t('bench.title') }}</h2>
        <p class="text-sm text-muted">{{ t('bench.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(-1)">←</UiButton>
        <UiButton variant="outline" size="sm" @click="store.goToToday()">{{ t('allocations.today') }}</UiButton>
        <span class="text-sm font-medium">{{ weekLabel }}</span>
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(1)">→</UiButton>
        <UiButton size="sm" variant="ghost" @click="refresh">{{ t('actions.refresh') }}</UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="bench-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect
          id="bench-team"
          :model-value="store.teamId ? String(store.teamId) : ''"
          @update:model-value="(v) => { store.teamId = v ? Number(v) : undefined }"
        >
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in org.teams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel>{{ t('bench.filters.skills') }}</UiFormLabel>
        <div class="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border p-2">
          <button
            v-for="skill in skillsStore.skills"
            :key="skill.id"
            type="button"
            class="rounded-md border px-2 py-1 text-xs transition-colors"
            :class="
              store.skillIds.includes(skill.id)
                ? 'border-accent bg-accent/10 text-foreground'
                : 'border-border text-muted hover:bg-hover'
            "
            @click="store.toggleSkill(skill.id)"
          >
            {{ skill.name }}
          </button>
          <p v-if="!skillsStore.skills.length" class="text-xs text-muted">{{ t('empty.generic') }}</p>
        </div>
        <UiButton
          v-if="store.skillIds.length"
          size="sm"
          variant="ghost"
          class="mt-1"
          @click="store.clearSkills()"
        >
          {{ t('skills.filters.reset') }}
        </UiButton>
      </div>
    </div>

    <div v-if="store.loading && !store.data" class="text-sm text-muted">{{ t('bench.loading') }}</div>

    <template v-else-if="store.data">
      <!-- KPI cards -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('bench.kpis.resources') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.totals.employees }}</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('bench.kpis.remaining') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.totals.remaining_hours }}h</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('bench.kpis.benchPct') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.totals.bench_pct }}%</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('bench.kpis.utilization') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.data.totals.utilization_pct }}%</p>
        </div>
      </div>

      <!-- Forecast preview -->
      <div
        v-if="store.forecast?.series.length"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium">{{ t('bench.forecast.title') }}</p>
          <NuxtLink to="/forecast" class="text-xs font-medium text-accent">
            {{ t('bench.forecast.open') }} →
          </NuxtLink>
        </div>
        <p class="mt-1 text-xs text-muted">
          {{ t('bench.forecast.summary', {
            utilization: store.forecast.baseline.utilization_pct,
            over: store.forecast.baseline.over_allocation_days,
          }) }}
        </p>
      </div>

      <div
        v-if="!store.data.employees.length"
        class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
      >
        {{ t('bench.empty') }}
      </div>

      <!-- Desktop table -->
      <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-subtle text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">{{ t('org.fields.fullName') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('org.fields.team') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('bench.columns.available') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('bench.columns.allocated') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('bench.columns.remaining') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('bench.columns.benchPct') }}</th>
              <th class="px-4 py-3 font-medium">{{ t('nav.skills') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in store.data.employees" :key="row.document_id">
              <td class="px-4 py-3 font-medium">{{ row.full_name }}</td>
              <td class="px-4 py-3 text-muted">{{ row.team_name || t('org.none') }}</td>
              <td class="px-4 py-3">{{ row.available_hours }}h</td>
              <td class="px-4 py-3">{{ row.allocated_hours }}h</td>
              <td class="px-4 py-3 font-semibold text-success">
                {{ row.remaining_hours }}h
              </td>
              <td class="px-4 py-3">{{ row.bench_pct }}%</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="sk in row.skills.slice(0, 4)"
                    :key="sk.id"
                    class="rounded bg-subtle px-1.5 py-0.5 text-[10px] text-subtle-foreground"
                  >
                    {{ sk.name }}
                  </span>
                  <span v-if="row.skills.length > 4" class="text-[10px] text-muted">
                    +{{ row.skills.length - 4 }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <ul class="space-y-3 md:hidden">
        <li
          v-for="row in store.data.employees"
          :key="row.document_id"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium">{{ row.full_name }}</p>
              <p class="text-xs text-muted">{{ row.team_name || t('org.none') }}</p>
            </div>
            <p class="text-sm font-semibold text-success">
              {{ row.remaining_hours }}h
            </p>
          </div>
          <p class="mt-2 text-xs text-muted">
            {{ row.allocated_hours }}h / {{ row.available_hours }}h · {{ row.bench_pct }}%
            {{ t('bench.kpis.benchPct').toLowerCase() }}
          </p>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="sk in row.skills.slice(0, 5)"
              :key="sk.id"
              class="rounded bg-subtle px-1.5 py-0.5 text-[10px] text-subtle-foreground"
            >
              {{ sk.name }}
            </span>
          </div>
          <NuxtLink
            v-if="auth.hasRole('administrator', 'department_manager', 'team_leader')"
            :to="'/allocations'"
            class="mt-3 inline-block text-xs font-medium text-accent"
          >
            {{ t('bench.allocate') }} →
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>
