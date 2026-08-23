<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import HolidayForm from '~/features/leave/components/HolidayForm.vue'
import { useLeaveStore } from '~/features/leave/stores/leave'
import type { Holiday, HolidayInput } from '~/features/leave/types'

definePageMeta({})

const { t } = useI18n()
const auth = useAuthStore()
const store = useLeaveStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Holiday | null>(null)

const canWrite = computed(() => auth.hasRole('administrator'))
const canDelete = computed(() => auth.hasRole('administrator'))

const {
  page,
  pageSize,
  pageCount,
  total,
  pageItems,
  from,
  to,
} = useClientPagination(() => store.holidays)

onMounted(async () => {
  try {
    await store.loadHolidays()
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Holiday) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: HolidayInput, documentId?: string) {
  try {
    await store.saveHoliday(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await store.removeHoliday(documentId)
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
        <h2 class="text-xl font-semibold">{{ t('leave.holidays.title') }}</h2>
        <p class="text-sm text-muted">{{ t('leave.holidays.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/leave">
          <UiButton variant="outline">{{ t('leave.title') }}</UiButton>
        </NuxtLink>
        <UiButton v-if="canWrite" @click="openCreate">{{ t('leave.holidays.add') }}</UiButton>
      </div>
    </div>

    <UiPageSkeleton v-if="store.loading && !store.holidays.length" />

    <div
      v-else-if="!store.holidays.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('leave.holidays.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.date') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.country') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('leave.fields.region') }}</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in pageItems" :key="row.documentId">
            <td class="px-4 py-3 font-mono text-xs">{{ row.date }}</td>
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3">{{ row.country }}</td>
            <td class="px-4 py-3 text-muted">{{ row.region || t('org.none') }}</td>
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
        v-for="row in pageItems"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <p class="font-medium">{{ row.name }}</p>
        <p class="mt-1 text-xs text-muted">{{ row.date }} · {{ row.country }}</p>
        <UiButton class="mt-3 w-full" size="sm" variant="outline" @click="openEdit(row)">
          {{ canWrite ? t('actions.edit') : t('org.view') }}
        </UiButton>
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
            {{ selected ? t('leave.holidays.edit') : t('leave.holidays.add') }}
          </h3>
          <HolidayForm
            :holiday="selected"
            :can-edit="canWrite"
            :can-delete="canDelete"
            :on-save="onSave"
            :on-remove="onRemove"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
