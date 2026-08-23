<script setup lang="ts">
import type { Approval, ApprovalInput } from '../types'

type TeamOption = { id: number; name: string }

const props = defineProps<{
  approval?: Approval | null
  teams: TeamOption[]
  canEdit: boolean
  canDelete: boolean
  onSave: (input: ApprovalInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()
const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  team: '' as string,
  period_start: '',
  period_end: '',
  comments: '',
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.approval?.documentId))

watch(
  () => props.approval,
  (row) => {
    form.team = row?.team?.id != null ? String(row.team.id) : ''
    form.period_start = row?.period_start || ''
    form.period_end = row?.period_end || ''
    form.comments = row?.comments || ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('approvals.fields.team'), value: form.team },
      { label: t('approvals.fields.periodStart'), value: form.period_start },
      { label: t('approvals.fields.periodEnd'), value: form.period_end },
    ])
  ) {
    return
  }
  if (form.period_end < form.period_start) {
    crud.toastValidationError(t('approvals.validation.dateRange'))
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        team: Number(form.team),
        period_start: form.period_start,
        period_end: form.period_end,
        comments: form.comments.trim() || null,
      },
      props.approval?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.approval || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.approval.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="appr-team" required>{{ t('approvals.fields.team') }}</UiFormLabel>
      <UiSelect id="appr-team" v-model="form.team" :disabled="!canEdit || isEdit">
        <option value="">{{ t('org.select') }}</option>
        <option v-for="tm in teams" :key="tm.id" :value="String(tm.id)">
          {{ tm.name }}
        </option>
      </UiSelect>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="appr-start" required>{{ t('approvals.fields.periodStart') }}</UiFormLabel>
        <UiInput
          id="appr-start"
          v-model="form.period_start"
          type="date"
          :disabled="!canEdit"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="appr-end" required>{{ t('approvals.fields.periodEnd') }}</UiFormLabel>
        <UiInput
          id="appr-end"
          v-model="form.period_end"
          type="date"
          :disabled="!canEdit"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <UiFormLabel for="appr-comments">{{ t('approvals.fields.comments') }}</UiFormLabel>
      <textarea
        id="appr-comments"
        v-model="form.comments"
        rows="3"
        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        :disabled="!canEdit"
      />
    </div>

    <div class="flex flex-wrap justify-end gap-2 pt-2">
      <UiButton type="button" variant="outline" :disabled="saving" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="canDelete && isEdit"
        type="button"
        variant="danger"
        :disabled="saving"
        @click="onDelete"
      >
        {{ t('actions.delete') }}
      </UiButton>
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('projects.saving') : t('actions.save') }}
      </UiButton>
    </div>
  </form>
</template>
