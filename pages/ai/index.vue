<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import { useAiStore } from '~/features/ai/stores/ai'
import type { RecommendationMatch } from '~/features/ai/types'

definePageMeta({
  roles: ['administrator', 'executive', 'department_manager', 'team_leader'],
})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const projects = useProjectsStore()
const store = useAiStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()
const confirm = useConfirmDialog()

const applyOpen = ref(false)
const applyTarget = ref<RecommendationMatch | null>(null)
const applyForm = reactive({ date: '', hours: '4', notes: '' })

const isTeamLeaderOnly = computed(
  () =>
    auth.hasRole('team_leader') &&
    !auth.hasRole('administrator', 'executive', 'department_manager'),
)

onMounted(async () => {
  try {
    await Promise.all([projects.loadProjects(), org.loadTeams()])
    if (isTeamLeaderOnly.value && org.teams.length === 1) {
      store.teamId = org.teams[0]!.id
    }
  } catch (e) {
    showApiError(e)
  }
})

async function onRecommend() {
  if (!store.projectId) {
    toast.error({ title: t('errors.title'), description: t('ai.validation.project') })
    return
  }
  try {
    await store.recommend()
    if (!store.result?.matches.length) {
      toast.info({ title: t('ai.empty') })
    }
  } catch (e) {
    showApiError(e)
  }
}

function openApply(match: RecommendationMatch) {
  applyTarget.value = match
  applyForm.date = store.from
  applyForm.hours = '4'
  applyForm.notes = ''
  applyOpen.value = true
}

async function confirmApply() {
  if (!applyTarget.value || !store.result) return
  const hours = Number(applyForm.hours)
  if (!applyForm.date || !hours || hours <= 0) {
    toast.error({ title: t('errors.title'), description: t('ai.validation.apply') })
    return
  }

  const ok = await confirm.confirm({
    title: t('ai.apply.confirmTitle'),
    description: t('ai.apply.confirmDescription', {
      name: applyTarget.value.full_name,
      hours,
      date: applyForm.date,
    }),
    confirmLabel: t('ai.apply.confirmAction'),
  })
  if (!ok) return

  try {
    await store.applyMatch({
      employeeId: applyTarget.value.employee_id,
      allocationDate: applyForm.date,
      hours,
      notes: applyForm.notes.trim() || undefined,
    })
    toast.success({ title: t('ai.apply.done') })
    applyOpen.value = false
    applyTarget.value = null
  } catch (e) {
    showApiError(e)
  }
}

function scoreClass(score: number) {
  if (score >= 75) return 'text-emerald-700 dark:text-emerald-300'
  if (score >= 50) return 'text-amber-700 dark:text-amber-300'
  return 'text-muted'
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4">
    <div>
      <h2 class="text-xl font-semibold">{{ t('ai.title') }}</h2>
      <p class="text-sm text-muted">{{ t('ai.subtitle') }}</p>
      <p class="mt-1 text-xs text-muted">{{ t('ai.disclaimer') }}</p>
    </div>

    <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-1.5 sm:col-span-2">
        <UiFormLabel for="ai-project" required>{{ t('projects.fields.name') }}</UiFormLabel>
        <UiSelect
          id="ai-project"
          :model-value="store.projectId ? String(store.projectId) : ''"
          @update:model-value="(v) => { store.projectId = v ? Number(v) : undefined }"
        >
          <option value="">{{ t('org.select') }}</option>
          <option v-for="p in projects.projects" :key="p.id" :value="String(p.id)">
            {{ p.name }}
          </option>
        </UiSelect>
      </div>

      <div v-if="!isTeamLeaderOnly" class="space-y-1.5">
        <UiFormLabel for="ai-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect
          id="ai-team"
          :model-value="store.teamId ? String(store.teamId) : ''"
          @update:model-value="(v) => { store.teamId = v ? Number(v) : undefined }"
        >
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in org.teams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>

      <div v-else-if="org.teams.length > 1" class="space-y-1.5">
        <UiFormLabel for="ai-team-tl">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect
          id="ai-team-tl"
          :model-value="store.teamId ? String(store.teamId) : ''"
          @update:model-value="(v) => { store.teamId = v ? Number(v) : undefined }"
        >
          <option v-for="team in org.teams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>

      <div class="space-y-1.5">
        <UiFormLabel for="ai-from">{{ t('forecast.fields.from') }}</UiFormLabel>
        <UiInput
          id="ai-from"
          type="date"
          :model-value="store.from"
          @update:model-value="(v) => { store.fromDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="ai-to">{{ t('forecast.fields.to') }}</UiFormLabel>
        <UiInput
          id="ai-to"
          type="date"
          :model-value="store.to"
          @update:model-value="(v) => { store.toDate = new Date(String(v) + 'T12:00:00') }"
        />
      </div>

      <div class="flex items-end sm:col-span-2 lg:col-span-4">
        <UiButton :disabled="store.loading" @click="onRecommend">
          {{ store.loading ? t('ai.loading') : t('ai.recommend') }}
        </UiButton>
      </div>
    </div>

    <div v-if="store.loading" class="text-sm text-muted">{{ t('ai.loading') }}</div>

    <template v-else-if="store.result">
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('ai.summary.candidates') }}</p>
          <p class="mt-1 text-2xl font-semibold">{{ store.result.availability_summary.candidates }}</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('ai.summary.bench') }}</p>
          <p class="mt-1 text-2xl font-semibold">
            {{ store.result.availability_summary.total_remaining_hours }}h
          </p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p class="text-xs text-muted">{{ t('ai.summary.provider') }}</p>
          <p class="mt-1 text-lg font-semibold">{{ store.result.provider }}</p>
        </div>
      </div>

      <div
        v-if="!store.result.matches.length"
        class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
      >
        {{ t('ai.empty') }}
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="match in store.result.matches"
          :key="match.employee_id"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-medium">{{ match.full_name }}</p>
              <p class="text-xs text-muted">
                {{ match.team_name || t('org.none') }} ·
                {{ t('ai.fields.skillScore') }} {{ match.skill_score }}% ·
                {{ t('ai.fields.availability') }} {{ match.remaining_hours }}h
              </p>
            </div>
            <p class="text-2xl font-semibold" :class="scoreClass(match.score)">
              {{ match.score }}
            </p>
          </div>

          <p v-if="match.explanation" class="mt-2 text-sm text-muted">{{ match.explanation }}</p>

          <ul v-if="match.reasons.length" class="mt-2 flex flex-wrap gap-1">
            <li
              v-for="(reason, idx) in match.reasons"
              :key="idx"
              class="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800"
            >
              {{ reason }}
            </li>
          </ul>

          <UiButton class="mt-3" size="sm" variant="outline" @click="openApply(match)">
            {{ t('ai.apply.action') }}
          </UiButton>
        </li>
      </ul>
    </template>

    <Teleport to="body">
      <div
        v-if="applyOpen && applyTarget"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
        @click.self="applyOpen = false"
      >
        <div class="w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="text-lg font-semibold">{{ t('ai.apply.title') }}</h3>
          <p class="text-sm text-muted">{{ applyTarget.full_name }} · {{ store.result?.project_name }}</p>

          <div class="space-y-1.5">
            <UiFormLabel for="apply-date" required>{{ t('allocations.fields.date') }}</UiFormLabel>
            <UiInput id="apply-date" v-model="applyForm.date" type="date" />
          </div>
          <div class="space-y-1.5">
            <UiFormLabel for="apply-hours" required>{{ t('allocations.fields.hours') }}</UiFormLabel>
            <UiInput id="apply-hours" v-model="applyForm.hours" type="number" min="0.5" step="0.5" />
          </div>
          <div class="space-y-1.5">
            <UiFormLabel for="apply-notes">{{ t('allocations.fields.notes') }}</UiFormLabel>
            <textarea
              id="apply-notes"
              v-model="applyForm.notes"
              rows="2"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>

          <div class="flex justify-end gap-2">
            <UiButton variant="outline" :disabled="store.applying" @click="applyOpen = false">
              {{ t('actions.cancel') }}
            </UiButton>
            <UiButton :disabled="store.applying" @click="confirmApply">
              {{ t('ai.apply.confirmAction') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
