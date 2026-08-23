<script setup lang="ts">
import type { ForecastResult } from '../types'
import DashboardChart from '~/components/charts/DashboardChart.client.vue'

const props = defineProps<{ data: ForecastResult }>()
const { t } = useI18n()

const healthColors: Record<string, string> = {
  over: '#ef4444',
  under: '#fbbf24',
  healthy: '#10b981',
}

const chartOption = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  legend: { bottom: 0 },
  grid: { left: 44, right: 16, top: 24, bottom: 56 },
  xAxis: {
    type: 'category' as const,
    data: props.data.series.map((p) => p.label),
    axisLabel: { rotate: props.data.granularity === 'day' ? 45 : 0, interval: 0 },
  },
  yAxis: [
    { type: 'value' as const, name: t('units.hours') },
    { type: 'value' as const, max: 100, name: t('units.percent') },
  ],
  series: [
    {
      name: t('forecast.charts.allocated'),
      type: 'bar' as const,
      data: props.data.series.map((p) => ({
        value: p.allocated_hours,
        itemStyle: { color: healthColors[p.health] || '#64748b' },
      })),
    },
    {
      name: t('forecast.charts.utilization'),
      type: 'line' as const,
      yAxisIndex: 1,
      data: props.data.series.map((p) => p.utilization_pct),
    },
    {
      name: t('forecast.charts.bench'),
      type: 'line' as const,
      data: props.data.series.map((p) => p.remaining_hours),
    },
  ],
}))
</script>

<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-soft">
    <h3 class="mb-3 text-sm font-semibold">{{ t('forecast.charts.seriesTitle') }}</h3>
    <ClientOnly>
      <DashboardChart :option="chartOption" height="320px" />
    </ClientOnly>
  </section>
</template>
