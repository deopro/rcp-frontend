<script setup lang="ts">
import type { Skill, SkillInput } from '../types'

const props = defineProps<{
  skill?: Skill | null
  canEdit: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  save: [input: SkillInput, documentId?: string]
  remove: [documentId: string]
  cancel: []
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  category: '',
  description: '',
})

const saving = ref(false)

watch(
  () => props.skill,
  (row) => {
    form.name = row?.name || ''
    form.category = row?.category || ''
    form.description = row?.description || ''
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
        category: form.category.trim() || null,
        description: form.description.trim() || null,
      },
      props.skill?.documentId,
    )
  } finally {
    saving.value = false
  }
}

function onDelete() {
  if (!props.skill || !props.canDelete) return
  if (!confirm(t('projects.confirmDelete'))) return
  emit('remove', props.skill.documentId)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="skill-name" required>{{ t('projects.fields.name') }}</UiFormLabel>
      <UiInput id="skill-name" v-model="form.name" required :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="skill-category">{{ t('projects.fields.category') }}</UiFormLabel>
      <UiInput id="skill-category" v-model="form.category" :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="skill-desc">{{ t('projects.fields.description') }}</UiFormLabel>
      <UiTextarea id="skill-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">
        {{ saving ? t('projects.saving') : t('actions.save') }}
      </UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">
        {{ t('actions.cancel') }}
      </UiButton>
      <UiButton
        v-if="skill && canDelete"
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
