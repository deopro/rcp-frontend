<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import ApprovalForm from '~/features/approvals/components/ApprovalForm.vue'
import ApprovalStatusBadge from '~/features/approvals/components/ApprovalStatusBadge.vue'
import { useApprovalsStore } from '~/features/approvals/stores/approvals'
import type {
  Approval,
  ApprovalAction,
  ApprovalInput,
  ApprovalStatus,
} from '~/features/approvals/types'

definePageMeta({})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const store = useApprovalsStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Approval | null>(null)
const statusFilter = ref('')
const returnOpen = ref(false)
const returnTarget = ref<Approval | null>(null)
const returnComments = ref('')
const actionBusy = ref(false)

const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const canDelete = computed(() => auth.hasRole('administrator'))
const canReopen = computed(() =>
  auth.hasRole('administrator', 'department_manager'),
)

const filtered = computed(() => {
  if (!statusFilter.value) return store.approvals
  return store.approvals.filter((a) => a.status === statusFilter.value)
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
    await Promise.all([store.loadApprovals(), org.loadTeams()])
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Approval) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: ApprovalInput, documentId?: string) {
  try {
    await store.saveApproval(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeApproval(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

function actionsFor(status: ApprovalStatus): ApprovalAction[] {
  const actions: ApprovalAction[] = []
  if (!canWrite.value) return actions
  if (status === 'draft' || status === 'returned') actions.push('submit')
  if (status === 'submitted') {
    actions.push('return')
    actions.push('approve')
  }
  if (status === 'approved') actions.push('lock')
  if (status === 'locked' && canReopen.value) actions.push('reopen')
  return actions
}

async function runAction(row: Approval, action: ApprovalAction) {
  if (action === 'return') {
    returnTarget.value = row
    returnComments.value = ''
    returnOpen.value = true
    return
  }

  actionBusy.value = true
  try {
    await store.runAction(row.documentId, action)
    toast.success({ title: t(`approvals.actions.${action}Done`) })
  } catch (e) {
    showApiError(e)
  } finally {
    actionBusy.value = false
  }
}

async function confirmReturn() {
  if (!returnTarget.value) return
  if (!returnComments.value.trim()) {
    toast.error({
      title: t('errors.title'),
      description: t('approvals.validation.returnComments'),
    })
    return
  }
  actionBusy.value = true
  try {
    await store.runAction(returnTarget.value.documentId, 'return', returnComments.value.trim())
    toast.success({ title: t('approvals.actions.returnDone') })
    returnOpen.value = false
    returnTarget.value = null
  } catch (e) {
    showApiError(e)
  } finally {
    actionBusy.value = false
  }
}

function periodLabel(row: Approval) {
  return `${row.period_start} → ${row.period_end}`
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('approvals.title') }}</h2>
        <p class="text-sm text-muted">{{ t('approvals.subtitle') }}</p>
      </div>
      <UiButton v-if="canWrite" @click="openCreate">{{ t('approvals.add') }}</UiButton>
    </div>

    <div class="max-w-xs space-y-1.5">
      <UiFormLabel for="appr-filter">{{ t('approvals.fields.status') }}</UiFormLabel>
      <UiSelect id="appr-filter" v-model="statusFilter">
        <option value="">{{ t('skills.filters.all') }}</option>
        <option value="draft">{{ t('approvals.status.draft') }}</option>
        <option value="submitted">{{ t('approvals.status.submitted') }}</option>
        <option value="returned">{{ t('approvals.status.returned') }}</option>
        <option value="approved">{{ t('approvals.status.approved') }}</option>
        <option value="locked">{{ t('approvals.status.locked') }}</option>
      </UiSelect>
    </div>

    <UiPageSkeleton v-if="store.loading && !store.approvals.length" />

    <div
      v-else-if="!filtered.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('approvals.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('approvals.fields.team') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('approvals.fields.period') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('approvals.fields.status') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('approvals.fields.comments') }}</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in pageItems" :key="row.documentId">
            <td class="px-4 py-3 font-medium">{{ row.team?.name || t('org.none') }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ periodLabel(row) }}</td>
            <td class="px-4 py-3">
              <ApprovalStatusBadge :status="row.status" />
            </td>
            <td class="max-w-xs truncate px-4 py-3 text-muted">
              {{ row.comments || '—' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap justify-end gap-1">
                <UiButton size="sm" variant="ghost" @click="openEdit(row)">
                  {{ canWrite && row.status !== 'locked' ? t('actions.edit') : t('org.view') }}
                </UiButton>
                <UiButton
                  v-for="action in actionsFor(row.status)"
                  :key="action"
                  size="sm"
                  variant="outline"
                  :disabled="actionBusy"
                  @click="runAction(row, action)"
                >
                  {{ t(`approvals.actions.${action}`) }}
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
            <p class="font-medium">{{ row.team?.name || t('org.none') }}</p>
            <p class="mt-1 font-mono text-xs text-muted">{{ periodLabel(row) }}</p>
          </div>
          <ApprovalStatusBadge :status="row.status" />
        </div>
        <p v-if="row.comments" class="mt-2 text-sm text-muted">{{ row.comments }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UiButton size="sm" variant="outline" class="flex-1" @click="openEdit(row)">
            {{ canWrite && row.status !== 'locked' ? t('actions.edit') : t('org.view') }}
          </UiButton>
          <UiButton
            v-for="action in actionsFor(row.status)"
            :key="action"
            size="sm"
            variant="outline"
            :disabled="actionBusy"
            @click="runAction(row, action)"
          >
            {{ t(`approvals.actions.${action}`) }}
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
            {{ selected ? t('approvals.edit') : t('approvals.add') }}
          </h3>
          <ApprovalForm
            :approval="selected"
            :teams="org.teams"
            :can-edit="canWrite && selected?.status !== 'locked'"
            :can-delete="
              canDelete &&
              !!selected &&
              selected.status !== 'locked' &&
              selected.status !== 'approved'
            "
            :on-save="onSave"
            :on-remove="onRemove"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="returnOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 md:items-center"
        @click.self="returnOpen = false"
      >
        <div class="w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="text-lg font-semibold">{{ t('approvals.actions.return') }}</h3>
          <p class="text-sm text-muted">{{ t('approvals.returnHint') }}</p>
          <div class="space-y-1.5">
            <UiFormLabel for="return-comments" required>
              {{ t('approvals.fields.comments') }}
            </UiFormLabel>
            <textarea
              id="return-comments"
              v-model="returnComments"
              rows="4"
              class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
            />
          </div>
          <div class="flex justify-end gap-2">
            <UiButton variant="outline" :disabled="actionBusy" @click="returnOpen = false">
              {{ t('actions.cancel') }}
            </UiButton>
            <UiButton :disabled="actionBusy" @click="confirmReturn">
              {{ t('approvals.actions.return') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
