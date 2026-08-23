<script setup lang="ts">
import type { Leave, LeaveInput, LeaveStatus, LeaveType } from '../types'

type EmployeeOption = { id: number; full_name: string }

const props = defineProps<{
  leave?: Leave | null
  employees: EmployeeOption[]
  canEdit: boolean
  canDelete: boolean
  canReview: boolean
  canPickEmployee: boolean
  allowedLeaveTypes?: LeaveType[]
  onSave: (input: LeaveInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const ALL_LEAVE_TYPES: LeaveType[] = ['annual', 'sick', 'unpaid', 'other']
const leaveTypes = computed(() => props.allowedLeaveTypes ?? ALL_LEAVE_TYPES)
const showLeaveType = computed(() => leaveTypes.value.length > 1)

const emit = defineEmits<{ cancel: [] }>()
const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  employee: '' as string,
  start_date: '',
  end_date: '',
  leave_type: 'annual' as LeaveType,
  status: 'pending' as LeaveStatus,
  notes: '',
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.leave?.documentId))

watch(
  () => props.leave,
  (row) => {
    form.employee = row?.employee?.id != null ? String(row.employee.id) : ''
    form.start_date = row?.start_date || ''
    form.end_date = row?.end_date || ''
    form.leave_type = row?.leave_type || 'annual'
    form.status = row?.status || 'pending'
    form.notes = row?.notes || ''
  },
  { immediate: true },
)

watch(
  leaveTypes,
  (types) => {
    if (!types.includes(form.leave_type)) {
      form.leave_type = 'annual'
    }
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      ...(props.canPickEmployee
        ? [{ label: t('leave.fields.employee'), value: form.employee }]
        : []),
      { label: t('leave.fields.startDate'), value: form.start_date },
      { label: t('leave.fields.endDate'), value: form.end_date },
    ])
  ) {
    return
  }
  if (form.end_date < form.start_date) {
    crud.toastValidationError(t('leave.validation.dateRange'))
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        employee: props.canPickEmployee && form.employee ? Number(form.employee) : undefined,
        start_date: form.start_date,
        end_date: form.end_date,
        leave_type: leaveTypes.value.includes(form.leave_type) ? form.leave_type : 'annual',
        status: props.canReview ? form.status : 'pending',
        notes: form.notes.trim() || null,
      },
      props.leave?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.leave || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.leave.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div v-if="canPickEmployee" class="space-y-1.5">
      <UiFormLabel for="leave-emp" required>{{ t('leave.fields.employee') }}</UiFormLabel>
      <UiSelect id="leave-emp" v-model="form.employee" :disabled="!canEdit">
        <option value="">{{ t('org.select') }}</option>
        <option v-for="e in employees" :key="e.id" :value="String(e.id)">{{ e.full_name }}</option>
      </UiSelect>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="leave-start" required>{{ t('leave.fields.startDate') }}</UiFormLabel>
        <UiInput id="leave-start" v-model="form.start_date" type="date" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="leave-end" required>{{ t('leave.fields.endDate') }}</UiFormLabel>
        <UiInput id="leave-end" v-model="form.end_date" type="date" :disabled="!canEdit" />
      </div>
      <div v-if="showLeaveType" class="space-y-1.5">
        <UiFormLabel for="leave-type">{{ t('leave.fields.type') }}</UiFormLabel>
        <UiSelect id="leave-type" v-model="form.leave_type" :disabled="!canEdit">
          <option v-for="type in leaveTypes" :key="type" :value="type">
            {{ t(`leave.types.${type}`) }}
          </option>
        </UiSelect>
      </div>
      <div v-if="canReview" class="space-y-1.5">
        <UiFormLabel for="leave-status">{{ t('leave.fields.status') }}</UiFormLabel>
        <UiSelect id="leave-status" v-model="form.status" :disabled="!canEdit">
          <option value="pending">{{ t('leave.status.pending') }}</option>
          <option value="approved">{{ t('leave.status.approved') }}</option>
          <option value="rejected">{{ t('leave.status.rejected') }}</option>
        </UiSelect>
      </div>
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="leave-notes">{{ t('leave.fields.notes') }}</UiFormLabel>
      <UiTextarea id="leave-notes" v-model="form.notes" :disabled="!canEdit" />
    </div>
    <div class="flex flex-wrap gap-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
      <UiButton
        v-if="leave && canDelete"
        type="button"
        variant="danger"
        class="ml-auto"
        @click="onDelete"
      >
        {{ t('actions.delete') }}
      </UiButton>
    </div>
  </form>
</template>
