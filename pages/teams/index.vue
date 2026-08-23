<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import StatusBadge from '~/features/organization/components/StatusBadge.vue'
import TeamForm from '~/features/organization/components/TeamForm.vue'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import type { Team, TeamInput } from '~/features/organization/types'
import { userLabelFromOptions } from '~/shared/users/user-label-from-options'

definePageMeta({
  middleware: ['role'],
})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const panelOpen = ref(false)
const selected = ref<Team | null>(null)

const canWrite = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader'),
)
const canDelete = computed(() => auth.hasRole('administrator'))
const canAssign = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader', 'executive'),
)

function leaderLabel(team: Team) {
  return userLabelFromOptions(team.team_leader, org.userOptions, t('org.none'))
}

onMounted(async () => {
  try {
    await Promise.all([
      org.loadTeams(),
      org.loadDepartments(),
      org.loadUserOptions(),
    ])
  } catch (e) {
    showApiError(e)
  }
})

function openCreate() {
  selected.value = null
  panelOpen.value = true
}

function openEdit(row: Team) {
  selected.value = row
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  selected.value = null
}

async function onSave(input: TeamInput, documentId?: string) {
  try {
    await org.saveTeam(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemove(documentId: string) {
  try {
    await org.removeTeam(documentId)
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
        <h2 class="text-xl font-semibold">{{ t('org.teams.title') }}</h2>
        <p class="text-sm text-muted">{{ t('org.teams.subtitle') }}</p>
      </div>
      <UiButton v-if="auth.hasRole('administrator', 'department_manager')" @click="openCreate">
        {{ t('org.teams.add') }}
      </UiButton>
    </div>

    <div v-if="org.loading && !org.teams.length" class="text-sm text-muted">
      {{ t('org.loading') }}
    </div>

    <div
      v-else-if="!org.teams.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('org.teams.empty') }}
    </div>

    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-slate-50 text-muted dark:bg-slate-900/50">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.department') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.teamLeader') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('org.fields.status') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in org.teams"
            :key="row.documentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <td class="px-4 py-3 font-medium">{{ row.name }}</td>
            <td class="px-4 py-3 text-muted">{{ row.department?.name || t('org.none') }}</td>
            <td class="px-4 py-3 text-muted">{{ leaderLabel(row) }}</td>
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
        v-for="row in org.teams"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ row.name }}</p>
            <p class="mt-1 text-xs text-muted">
              {{ row.department?.name || t('org.none') }}
              ·
              {{ leaderLabel(row) }}
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
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
        @click.self="closePanel"
      >
        <div class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">
            {{ selected ? t('org.teams.edit') : t('org.teams.add') }}
          </h3>
          <TeamForm
            :team="selected"
            :departments="org.departments"
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
