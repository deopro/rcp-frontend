<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import ClientForm from '~/features/projects/components/ClientForm.vue'
import { useProjectsStore } from '~/features/projects/stores/projects'
import type { Client, ClientInput } from '~/features/projects/types'

definePageMeta({})

const { t } = useI18n()
const auth = useAuthStore()
const store = useProjectsStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Client | null>(null)

const canWrite = computed(() => auth.hasRole('administrator'))
const canDelete = computed(() => auth.hasRole('administrator'))

onMounted(async () => {
  try {
    await store.loadClients()
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Client) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: ClientInput, documentId?: string) {
  try {
    await store.saveClient(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeClient(documentId)
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
        <h2 class="text-xl font-semibold">{{ t('projects.clients.title') }}</h2>
        <p class="text-sm text-muted">{{ t('projects.clients.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/projects">
          <UiButton variant="outline">{{ t('nav.projects') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canWrite" @click="openCreate">{{ t('projects.clients.add') }}</UiButton>
      </div>
    </div>

    <div v-if="store.loading && !store.clients.length" class="text-sm text-muted">
      {{ t('projects.loading') }}
    </div>

    <div
      v-else-if="!store.clients.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('projects.clients.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.contactEmail') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('projects.fields.status') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in store.clients"
            :key="row.documentId"
            class="hover:bg-hover"
          >
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 text-muted">{{ row.contact_email || t('org.none') }}</td>
            <td class="px-4 py-3">{{ t(`org.status.${row.status}`) }}</td>
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
        v-for="row in store.clients"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <p class="font-medium">{{ row.name }}</p>
        <p class="mt-1 text-xs text-muted">{{ row.contact_email || t('org.none') }}</p>
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
        <div class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">
            {{ selected ? t('projects.clients.edit') : t('projects.clients.add') }}
          </h3>
          <ClientForm
            :client="selected"
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
