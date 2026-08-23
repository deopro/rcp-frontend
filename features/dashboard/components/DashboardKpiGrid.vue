<script setup lang="ts">
import type { DashboardKpis } from '../types'

defineProps<{ kpis: DashboardKpis; variant: 'employee' | 'manager' | 'executive' }>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div
      v-if="variant !== 'employee'"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <p class="text-xs text-muted">{{ t('dashboard.kpis.employees') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.employees }}</p>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <p class="text-xs text-muted">{{ t('dashboard.kpis.utilization') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.utilization_pct }}%</p>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <p class="text-xs text-muted">{{ t('dashboard.kpis.bench') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.bench_pct }}%</p>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <p class="text-xs text-muted">{{ t('dashboard.kpis.remaining') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.remaining_hours }}h</p>
    </div>

    <div
      v-if="variant !== 'employee'"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <p class="text-xs text-muted">{{ t('dashboard.kpis.activeProjects') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.active_projects }}</p>
    </div>
    <div
      v-if="variant === 'manager'"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <p class="text-xs text-muted">{{ t('dashboard.kpis.pendingApprovals') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.pending_approvals }}</p>
    </div>
    <div
      v-if="variant !== 'executive' || kpis.pending_leave > 0"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <p class="text-xs text-muted">{{ t('dashboard.kpis.pendingLeave') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.pending_leave }}</p>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <p class="text-xs text-muted">{{ t('dashboard.kpis.allocated') }}</p>
      <p class="mt-1 text-2xl font-semibold">{{ kpis.allocated_hours }}h</p>
    </div>
  </div>
</template>
