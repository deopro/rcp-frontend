<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import LeaveForm from '~/features/leave/components/LeaveForm.vue'
import { useLeaveStore } from '~/features/leave/stores/leave'
import type { Leave, LeaveInput } from '~/features/leave/types'

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

const filtered = computed(() => {
  if (!statusFilter.value) return store.leaves
  return store.leaves.filter((l) => l.status === statusFilter.value)
})

onMounted(async () => {
  try {
    await Promise.all([
      store.loadLeaves(),
      canPickEmployee.value ? org.loadEmployees() : Promise.resolve(),
    ])
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
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
        <h2 class="text-xl font-semibold">{{ t('leave.title') }}</h2>
        <p class="text-sm text-muted">{{ t('leave.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/holidays">
          <UiButton variant="outline">{{ t('leave.holidays.title') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canWrite" @click="openCreate">{{ t('leave.add') }}</UiButton>
      </div>
    </div>

    <div class="max-w-xs space-y-1.5">
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
      {{ t('leave.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.employee') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.type') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.startDate') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.endDate') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.status') }}</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in filtered" :key="row.documentId">
            <td class="px-4 py-3 font-medium">{{ row.employee?.full_name || t('org.none') }}</td>
            <td class="px-4 py-3">{{ t(`leave.types.${row.leave_type}`) }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.start_date }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.end_date }}</td>
            <td class="px-4 py-3">
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
            <p class="font-medium">{{ row.employee?.full_name }}</p>
            <p class="mt-1 text-xs text-muted">
              {{ t(`leave.types.${row.leave_type}`) }} · {{ row.start_date }} → {{ row.end_date }}
            </p>
          </div>
          <span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">
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
            {{ selected ? t('leave.edit') : t('leave.add') }}
          </h3>
          <LeaveForm
            :leave="selected"
            :employees="org.employees"
            :can-edit="canWrite"
            :can-delete="canDelete"
            :can-review="canReview"
            :can-pick-employee="canPickEmployee"
            :on-save="onSave"
            :on-remove="onRemove"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
