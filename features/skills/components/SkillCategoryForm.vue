<script setup lang="ts">
import type { SkillCategory, SkillCategoryInput } from '../types'

const props = defineProps<{
  category?: SkillCategory | null
  canEdit: boolean
  canDelete: boolean
  onSave: (input: SkillCategoryInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({ name: '', description: '' })
const saving = ref(false)
const isEdit = computed(() => Boolean(props.category?.documentId))

watch(
  () => props.category,
  (row) => {
    form.name = row?.name || ''
    form.description = row?.description || ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (!props.canEdit) return
  if (!crud.validateRequired([{ label: t('skills.fields.name'), value: form.name }])) return
  if (!(await crud.confirmSave(isEdit.value))) return

  saving.value = true
  try {
    await props.onSave(
      { name: form.name.trim(), description: form.description.trim() || null },
      props.category?.documentId,
    )
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!props.category || !props.canDelete || !props.onRemove) return
  if (!(await crud.confirmDelete())) return
  saving.value = true
  try {
    await props.onRemove(props.category.documentId)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <UiFormLabel for="cat-name" required>{{ t('skills.fields.name') }}</UiFormLabel>
      <UiInput id="cat-name" v-model="form.name" :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="cat-desc">{{ t('skills.fields.description') }}</UiFormLabel>
      <UiTextarea id="cat-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
      <UiButton
        v-if="category && canDelete"
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
