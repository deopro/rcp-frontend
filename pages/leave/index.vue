<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import LeaveForm from '~/features/leave/components/LeaveForm.vue'
import { useLeaveStore } from '~/features/leave/stores/leave'
import type { Leave, LeaveInput, LeaveType } from '~/features/leave/types'
import { formatUserLabel } from '~/shared/users/format-user-label'

definePageMeta({})

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
  auth.hasRole('administrator', 'department_manager'),
)
const canPickEmployee = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'employee'),
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

const {
  page,
  pageSize,
  pageCount,
  total,
  pageItems,
  from,
  to,
} = useClientPagination(filtered)

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
  if (status === 'approved') return 'rcp-badge-success'
  if (status === 'rejected') return 'rcp-badge-danger'
  return 'rcp-badge-warning'
}

function formatLeaveDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  return `${match[3]}-${match[2]}-${match[1]}`
}

function leaveDays(start: string, end: string): number {
  const startMs = Date.parse(`${start}T12:00:00`)
  const endMs = Date.parse(`${end}T12:00:00`)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) return 0
  return Math.floor((endMs - startMs) / 86_400_000) + 1
}

function leavePersonName(row: Leave): string {
  if (!canPickEmployee.value && auth.user) {
    const name = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ').trim()
    if (name) return name
  }
  if (row.employee?.full_name) return row.employee.full_name
  if (auth.user) return formatUserLabel(auth.user)
  return t('org.none')
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
        <NuxtLink v-if="canPickEmployee" to="/holidays">
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
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.employee') }}</th>
            <th v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ t('leave.fields.type') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.startDate') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.endDate') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.days') }}</th>
            <th v-if="canPickEmployee" class="px-4 py-3 font-medium">{{ t('leave.fields.status') }}</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in pageItems" :key="row.documentId">
            <td class="px-4 py-3 font-medium">{{ leavePersonName(row) }}</td>
            <td v-if="canPickEmployee" class="px-4 py-3">{{ t(`leave.types.${row.leave_type}`) }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ formatLeaveDate(row.start_date) }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ formatLeaveDate(row.end_date) }}</td>
            <td class="px-4 py-3">{{ leaveDays(row.start_date, row.end_date) }}</td>
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
        v-for="row in pageItems"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ leavePersonName(row) }}</p>
            <p class="mt-1 text-xs text-muted">
              <template v-if="canPickEmployee">
                {{ t(`leave.types.${row.leave_type}`) }} ·
              </template>
              {{ formatLeaveDate(row.start_date) }} → {{ formatLeaveDate(row.end_date) }}
              · {{ leaveDays(row.start_date, row.end_date) }} {{ t('leave.fields.days').toLowerCase() }}
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

    <UiPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      :total="total"
      :from="from"
      :to="to"
    />

    <Teleport to="body">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 md:items-center"
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
