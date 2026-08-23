<script setup lang="ts">
import type { PendingApprovalItem, PendingLeaveItem } from '../types'

defineProps<{
  approvals: PendingApprovalItem[]
  leave: PendingLeaveItem[]
  showApprovals: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <section
      v-if="showApprovals && approvals.length"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold">{{ t('dashboard.pending.approvals') }}</h3>
        <NuxtLink to="/approvals" class="text-xs font-medium text-accent">
          {{ t('dashboard.pending.viewAll') }} →
        </NuxtLink>
      </div>
      <ul class="space-y-2">
        <li
          v-for="item in approvals"
          :key="item.document_id"
          class="rounded-md border border-border px-3 py-2 text-sm"
        >
          <p class="font-medium">{{ item.team_name }}</p>
          <p class="text-xs text-muted">
            {{ item.period_start }} → {{ item.period_end }} ·
            {{ t(`approvals.status.${item.status}`) }}
          </p>
        </li>
      </ul>
    </section>

    <section
      v-if="leave.length"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold">{{ t('dashboard.pending.leave') }}</h3>
        <NuxtLink to="/leave" class="text-xs font-medium text-accent">
          {{ t('dashboard.pending.viewAll') }} →
        </NuxtLink>
      </div>
      <ul class="space-y-2">
        <li
          v-for="item in leave"
          :key="item.document_id"
          class="rounded-md border border-border px-3 py-2 text-sm"
        >
          <p class="font-medium">{{ item.employee_name }}</p>
          <p class="text-xs text-muted">
            {{ item.start_date }} → {{ item.end_date }} ·
            {{ t(`leave.types.${item.leave_type}`) }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
