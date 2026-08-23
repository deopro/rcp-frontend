<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import ProjectForm from '~/features/projects/components/ProjectForm.vue'
import ProjectStatusBadge from '~/features/projects/components/ProjectStatusBadge.vue'
import { useProjectsStore } from '~/features/projects/stores/projects'
import type { Project, ProjectInput } from '~/features/projects/types'

definePageMeta({
  middleware: ['role'],
})

const { t } = useI18n()
const auth = useAuthStore()
const projectsStore = useProjectsStore()
const orgStore = useOrganizationStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Project | null>(null)
const summaryLoading = ref(false)

const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const isEmployee = computed(() => auth.hasRole('employee'))
const canCreate = computed(() => auth.hasRole('administrator', 'department_manager'))
const canDelete = computed(() => auth.hasRole('administrator', 'department_manager'))

const currentSummary = computed(() => {
  if (!selected.value?.documentId) return null
  return projectsStore.summaries[selected.value.documentId] || null
})

onMounted(async () => {
  try {
    const loads: Promise<unknown>[] = [projectsStore.loadProjects()]
    if (!isEmployee.value) {
      loads.push(
        projectsStore.loadClients(),
        projectsStore.loadSkills(),
        orgStore.loadEmployees(),
      )
    }
    await Promise.all(loads)
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Project) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onLoadSummary(documentId: string) {
  summaryLoading.value = true
  try {
    await projectsStore.loadProjectSummary(documentId)
  } catch {
    // Summary is optional display — ignore errors
  } finally {
    summaryLoading.value = false
  }
}

async function onSave(input: ProjectInput, documentId?: string) {
  try {
    await projectsStore.saveProject(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await projectsStore.removeProject(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('projects.title') }}</h2>
        <p class="text-sm text-muted">{{ t('projects.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink v-if="!isEmployee" to="/clients">
          <UiButton variant="outline">{{ t('projects.clients.title') }}</UiButton>
        </NuxtLink>
        <NuxtLink v-if="!isEmployee" to="/skills">
          <UiButton variant="outline">{{ t('nav.skills') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canCreate" @click="openCreate">{{ t('projects.add') }}</UiButton>
      </div>
    </div>

    <div v-if="projectsStore.loading && !projectsStore.projects.length" class="text-sm text-muted">
      {{ t('projects.loading') }}
    </div>

    <div
      v-else-if="!projectsStore.projects.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('projects.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.code') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.client') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.status') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in projectsStore.projects"
            :key="row.documentId"
            class="hover:bg-hover"
          >
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.code }}</td>
            <td class="px-4 py-3 text-muted">{{ row.client?.name || t('org.none') }}</td>
            <td class="px-4 py-3"><ProjectStatusBadge :status="row.status" /></td>
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
        v-for="row in projectsStore.projects"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ row.name }}</p>
            <p class="mt-1 font-mono text-xs text-muted">
              {{ row.code }} · {{ row.client?.name || t('org.none') }}
            </p>
          </div>
          <ProjectStatusBadge :status="row.status" />
        </div>
        <UiButton class="mt-3 w-full" size="sm" variant="outline" @click="openEdit(row)">
          {{ canWrite ? t('actions.edit') : t('org.view') }}
        </UiButton>
      </li>
    </ul>

    <Teleport to="body">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 md:items-center"
        @click.self="closePanel"
      >
        <div class="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">
            {{ selected ? t('projects.edit') : t('projects.add') }}
          </h3>
          <ProjectForm
            :project="selected"
            :existing-codes="projectsStore.projects.map((p) => p.code)"
            :clients="projectsStore.clients"
            :skills="projectsStore.skills"
            :employees="orgStore.employees"
            :summary="currentSummary"
            :summary-loading="summaryLoading"
            :can-edit="canWrite"
            :can-delete="canDelete"
            @save="onSave"
            @remove="onRemove"
            @cancel="closePanel"
            @load-summary="onLoadSummary"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
