<script setup lang="ts">
import type { ProjectSummary } from '../types'

defineProps<{ summary: ProjectSummary | null; loading?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="loading"
    class="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">{{ t('a11y.loading') }}</span>
    <div v-for="n in 4" :key="n" class="space-y-2">
      <UiSkeleton class="h-3 w-16" />
      <UiSkeleton class="h-6 w-20" />
    </div>
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
