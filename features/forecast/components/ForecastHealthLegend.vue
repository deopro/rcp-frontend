<script setup lang="ts">
import type { ForecastHealth } from '../types'

const { t } = useI18n()

const items: { key: ForecastHealth; className: string }[] = [
  { key: 'over', className: 'bg-danger' },
  { key: 'under', className: 'bg-warning' },
  { key: 'healthy', className: 'bg-success' },
]
</script>

<template>
  <div class="flex flex-wrap gap-4 text-xs text-muted">
    <div v-for="item in items" :key="item.key" class="flex items-center gap-1.5">
      <span class="inline-block h-2.5 w-2.5 rounded-full" :class="item.className" />
      {{ t(`forecast.health.${item.key}`) }}
    </div>
  </div>
</template>
