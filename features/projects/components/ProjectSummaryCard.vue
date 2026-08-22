<script setup lang="ts">
import type { ProjectSummary } from '../types'

defineProps<{ summary: ProjectSummary | null; loading?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="loading"
    class="rounded-lg border border-border bg-surface p-4 text-sm text-muted"
  >
    {{ t('projects.loadingSummary') }}
  </div>
  <div
    v-else-if="summary"
    class="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4"
  >
    <div>
      <p class="text-xs text-muted">{{ t('projects.summary.capacity') }}</p>
      <p class="text-lg font-semibold">{{ summary.capacity_hours }}h</p>
    </div>
    <div>
      <p class="text-xs text-muted">{{ t('projects.summary.allocated') }}</p>
      <p class="text-lg font-semibold">{{ summary.allocated_hours }}h</p>
    </div>
    <div>
      <p class="text-xs text-muted">{{ t('projects.summary.remaining') }}</p>
      <p class="text-lg font-semibold">{{ summary.remaining_hours }}h</p>
    </div>
    <div>
      <p class="text-xs text-muted">{{ t('projects.summary.workingDays') }}</p>
      <p class="text-lg font-semibold">{{ summary.working_days }}</p>
    </div>
  </div>
</template>
