<script setup lang="ts">
import type { Department, Team, TeamInput, UserOption } from '../types'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  team?: Team | null
  departments: Department[]
  userOptions: UserOption[]
  canEdit: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  save: [input: TeamInput, documentId?: string]
  remove: [documentId: string]
  cancel: []
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  department: '' as string,
  team_leader: '' as string,
})

const saving = ref(false)

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
  saving.value = true
  try {
    emit(
      'save',
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

function onDelete() {
  if (!props.team || !props.canDelete) return
  if (!confirm(t('org.confirmDelete'))) return
  emit('remove', props.team.documentId)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <label class="text-sm font-medium" for="team-name">{{ t('org.fields.name') }}</label>
      <UiInput id="team-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <label class="text-sm font-medium" for="team-desc">{{ t('org.fields.description') }}</label>
      <UiTextarea id="team-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="team-dept">{{ t('org.fields.department') }}</label>
        <UiSelect id="team-dept" v-model="form.department" required :disabled="!canEdit">
          <option value="">{{ t('org.select') }}</option>
          <option v-for="d in departments" :key="d.id" :value="String(d.id)">
            {{ d.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="team-leader">{{ t('org.fields.teamLeader') }}</label>
        <UiSelect id="team-leader" v-model="form.team_leader" :disabled="!canEdit">
          <option value="">{{ t('org.none') }}</option>
          <option v-for="u in userOptions" :key="u.id" :value="String(u.id)">
            {{ u.email }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="team-status">{{ t('org.fields.status') }}</label>
        <UiSelect id="team-status" v-model="form.status" :disabled="!canEdit">
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
