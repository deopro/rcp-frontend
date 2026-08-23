<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import EmployeeForm from '~/features/organization/components/EmployeeForm.vue'
import StatusBadge from '~/features/organization/components/StatusBadge.vue'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import type { Employee, EmployeeInput } from '~/features/organization/types'

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Employee | null>(null)

const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const canDelete = computed(() => auth.hasRole('administrator'))
const canAssign = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader', 'executive'),
)

const leaderTeamIds = computed(() => new Set(org.teams.map((team) => team.id)))

const visibleEmployees = computed(() => {
  if (!auth.hasRole('team_leader')) return org.employees
  return org.employees.filter(
    (employee) => employee.team?.id != null && leaderTeamIds.value.has(employee.team.id),
  )
})

onMounted(async () => {
  try {
    await org.loadTeams()
    await Promise.all([
      org.loadEmployees(),
      canAssign.value ? org.loadUserOptions() : Promise.resolve(),
    ])
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Employee) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: EmployeeInput, documentId?: string) {
  try {
    await org.saveEmployee(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await org.removeEmployee(documentId)
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
        <h2 class="text-xl font-semibold">{{ t('org.employees.title') }}</h2>
        <p class="text-sm text-muted">{{ t('org.employees.subtitle') }}</p>
      </div>
      <UiButton v-if="canWrite" @click="openCreate">{{ t('org.employees.add') }}</UiButton>
    </div>

    <div v-if="org.loading && !visibleEmployees.length" class="text-sm text-muted">
      {{ t('org.loading') }}
    </div>

    <div
      v-else-if="!visibleEmployees.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('org.employees.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.fullName') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.team') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.dailyCapacity') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.status') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in visibleEmployees"
            :key="row.documentId"
            class="hover:bg-hover"
          >
            <td class="px-4 py-3">
              <p class="font-medium">{{ row.full_name }}</p>
              <p class="text-xs text-muted">{{ row.employee_number }} · {{ row.email }}</p>
            </td>
            <td class="px-4 py-3 text-muted">{{ row.team?.name || t('org.none') }}</td>
            <td class="px-4 py-3">{{ row.daily_capacity }}h</td>
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

    <ul class="space-y-3 md:hidden">
      <li
        v-for="row in visibleEmployees"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ row.full_name }}</p>
            <p class="mt-1 text-xs text-muted">
              {{ row.team?.name || t('org.none') }} · {{ row.daily_capacity }}h
            </p>
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
        class="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 md:items-center"
        @click.self="closePanel"
      >
        <div class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">
            {{ selected ? t('org.employees.edit') : t('org.employees.add') }}
          </h3>
          <EmployeeForm
            :employee="selected"
            :teams="org.teams"
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
