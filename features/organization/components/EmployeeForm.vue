<script setup lang="ts">
import type { Employee, EmployeeInput, Team, UserOption } from '../types'
import StatusBadge from './StatusBadge.vue'
import { isValidEmail } from '~/shared/forms/validation'

const props = defineProps<{
  employee?: Employee | null
  teams: Team[]
  userOptions: UserOption[]
  canEdit: boolean
  canDelete: boolean
  onSave: (input: EmployeeInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{
  cancel: []
}>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  employee_number: '',
  full_name: '',
  email: '',
  position: '',
  daily_capacity: '8',
  status: 'active' as 'active' | 'inactive',
  hire_date: '',
  user: '' as string,
  team: '' as string,
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.employee?.documentId))

watch(
  () => props.employee,
  (row) => {
    form.employee_number = row?.employee_number || ''
    form.full_name = row?.full_name || ''
    form.email = row?.email || ''
    form.position = row?.position || ''
    form.daily_capacity = String(row?.daily_capacity ?? 8)
    form.status = row?.status || 'active'
    form.hire_date = row?.hire_date || ''
    form.user = row?.user?.id != null ? String(row.user.id) : ''
    form.team = row?.team?.id != null ? String(row.team.id) : ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('org.fields.employeeNumber'), value: form.employee_number },
      { label: t('org.fields.fullName'), value: form.full_name },
      { label: t('org.fields.email'), value: form.email },
      { label: t('org.fields.dailyCapacity'), value: form.daily_capacity },
      { label: t('org.fields.status'), value: form.status },
    ])
  ) {
    return
  }
  if (!isValidEmail(form.email)) {
    crud.toastValidationError(t('forms.validationInvalidEmail'))
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        employee_number: form.employee_number.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        position: form.position.trim() || null,
        daily_capacity: Number(form.daily_capacity) || 8,
        status: form.status,
        hire_date: form.hire_date || null,
        user: form.user ? Number(form.user) : null,
        team: form.team ? Number(form.team) : null,
      },
      props.employee?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.employee || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.employee.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="emp-number" required>{{ t('org.fields.employeeNumber') }}</UiFormLabel>
        <UiInput id="emp-number" v-model="form.employee_number" required :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-name" required>{{ t('org.fields.fullName') }}</UiFormLabel>
        <UiInput id="emp-name" v-model="form.full_name" required :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-email" required>{{ t('org.fields.email') }}</UiFormLabel>
        <UiInput id="emp-email" v-model="form.email" type="email" required :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-position">{{ t('org.fields.position') }}</UiFormLabel>
        <UiInput id="emp-position" v-model="form.position" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-capacity" required>{{ t('org.fields.dailyCapacity') }}</UiFormLabel>
        <UiInput
          id="emp-capacity"
          v-model="form.daily_capacity"
          type="number"
          min="0.5"
          max="24"
          step="0.5"
          required
          :disabled="!canEdit"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-hire">{{ t('org.fields.hireDate') }}</UiFormLabel>
        <UiInput id="emp-hire" v-model="form.hire_date" type="date" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect id="emp-team" v-model="form.team" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="tm in teams" :key="tm.id" :value="String(tm.id)">
            {{ tm.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-user">{{ t('org.fields.linkedUser') }}</UiFormLabel>
        <UiSelect id="emp-user" v-model="form.user" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="u in userOptions" :key="u.id" :value="String(u.id)">
            {{ u.email }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="emp-status" required>{{ t('org.fields.status') }}</UiFormLabel>
        <UiSelect id="emp-status" v-model="form.status" required :disabled="!canEdit">
          <option value="active">{{ t('org.status.active') }}</option>
          <option value="inactive">{{ t('org.status.inactive') }}</option>
        </UiSelect>
      </div>
    </div>

    <div v-if="employee" class="flex items-center gap-2 text-sm text-muted">
      <StatusBadge :status="employee.status" />
      <span>{{ t('org.fields.dailyCapacity') }}: {{ employee.daily_capacity }}h</span>
    </div>

    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('org.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="employee && canDelete"
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
