<script setup lang="ts">
import type { Skill, SkillInput } from '../types'

const props = defineProps<{
  skill?: Skill | null
  canEdit: boolean
  canDelete: boolean
  onSave: (input: SkillInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{
  cancel: []
}>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  name: '',
  category: '',
  description: '',
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.skill?.documentId))

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
  if (!crud.validateRequired([{ label: t('projects.fields.name'), value: form.name }])) return
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
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

async function onDelete() {
  if (!props.skill || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.skill.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
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
