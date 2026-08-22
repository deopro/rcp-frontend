<script setup lang="ts">
import type { Department, DepartmentInput, UserOption } from '../types'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  department?: Department | null
  userOptions: UserOption[]
  canEdit: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  save: [input: DepartmentInput, documentId?: string]
  remove: [documentId: string]
  cancel: []
}>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  manager: '' as string,
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.department?.documentId))

watch(
  () => props.department,
  (d) => {
    form.name = d?.name || ''
    form.description = d?.description || ''
    form.status = d?.status || 'active'
    form.manager = d?.manager?.id != null ? String(d.manager.id) : ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('org.fields.name'), value: form.name },
      { label: t('org.fields.status'), value: form.status },
    ])
  ) {
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    emit(
      'save',
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        manager: form.manager ? Number(form.manager) : null,
      },
      props.department?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.department || !props.canDelete) return
  if (!(await crud.confirmDelete())) return
  emit('remove', props.department.documentId)
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="dept-name" required>{{ t('org.fields.name') }}</UiFormLabel>
      <UiInput id="dept-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="dept-desc">{{ t('org.fields.description') }}</UiFormLabel>
      <UiTextarea id="dept-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="dept-status" required>{{ t('org.fields.status') }}</UiFormLabel>
        <UiSelect id="dept-status" v-model="form.status" required :disabled="!canEdit">
          <option value="active">{{ t('org.status.active') }}</option>
          <option value="inactive">{{ t('org.status.inactive') }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="dept-manager">{{ t('org.fields.manager') }}</UiFormLabel>
        <UiSelect id="dept-manager" v-model="form.manager" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="u in userOptions" :key="u.id" :value="String(u.id)">
            {{ u.email }}
          </option>
        </UiSelect>
      </div>
    </div>

    <div v-if="department" class="flex items-center gap-2 text-sm text-muted">
      <StatusBadge :status="department.status" />
    </div>

    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('org.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="department && canDelete"
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
