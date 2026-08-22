<script setup lang="ts">
import type { Skill, SkillCategory, SkillInput } from '../types'

const props = defineProps<{
  skill?: Skill | null
  categories: SkillCategory[]
  canEdit: boolean
  canDelete: boolean
  onSave: (input: SkillInput, documentId?: string) => Promise<void>
  onRemove?: (documentId: string) => Promise<void>
}>()

const emit = defineEmits<{ cancel: [] }>()

const { t } = useI18n()
const crud = useCrudActions()

const form = reactive({
  name: '',
  description: '',
  skill_category: '' as string,
})

const saving = ref(false)
const isEdit = computed(() => Boolean(props.skill?.documentId))

watch(
  () => props.skill,
  (row) => {
    form.name = row?.name || ''
    form.description = row?.description || ''
    form.skill_category = row?.skill_category?.id != null ? String(row.skill_category.id) : ''
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
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        skill_category: form.skill_category ? Number(form.skill_category) : null,
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
      <UiFormLabel for="skill-name" required>{{ t('skills.fields.name') }}</UiFormLabel>
      <UiInput id="skill-name" v-model="form.name" :disabled="!canEdit" />
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="skill-category">{{ t('skills.fields.category') }}</UiFormLabel>
      <UiSelect id="skill-category" v-model="form.skill_category" :disabled="!canEdit">
        <option value="">{{ t('org.none') }}</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
      </UiSelect>
    </div>
    <div class="space-y-1.5">
      <UiFormLabel for="skill-desc">{{ t('skills.fields.description') }}</UiFormLabel>
      <UiTextarea id="skill-desc" v-model="form.description" :disabled="!canEdit" />
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <UiButton v-if="canEdit" type="submit" :disabled="saving">{{ t('actions.save') }}</UiButton>
      <UiButton type="button" variant="outline" @click="emit('cancel')">{{ t('actions.cancel') }}</UiButton>
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
