<script setup lang="ts">
import type { Department, Team, TeamInput, UserOption } from '../types'
import StatusBadge from './StatusBadge.vue'
import { formatUserLabel } from '~/shared/users/format-user-label'

const props = defineProps<{
  team?: Team | null
  departments: Department[]
  userOptions: UserOption[]
  canEdit: boolean
  canDelete: boolean
  onSave: (input: TeamInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{
  cancel: []
}>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  department: '' as string,
  team_leader: '' as string,
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.team?.documentId))

watch(
  () => props.team,
  (row) => {
    form.name = row?.name || ''
    form.description = row?.description || ''
    form.status = row?.status || 'active'
    form.department = row?.department?.id != null ? String(row.department.id) : ''
    form.team_leader = row?.team_leader?.id != null ? String(row.team_leader.id) : ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (
    !crud.validateRequired([
      { label: t('org.fields.name'), value: form.name },
      { label: t('org.fields.department'), value: form.department },
      { label: t('org.fields.status'), value: form.status },
    ])
  ) {
    return
  }
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        department: form.department ? Number(form.department) : null,
        team_leader: form.team_leader ? Number(form.team_leader) : null,
      },
      props.team?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.team || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.team.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="team-name" required>{{ t('org.fields.name') }}</UiFormLabel>
      <UiInput id="team-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="team-desc">{{ t('org.fields.description') }}</UiFormLabel>
      <UiTextarea id="team-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <UiFormLabel for="team-dept" required>{{ t('org.fields.department') }}</UiFormLabel>
        <UiSelect id="team-dept" v-model="form.department" required :disabled="!canEdit">
          <option value="">{{ t('org.select') }}</option>
          <option v-for="d in departments" :key="d.id" :value="String(d.id)">
            {{ d.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="team-leader">{{ t('org.fields.teamLeader') }}</UiFormLabel>
        <UiSelect id="team-leader" v-model="form.team_leader" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="u in userOptions" :key="u.id" :value="String(u.id)">
            {{ formatUserLabel(u) }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="team-status" required>{{ t('org.fields.status') }}</UiFormLabel>
        <UiSelect id="team-status" v-model="form.status" required :disabled="!canEdit">
          <option value="active">{{ t('org.status.active') }}</option>
          <option value="inactive">{{ t('org.status.inactive') }}</option>
        </UiSelect>
      </div>
    </div>

    <div v-if="team" class="flex items-center gap-2 text-sm text-muted">
      <StatusBadge :status="team.status" />
    </div>

    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('org.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="team && canDelete"
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
