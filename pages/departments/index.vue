<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import DepartmentForm from '~/features/organization/components/DepartmentForm.vue'
import StatusBadge from '~/features/organization/components/StatusBadge.vue'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import type { Department, DepartmentInput } from '~/features/organization/types'
import { describeApiError } from '~/shared/api/client'

definePageMeta({
  middleware: ['role'],
  roles: ['administrator', 'executive', 'department_manager', 'team_leader'],
})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const toast = useToast()

const panelOpen = ref(false)
const selected = ref<Department | null>(null)

const canWrite = computed(() => auth.hasRole('administrator'))
const canDelete = computed(() => auth.hasRole('administrator'))

onMounted(async () => {
  try {
    await Promise.all([org.loadDepartments(), canWrite.value ? org.loadUserOptions() : Promise.resolve()])
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

function openEdit(row: Department) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: DepartmentInput, documentId?: string) {
  try {
    await org.saveDepartment(input, documentId)
    toast.success({ title: t('org.saved') })
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
    await org.removeDepartment(documentId)
    toast.success({ title: t('org.deleted') })
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
        <h2 class="text-xl font-semibold">{{ t('org.departments.title') }}</h2>
        <p class="text-sm text-muted">{{ t('org.departments.subtitle') }}</p>
      </div>
      <UiButton v-if="canWrite" @click="openCreate">{{ t('org.departments.add') }}</UiButton>
    </div>

    <div v-if="org.loading && !org.departments.length" class="text-sm text-muted">
      {{ t('org.loading') }}
    </div>

    <div
      v-else-if="!org.departments.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('org.departments.empty') }}
    </div>

    <!-- Desktop table -->
    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.manager') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.status') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in org.departments"
            :key="row.documentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 text-muted">{{ row.manager?.email || t('org.none') }}</td>
            <td class="px-4 py-3"><StatusBadge :status="row.status" /></td>
            <td class="px-4 py-3 text-right">
              <UiButton size="sm" variant="ghost" @click="openEdit(row)">
                {{ canWrite ? t('actions.edit') : t('org.view') }}
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <ul class="space-y-3 md:hidden">
      <li
        v-for="row in org.departments"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ row.name }}</p>
            <p class="mt-1 text-xs text-muted">{{ row.manager?.email || t('org.none') }}</p>
          </div>
          <StatusBadge :status="row.status" />
        </div>
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
            {{ selected ? t('org.departments.edit') : t('org.departments.add') }}
          </h3>
          <DepartmentForm
            :department="selected"
            :user-options="org.userOptions"
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
