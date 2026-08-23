<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import LeaveForm from '~/features/leave/components/LeaveForm.vue'
import { useLeaveStore } from '~/features/leave/stores/leave'
import type { Leave, LeaveInput, LeaveType } from '~/features/leave/types'

definePageMeta({ middleware: ['role'] })

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const store = useLeaveStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Leave | null>(null)
const statusFilter = ref('')

const canReview = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const canPickEmployee = computed(() => canReview.value)
const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader', 'employee'),
)
const canDelete = computed(() => auth.hasRole('administrator'))
const allowedLeaveTypes = computed((): LeaveType[] =>
  canPickEmployee.value ? ['annual', 'sick', 'unpaid', 'other'] : ['annual'],
)
const pageTitle = computed(() =>
  canPickEmployee.value ? t('leave.title') : t('leave.employee.title'),
)
const pageSubtitle = computed(() =>
  canPickEmployee.value ? t('leave.subtitle') : t('leave.employee.subtitle'),
)
const addLabel = computed(() =>
  canPickEmployee.value ? t('leave.add') : t('leave.employee.add'),
)
const editLabel = computed(() =>
  canPickEmployee.value ? t('leave.edit') : t('leave.employee.edit'),
)
const emptyLabel = computed(() =>
  canPickEmployee.value ? t('leave.empty') : t('leave.employee.empty'),
)

const filtered = computed(() => {
  let rows = store.leaves
  if (statusFilter.value) {
    rows = rows.filter((l) => l.status === statusFilter.value)
  }
  return rows
})

onMounted(async () => {
  try {
    await store.loadLeaves()
  } catch (e) {
    showApiError(e)
  }
})

async function openCreate() {
  if (canPickEmployee.value && !org.employees.length) {
    try {
      await org.loadEmployees()
    } catch (e) {
      showApiError(e)
      return
    }
  }
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Leave) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: LeaveInput, documentId?: string) {
  try {
    await store.saveLeave(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeLeave(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function approve(row: Leave) {
  try {
    await store.setLeaveStatus(row.documentId, 'approved')
    toast.success({ title: t('leave.review.approved') })
  } catch (e) {
    showApiError(e)
  }
}

async function reject(row: Leave) {
  try {
    await store.setLeaveStatus(row.documentId, 'rejected')
    toast.success({ title: t('leave.review.rejected') })
  } catch (e) {
    showApiError(e)
  }
}

function statusClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
  if (status === 'rejected') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ pageTitle }}</h2>
        <p class="text-sm text-muted">{{ pageSubtitle }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink v-if="canReview" to="/holidays">
          <UiButton variant="outline">{{ t('leave.holidays.title') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canWrite" @click="openCreate">{{ addLabel }}</UiButton>
      </div>
    </div>

    <div v-if="canPickEmployee" class="max-w-xs space-y-1.5">
      <UiFormLabel for="leave-filter">{{ t('leave.fields.status') }}</UiFormLabel>
      <UiSelect id="leave-filter" v-model="statusFilter">
        <option value="">{{ t('skills.filters.all') }}</option>
        <option value="pending">{{ t('leave.status.pending') }}</option>
        <option value="approved">{{ t('leave.status.approved') }}</option>
        <option value="rejected">{{ t('leave.status.rejected') }}</option>
      </UiSelect>
    </div>

    <div v-if="store.loading && !store.leaves.length" class="text-sm text-muted">
      {{ t('leave.loading') }}
    </div>

    <div
      v-else-if="!filtered.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ emptyLabel }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
          <tr>
            <th v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ t('leave.fields.employee') }}</th>
            <th v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ t('leave.fields.type') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.startDate') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.endDate') }}</th>
            <th v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ t('leave.fields.status') }}</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in filtered" :key="row.documentId">
            <td v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ row.employee?.full_name || t('org.none') }}</td>
            <td v-if="canPickEmployee" class="px-4 py-3">{{ t(`leave.types.${row.leave_type}`) }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.start_date }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.end_date }}</td>
            <td v-if="canPickEmployee" class="px-4 py-3">
              <span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">
                {{ t(`leave.status.${row.status}`) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap justify-end gap-1">
                <UiButton
                  v-if="canReview && row.status === 'pending'"
                  size="sm"
                  variant="outline"
                  @click="approve(row)"
                >
                  {{ t('leave.review.approve') }}
                </UiButton>
                <UiButton
                  v-if="canReview && row.status === 'pending'"
                  size="sm"
                  variant="ghost"
                  @click="reject(row)"
                >
                  {{ t('leave.review.reject') }}
                </UiButton>
                <UiButton size="sm" variant="ghost" @click="openEdit(row)">
                  {{ canWrite ? t('actions.edit') : t('org.view') }}
                </UiButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="space-y-3 md:hidden">
      <li
        v-for="row in filtered"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p v-if="canPickEmployee" class="font-medium">{{ row.employee?.full_name }}</p>
            <p :class="canPickEmployee ? 'mt-1 text-xs text-muted' : 'font-medium'">
              <template v-if="canPickEmployee">
                {{ t(`leave.types.${row.leave_type}`) }} · {{ row.start_date }} → {{ row.end_date }}
              </template>
              <template v-else>
                {{ row.start_date }} → {{ row.end_date }}
              </template>
            </p>
          </div>
          <span
            v-if="canPickEmployee"
            class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
            :class="statusClass(row.status)"
          >
            {{ t(`leave.status.${row.status}`) }}
          </span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <UiButton
            v-if="canReview && row.status === 'pending'"
            size="sm"
            class="flex-1"
            @click="approve(row)"
          >
            {{ t('leave.review.approve') }}
          </UiButton>
          <UiButton
            v-if="canReview && row.status === 'pending'"
            size="sm"
            variant="outline"
            class="flex-1"
            @click="reject(row)"
          >
            {{ t('leave.review.reject') }}
          </UiButton>
          <UiButton size="sm" variant="outline" class="w-full" @click="openEdit(row)">
            {{ canWrite ? t('actions.edit') : t('org.view') }}
          </UiButton>
        </div>
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
            {{ selected ? editLabel : addLabel }}
          </h3>
          <LeaveForm
            :leave="selected"
            :employees="org.employees"
            :can-edit="canWrite"
            :can-delete="canDelete"
            :can-review="canReview"
            :can-pick-employee="canPickEmployee"
            :allowed-leave-types="allowedLeaveTypes"
            :on-save="onSave"
            :on-remove="onRemove"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
