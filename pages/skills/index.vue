<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import SkillForm from '~/features/projects/components/SkillForm.vue'
import { useProjectsStore } from '~/features/projects/stores/projects'
import type { Skill, SkillInput } from '~/features/projects/types'
import { describeApiError } from '~/shared/api/client'

definePageMeta({
  middleware: ['role'],
})

const { t } = useI18n()
const auth = useAuthStore()
const store = useProjectsStore()
const toast = useToast()

const panelOpen = ref(false)
const selected = ref<Skill | null>(null)

const canWrite = computed(() => auth.hasRole('administrator'))
const canDelete = computed(() => auth.hasRole('administrator'))

onMounted(async () => {
  try {
    await store.loadSkills()
  } catch (e) {
    toast.error({
      title: t('errors.generic'),
      description: describeApiError(e, t),
    })
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Skill) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: SkillInput, documentId?: string) {
  try {
    await store.saveSkill(input, documentId)
    toast.success({ title: t('projects.saved') })
    closePanel()
  } catch (e) {
    toast.error({
      title: t('errors.generic'),
      description: describeApiError(e, t),
    })
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeSkill(documentId)
    toast.success({ title: t('projects.deleted') })
    closePanel()
  } catch (e) {
    toast.error({
      title: t('errors.generic'),
      description: describeApiError(e, t),
    })
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('projects.skills.title') }}</h2>
        <p class="text-sm text-muted">{{ t('projects.skills.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/projects">
          <UiButton variant="outline">{{ t('nav.projects') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canWrite" @click="openCreate">{{ t('projects.skills.add') }}</UiButton>
      </div>
    </div>

    <div v-if="store.loading && !store.skills.length" class="text-sm text-muted">
      {{ t('projects.loading') }}
    </div>

    <div
      v-else-if="!store.skills.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('projects.skills.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.category') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in store.skills"
            :key="row.documentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 text-muted">{{ row.category || t('org.none') }}</td>
            <td class="px-4 py-3 text-right">
              <UiButton size="sm" variant="ghost" @click="openEdit(row)">
                {{ canWrite ? t('actions.edit') : t('org.view') }}
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="space-y-3 md:hidden">
      <li
        v-for="row in store.skills"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <p class="font-medium">{{ row.name }}</p>
        <p class="mt-1 text-xs text-muted">{{ row.category || t('org.none') }}</p>
        <UiButton class="mt-3 w-full" size="sm" variant="outline" @click="openEdit(row)">
          {{ canWrite ? t('actions.edit') : t('org.view') }}
        </UiButton>
      </li>
    </ul>

    <Teleport to="body">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
        @click.self="closePanel"
      >
        <div class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">
            {{ selected ? t('projects.skills.edit') : t('projects.skills.add') }}
          </h3>
          <SkillForm
            :skill="selected"
            :can-edit="canWrite"
            :can-delete="canDelete"
            @save="onSave"
            @remove="onRemove"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
