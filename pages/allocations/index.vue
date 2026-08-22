<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import { useProjectsStore } from '~/features/projects/stores/projects'
import AllocationEditor from '~/features/allocations/components/AllocationEditor.vue'
import AllocationGrid from '~/features/allocations/components/AllocationGrid.vue'
import { useAllocationsStore } from '~/features/allocations/stores/allocations'
import type { AllocationInput } from '~/features/allocations/types'
import { cellKey } from '~/features/allocations/types'
import { ApiError } from '~/shared/api/client'
import { ApiErrorCode } from '~/shared/api/error-codes'

definePageMeta({ middleware: ['role'] })

const { t, locale } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const projectsStore = useProjectsStore()
const store = useAllocationsStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const selectedCell = ref<{ employeeId: number; date: string } | null>(null)
const editorOpen = ref(false)
const dragProjectId = ref<number | null>(null)
const mobileDay = ref<string>('')

const canEdit = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)

const activeProjects = computed(() =>
  projectsStore.projects.filter((p) => p.status === 'active' || p.status === 'planned'),
)

const selectedEmployee = computed(() => {
  if (!selectedCell.value || !store.grid) return null
  return store.grid.capacity.employees.find((e) => e.employee_id === selectedCell.value!.employeeId)
})

const selectedDayCapacity = computed(() => {
  if (!selectedCell.value || !selectedEmployee.value) return null
  return selectedEmployee.value.days.find((d) => d.date === selectedCell.value!.date)
})

const selectedAllocations = computed(() => {
  if (!selectedCell.value) return []
  return store.allocationsByCell.get(cellKey(selectedCell.value.employeeId, selectedCell.value.date)) || []
})

const weekLabel = computed(() => {
  const from = new Date(store.from + 'T12:00:00')
  const to = new Date(store.to + 'T12:00:00')
  const fmt = (d: Date) => d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
})

watch(
  () => store.teamId,
  () => store.loadGrid(),
)

onMounted(async () => {
  try {
    await Promise.all([org.loadTeams(), projectsStore.loadProjects(), store.loadGrid()])
    mobileDay.value = store.weekDates[0] || ''
  } catch (e) {
    showApiError(e)
  }
})

function openCell(employeeId: number, date: string) {
  selectedCell.value = { employeeId, date }
  editorOpen.value = true
}

async function onSave(input: AllocationInput, documentId?: string) {
  try {
    await store.saveAllocation(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    editorOpen.value = false
  } catch (e) {
    handleCapacityError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeAllocation(documentId)
    toast.success({ title: t('forms.deleted') })
    editorOpen.value = false
  } catch (e) {
    showApiError(e)
  }
}

function handleCapacityError(e: unknown) {
  if (e instanceof ApiError && e.code === ApiErrorCode.CAPACITY_EXCEEDED) {
    toast.error({
      title: t('allocations.errors.capacityExceededTitle'),
      description: t('allocations.errors.capacityExceeded'),
    })
    return
  }
  showApiError(e)
}

async function onDropProject(employeeId: number, date: string, projectId: number) {
  if (!canEdit.value) return
  try {
    await store.saveAllocation({
      employee: employeeId,
      project: projectId,
      allocation_date: date,
      hours: 8,
      status: 'draft',
    })
    toast.success({ title: t('forms.created') })
  } catch (e) {
    handleCapacityError(e)
  } finally {
    dragProjectId.value = null
  }
}

function onDragStart(projectId: number) {
  dragProjectId.value = projectId
}

async function copyYesterday() {
  const target = selectedCell.value?.date || store.weekDates[0]
  if (!target) return
  try {
    const result = await store.copyDay(target, 'yesterday')
    toast.success({
      title: t('allocations.copyDone'),
      description: t('allocations.copyResult', { created: result.created, skipped: result.skipped }),
    })
  } catch (e) {
    showApiError(e)
  }
}

async function copyPreviousWeek() {
  const target = selectedCell.value?.date || store.weekDates[0]
  if (!target) return
  try {
    const result = await store.copyDay(target, 'previous_week')
    toast.success({
      title: t('allocations.copyDone'),
      description: t('allocations.copyResult', { created: result.created, skipped: result.skipped }),
    })
  } catch (e) {
    showApiError(e)
  }
}

const mobileEmployees = computed(() => store.grid?.capacity.employees || [])
</script>

<template>
  <div class="mx-auto max-w-[100rem] space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('allocations.title') }}</h2>
        <p class="text-sm text-muted">{{ t('allocations.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(-1)">←</UiButton>
        <UiButton variant="outline" size="sm" @click="store.goToToday()">{{ t('allocations.today') }}</UiButton>
        <span class="text-sm font-medium">{{ weekLabel }}</span>
        <UiButton variant="outline" size="sm" @click="store.shiftWeek(1)">→</UiButton>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <div class="min-w-[12rem] space-y-1.5">
        <UiFormLabel for="team-filter">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect id="team-filter" :model-value="store.teamId ? String(store.teamId) : ''" @update:model-value="(v) => { store.teamId = v ? Number(v) : undefined }">
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in org.teams" :key="team.id" :value="String(team.id)">{{ team.name }}</option>
        </UiSelect>
      </div>
      <div v-if="canEdit" class="flex flex-wrap items-end gap-2">
        <UiButton size="sm" variant="outline" @click="copyYesterday">{{ t('allocations.copyYesterday') }}</UiButton>
        <UiButton size="sm" variant="outline" @click="copyPreviousWeek">{{ t('allocations.copyWeek') }}</UiButton>
      </div>
    </div>

    <!-- Project palette for DnD (desktop) -->
    <div v-if="canEdit" class="hidden flex-wrap gap-2 md:flex">
      <p class="w-full text-xs text-muted">{{ t('allocations.dragHint') }}</p>
      <button
        v-for="p in activeProjects"
        :key="p.id"
        type="button"
        draggable="true"
        class="touch-target rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        @dragstart="(e) => { e.dataTransfer?.setData('application/rcp-project-id', String(p.id)); onDragStart(p.id) }"
        @dragend="dragProjectId = null"
      >
        {{ p.code || p.name }}
      </button>
    </div>

    <div v-if="store.loading && !store.grid" class="text-sm text-muted">{{ t('allocations.loading') }}</div>

    <template v-else-if="store.grid">
      <AllocationGrid
        :employees="store.grid.capacity.employees"
        :dates="store.weekDates"
        :allocations-by-cell="store.allocationsByCell"
        :selected-cell="selectedCell"
        :can-edit="canEdit"
        :drag-project-id="dragProjectId"
        @select-cell="openCell"
        @drop-project="onDropProject"
      />

      <!-- Mobile: day picker + cards -->
      <div class="space-y-3 md:hidden">
        <UiSelect v-model="mobileDay">
          <option v-for="d in store.weekDates" :key="d" :value="d">{{ d }}</option>
        </UiSelect>
        <ul class="space-y-3">
          <li
            v-for="emp in mobileEmployees"
            :key="emp.employee_id"
            class="rounded-lg border border-border bg-surface p-4 shadow-soft"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-medium">{{ emp.full_name }}</p>
                <p class="text-xs text-muted">
                  {{ (store.allocationsByCell.get(cellKey(emp.employee_id, mobileDay)) || []).reduce((s, r) => s + r.hours, 0) }}h
                  / {{ emp.days.find((d) => d.date === mobileDay)?.daily_capacity || 0 }}h
                </p>
              </div>
              <UiButton size="sm" variant="outline" @click="openCell(emp.employee_id, mobileDay)">
                {{ canEdit ? t('actions.edit') : t('org.view') }}
              </UiButton>
            </div>
            <ul class="mt-2 space-y-1 text-xs text-muted">
              <li
                v-for="row in store.allocationsByCell.get(cellKey(emp.employee_id, mobileDay)) || []"
                :key="row.documentId"
              >
                {{ row.project_name }} — {{ row.hours }}h
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="editorOpen && selectedCell && selectedEmployee && selectedDayCapacity"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
        @click.self="editorOpen = false"
      >
        <div class="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <AllocationEditor
            :employee-id="selectedCell.employeeId"
            :employee-name="selectedEmployee.full_name"
            :date="selectedCell.date"
            :allocations="selectedAllocations"
            :projects="activeProjects"
            :capacity="selectedDayCapacity.daily_capacity"
            :allocated="selectedDayCapacity.allocated_hours"
            :can-edit="canEdit && selectedDayCapacity.is_working_day"
            @save="onSave"
            @remove="onRemove"
            @cancel="editorOpen = false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
