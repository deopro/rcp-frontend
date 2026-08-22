<script setup lang="ts">
import CheckboxGroup from './CheckboxGroup.vue'
import ProjectStatusBadge from './ProjectStatusBadge.vue'
import ProjectSummaryCard from './ProjectSummaryCard.vue'
import type { Client, EmployeeRef, Project, ProjectInput, ProjectSummary, Skill } from '../types'

const props = defineProps<{
  project?: Project | null
  clients: Client[]
  skills: Skill[]
  employees: EmployeeRef[]
  summary?: ProjectSummary | null
  summaryLoading?: boolean
  canEdit: boolean
  canDelete: boolean
  onSave: (input: ProjectInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{
  cancel: []
  loadSummary: [documentId: string]
}>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  name: '',
  code: '',
  description: '',
  status: 'planned' as ProjectInput['status'],
  start_date: '',
  end_date: '',
  client: '' as string,
  required_skills: [] as number[],
  assigned_employees: [] as number[],
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.project?.documentId))

watch(
  () => props.project,
  (row) => {
    form.name = row?.name || ''
    form.code = row?.code || ''
    form.description = row?.description || ''
    form.status = row?.status || 'planned'
    form.start_date = row?.start_date || ''
    form.end_date = row?.end_date || ''
    form.client = row?.client?.id != null ? String(row.client.id) : ''
    form.required_skills = row?.required_skills?.map((s) => s.id) || []
    form.assigned_employees = row?.assigned_employees?.map((e) => e.id) || []
    if (row?.documentId) {
      emit('loadSummary', row.documentId)
    }
  },
  { immediate: true },
)

const skillOptions = computed(() =>
  props.skills.map((s) => ({
    id: s.id,
    label: s.name,
    hint: s.category || undefined,
  })),
)

const employeeOptions = computed(() =>
  props.employees.map((e) => ({
    id: e.id,
    label: e.full_name,
    hint: e.employee_number,
  })),
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('projects.fields.name'), value: form.name },
      { label: t('projects.fields.code'), value: form.code },
      { label: t('projects.fields.status'), value: form.status },
    ])
  ) {
    return
  }
  if (form.start_date && form.end_date && form.end_date < form.start_date) {
    crud.toastValidationError(t('projects.validation.dateRange'))
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        client: form.client ? Number(form.client) : null,
        required_skills: form.required_skills,
        assigned_employees: form.assigned_employees,
      },
      props.project?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.project || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.project.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <ProjectSummaryCard
      v-if="project"
      :summary="summary || null"
      :loading="summaryLoading"
    />

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="proj-name" required>{{ t('projects.fields.name') }}</UiFormLabel>
        <UiInput id="proj-name" v-model="form.name" required :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="proj-code" required>{{ t('projects.fields.code') }}</UiFormLabel>
        <UiInput id="proj-code" v-model="form.code" required :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="proj-client">{{ t('projects.fields.client') }}</UiFormLabel>
        <UiSelect id="proj-client" v-model="form.client" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="c in clients" :key="c.id" :value="String(c.id)">
            {{ c.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="proj-status" required>{{ t('projects.fields.status') }}</UiFormLabel>
        <UiSelect id="proj-status" v-model="form.status" required :disabled="!canEdit">
          <option value="planned">{{ t('projects.status.planned') }}</option>
          <option value="active">{{ t('projects.status.active') }}</option>
          <option value="on_hold">{{ t('projects.status.on_hold') }}</option>
          <option value="completed">{{ t('projects.status.completed') }}</option>
          <option value="cancelled">{{ t('projects.status.cancelled') }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="proj-start">{{ t('projects.fields.startDate') }}</UiFormLabel>
        <UiInput id="proj-start" v-model="form.start_date" type="date" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="proj-end">{{ t('projects.fields.endDate') }}</UiFormLabel>
        <UiInput id="proj-end" v-model="form.end_date" type="date" :disabled="!canEdit" />
      </div>
    </div>

    <div class="space-y-1.5">
      <UiFormLabel for="proj-desc">{{ t('projects.fields.description') }}</UiFormLabel>
      <UiTextarea id="proj-desc" v-model="form.description" :disabled="!canEdit" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <p class="text-sm font-medium">{{ t('projects.fields.requiredSkills') }}</p>
        <CheckboxGroup
          v-model="form.required_skills"
          :options="skillOptions"
          :disabled="!canEdit"
        />
      </div>
      <div class="space-y-1.5">
        <p class="text-sm font-medium">{{ t('projects.fields.assignedEmployees') }}</p>
        <CheckboxGroup
          v-model="form.assigned_employees"
          :options="employeeOptions"
          :disabled="!canEdit"
        />
      </div>
    </div>

    <div v-if="project" class="flex items-center gap-2">
      <ProjectStatusBadge :status="project.status" />
    </div>

    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('projects.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="project && canDelete"
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
