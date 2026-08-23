<script setup lang="ts">
import type { AllocationInput, GridAllocation } from '../types'

const props = defineProps<{
  employeeId: number
  employeeName: string
  date: string
  allocations: GridAllocation[]
  projects: { id: number; name: string; code?: string }[]
  capacity: number
  allocated: number
  canEdit: boolean
  /** When set (e.g. after drag-and-drop), open the form with this project selected. */
  presetProjectId?: number | null
  onSave: (input: AllocationInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()

const { t } = useI18n()
const crud = useCrudActions()

const panel = ref<'list' | 'form'>('list')
const editing = ref<GridAllocation | null>(null)

const form = reactive({
  project: '' as string,
  hours: '8',
  notes: '',
  status: 'draft' as 'draft' | 'submitted',
})

const saving = ref(false)
const remaining = computed(() => Math.max(0, props.capacity - props.allocated))

function resetForm(projectId?: number | null) {
  editing.value = null
  form.project = projectId != null ? String(projectId) : ''
  form.hours = String(Math.min(8, remaining.value || 8) || 8)
  form.notes = ''
  form.status = 'draft'
}

function openAdd() {
  resetForm()
  panel.value = 'form'
}

function openEdit(row: GridAllocation) {
  editing.value = row
  form.project = row.project_id != null ? String(row.project_id) : ''
  form.hours = String(row.hours)
  form.notes = row.notes || ''
  form.status = row.status
  panel.value = 'form'
}

watch(
  () => [props.presetProjectId, props.employeeId, props.date] as const,
  ([projectId]) => {
    if (projectId != null && props.canEdit) {
      resetForm(projectId)
      panel.value = 'form'
    } else {
      panel.value = 'list'
      editing.value = null
    }
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('allocations.fields.project'), value: form.project },
      { label: t('allocations.fields.hours'), value: form.hours },
    ])
  ) {
    return
  }
  if (!(await crud.confirmSave(Boolean(editing.value)))) return

  saving.value = true
  try {
    await props.onSave(
      {
        employee: props.employeeId,
        project: Number(form.project),
        allocation_date: props.date,
        hours: Number(form.hours),
        notes: form.notes.trim() || null,
        status: form.status,
      },
      editing.value?.documentId,
    )
    panel.value = 'list'
  } finally {
    saving.value = false
  }
}

function cancelForm() {
  if (props.presetProjectId != null) {
    emit('cancel')
    return
  }
  panel.value = 'list'
}

async function onDelete(documentId: string) {
  if (!props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-lg border border-border bg-subtle p-3">
      <p class="text-sm font-medium">{{ employeeName }}</p>
      <p class="text-xs text-muted">{{ date }}</p>
      <p class="mt-2 text-xs">
        {{ allocated }}h / {{ capacity }}h
        <span class="text-muted">({{ t('allocations.remaining') }}: {{ remaining }}h)</span>
      </p>
    </div>

    <template v-if="panel === 'list'">
      <ul v-if="allocations.length" class="divide-y divide-border rounded-lg border border-border">
        <li
          v-for="row in allocations"
          :key="row.documentId"
          class="flex items-center justify-between gap-2 px-3 py-2.5"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ row.project_name }}</p>
            <p class="text-xs text-muted">{{ row.hours }}h · {{ t(`allocations.status.${row.status}`) }}</p>
          </div>
          <UiButton v-if="canEdit" size="sm" variant="ghost" @click="openEdit(row)">
            {{ t('actions.edit') }}
          </UiButton>
        </li>
      </ul>
      <p v-else class="text-sm text-muted">{{ t('allocations.cellEmpty') }}</p>

      <div class="flex flex-wrap gap-2">
        <UiButton v-if="canEdit" size="sm" @click="openAdd">{{ t('allocations.addLine') }}</UiButton>
        <UiButton size="sm" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
      </div>
    </template>

    <form v-else class="space-y-3" novalidate @submit.prevent="onSubmit">
      <div class="space-y-1.5">
        <UiFormLabel for="alloc-project" required>{{ t('allocations.fields.project') }}</UiFormLabel>
        <UiSelect
          id="alloc-project"
          v-model="form.project"
          :disabled="!canEdit || Boolean(editing) || presetProjectId != null"
        >
          <option value="">{{ t('org.select') }}</option>
          <option v-for="p in projects" :key="p.id" :value="String(p.id)">
            {{ p.code ? `${p.code} — ${p.name}` : p.name }}
          </option>
        </UiSelect>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <UiFormLabel for="alloc-hours" required>{{ t('allocations.fields.hours') }}</UiFormLabel>
          <UiInput id="alloc-hours" v-model="form.hours" type="number" min="0.5" max="24" step="0.5" :disabled="!canEdit" />
        </div>
        <div class="space-y-1.5">
          <UiFormLabel for="alloc-status">{{ t('allocations.fields.status') }}</UiFormLabel>
          <UiSelect id="alloc-status" v-model="form.status" :disabled="!canEdit">
            <option value="draft">{{ t('allocations.status.draft') }}</option>
            <option value="submitted">{{ t('allocations.status.submitted') }}</option>
          </UiSelect>
        </div>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="alloc-notes">{{ t('allocations.fields.notes') }}</UiFormLabel>
        <UiTextarea id="alloc-notes" v-model="form.notes" :disabled="!canEdit" />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
        <UiButton type="button" variant="outline" @click="cancelForm">{{ t('actions.cancel') }}</UiButton>
        <UiButton
          v-if="editing && canEdit && onRemove"
          type="button"
          variant="danger"
          class="ml-auto"
          :disabled="saving"
          @click="onDelete(editing.documentId)"
        >
          {{ t('actions.delete') }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
