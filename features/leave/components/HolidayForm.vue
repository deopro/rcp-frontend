<script setup lang="ts">
import type { Holiday, HolidayInput } from '../types'

const props = defineProps<{
  holiday?: Holiday | null
  canEdit: boolean
  canDelete: boolean
  onSave: (input: HolidayInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()
const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  date: '',
  name: '',
  country: 'PT',
  region: '',
})
const saving = ref(false)
const isEdit = computed(() => Boolean(props.holiday?.documentId))

watch(
  () => props.holiday,
  (row) => {
    form.date = row?.date || ''
    form.name = row?.name || ''
    form.country = row?.country || 'PT'
    form.region = row?.region || ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('leave.fields.date'), value: form.date },
      { label: t('leave.fields.name'), value: form.name },
      { label: t('leave.fields.country'), value: form.country },
    ])
  ) {
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        date: form.date,
        name: form.name.trim(),
        country: form.country.trim().toUpperCase(),
        region: form.region.trim() || null,
      },
      props.holiday?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.holiday || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.holiday.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="hol-date" required>{{ t('leave.fields.date') }}</UiFormLabel>
        <UiInput id="hol-date" v-model="form.date" type="date" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="hol-name" required>{{ t('leave.fields.name') }}</UiFormLabel>
        <UiInput id="hol-name" v-model="form.name" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="hol-country" required>{{ t('leave.fields.country') }}</UiFormLabel>
        <UiInput id="hol-country" v-model="form.country" :disabled="!canEdit" />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="hol-region">{{ t('leave.fields.region') }}</UiFormLabel>
        <UiInput id="hol-region" v-model="form.region" :disabled="!canEdit" />
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
      <UiButton
        v-if="holiday && canDelete"
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
