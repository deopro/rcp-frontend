<script setup lang="ts">
import type { EmployeeSkill, EmployeeSkillInput, ProficiencyLevel, Skill } from '../types'

type EmployeeOption = {
  id: number
  documentId: string
  full_name: string
  employee_number?: string
}

const props = defineProps<{
  record?: EmployeeSkill | null
  employees: EmployeeOption[]
  skills: Skill[]
  canEdit: boolean
  canDelete: boolean
  lockedEmployeeId?: number
  onSave: (input: EmployeeSkillInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  employee: '' as string,
  skill: '' as string,
  proficiency_level: 'basic' as ProficiencyLevel,
  years_experience: '0',
  certification: '',
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.record?.documentId))

watch(
  () => [props.record, props.lockedEmployeeId] as const,
  ([row, lockedId]) => {
    form.employee =
      row?.employee?.id != null
        ? String(row.employee.id)
        : lockedId != null
          ? String(lockedId)
          : ''
    form.skill = row?.skill?.id != null ? String(row.skill.id) : ''
    form.proficiency_level = row?.proficiency_level || 'basic'
    form.years_experience = String(row?.years_experience ?? 0)
    form.certification = row?.certification || ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('skills.fields.employee'), value: form.employee },
      { label: t('skills.fields.skill'), value: form.skill },
    ])
  ) {
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        employee: Number(form.employee),
        skill: Number(form.skill),
        proficiency_level: form.proficiency_level,
        years_experience: Number(form.years_experience) || 0,
        certification: form.certification.trim() || null,
      },
      props.record?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.record || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.record.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="es-employee" required>{{ t('skills.fields.employee') }}</UiFormLabel>
        <UiSelect
          id="es-employee"
          v-model="form.employee"
          :disabled="!canEdit || isEdit || lockedEmployeeId != null"
        >
          <option value="">{{ t('org.select') }}</option>
          <option v-for="e in employees" :key="e.id" :value="String(e.id)">
            {{ e.full_name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="es-skill" required>{{ t('skills.fields.skill') }}</UiFormLabel>
        <UiSelect id="es-skill" v-model="form.skill" :disabled="!canEdit || isEdit">
          <option value="">{{ t('org.select') }}</option>
          <option v-for="s in skills" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="es-level">{{ t('skills.fields.proficiency') }}</UiFormLabel>
        <UiSelect id="es-level" v-model="form.proficiency_level" :disabled="!canEdit">
          <option value="basic">{{ t('skills.proficiency.basic') }}</option>
          <option value="intermediate">{{ t('skills.proficiency.intermediate') }}</option>
          <option value="advanced">{{ t('skills.proficiency.advanced') }}</option>
          <option value="expert">{{ t('skills.proficiency.expert') }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="es-years">{{ t('skills.fields.yearsExperience') }}</UiFormLabel>
        <UiInput
          id="es-years"
          v-model="form.years_experience"
          type="number"
          min="0"
          step="0.5"
          :disabled="!canEdit"
        />
      </div>
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="es-cert">{{ t('skills.fields.certification') }}</UiFormLabel>
      <UiInput id="es-cert" v-model="form.certification" :disabled="!canEdit" />
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
      <UiButton
        v-if="record && canDelete"
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
