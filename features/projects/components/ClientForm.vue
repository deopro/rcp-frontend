<script setup lang="ts">
import type { Client, ClientInput } from '../types'

const props = defineProps<{
  client?: Client | null
  canEdit: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  save: [input: ClientInput, documentId?: string]
  remove: [documentId: string]
  cancel: []
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  description: '',
  contact_email: '',
  status: 'active' as 'active' | 'inactive',
})

const saving = ref(false)

watch(
  () => props.client,
  (row) => {
    form.name = row?.name || ''
    form.description = row?.description || ''
    form.contact_email = row?.contact_email || ''
    form.status = row?.status || 'active'
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
        contact_email: form.contact_email.trim() || null,
        status: form.status,
      },
      props.client?.documentId,
    )
  } finally {
    saving.value = false
  }
}

function onDelete() {
  if (!props.client || !props.canDelete) return
  if (!confirm(t('projects.confirmDelete'))) return
  emit('remove', props.client.documentId)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="client-name" required>{{ t('projects.fields.name') }}</UiFormLabel>
      <UiInput id="client-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="client-email">{{ t('projects.fields.contactEmail') }}</UiFormLabel>
      <UiInput id="client-email" v-model="form.contact_email" type="email" :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="client-desc">{{ t('projects.fields.description') }}</UiFormLabel>
      <UiTextarea id="client-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="client-status" required>{{ t('projects.fields.status') }}</UiFormLabel>
      <UiSelect id="client-status" v-model="form.status" required :disabled="!canEdit">
        <option value="active">{{ t('org.status.active') }}</option>
        <option value="inactive">{{ t('org.status.inactive') }}</option>
      </UiSelect>
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('projects.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="client && canDelete"
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
