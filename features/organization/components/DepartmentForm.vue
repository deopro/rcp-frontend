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

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  manager: '' as string,
})

const saving = ref(false)

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

function onDelete() {
  if (!props.department || !props.canDelete) return
  if (!confirm(t('org.confirmDelete'))) return
  emit('remove', props.department.documentId)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <label class="text-sm font-medium" for="dept-name">{{ t('org.fields.name') }}</label>
      <UiInput id="dept-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <label class="text-sm font-medium" for="dept-desc">{{ t('org.fields.description') }}</label>
      <UiTextarea id="dept-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="dept-status">{{ t('org.fields.status') }}</label>
        <UiSelect id="dept-status" v-model="form.status" :disabled="!canEdit">
          <option value="active">{{ t('org.status.active') }}</option>
          <option value="inactive">{{ t('org.status.inactive') }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="dept-manager">{{ t('org.fields.manager') }}</label>
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
