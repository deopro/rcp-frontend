<script setup lang="ts">
import type { DashboardResult } from '../types'
import RcpChart from '~/components/charts/RcpChart.client.vue'

const props = defineProps<{ data: DashboardResult }>()
const { t, locale } = useI18n()

const dayChartOption = computed(() => {
  const labels = props.data.charts.utilization_by_day.map((d) =>
    new Date(d.date + 'T12:00:00').toLocaleDateString(locale.value, {
      weekday: 'short',
      day: 'numeric',
    }),
  )
  return {
    tooltip: { trigger: 'axis' as const },
    legend: { bottom: 0 },
    grid: { left: 40, right: 16, top: 24, bottom: 48 },
    xAxis: { type: 'category' as const, data: labels },
    yAxis: { type: 'value' as const, name: t('units.hours') },
    series: [
      {
        name: t('dashboard.charts.available'),
        type: 'bar' as const,
        data: props.data.charts.utilization_by_day.map((d) => d.available_hours),
      },
      {
        name: t('dashboard.charts.allocated'),
        type: 'bar' as const,
        data: props.data.charts.utilization_by_day.map((d) => d.allocated_hours),
      },
    ],
  }
})

const teamChartOption = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  grid: { left: 40, right: 16, top: 24, bottom: 64 },
  xAxis: {
    type: 'category' as const,
    data: props.data.charts.utilization_by_team.map((t) => t.team_name),
    axisLabel: { rotate: 30, interval: 0 },
  },
  yAxis: { type: 'value' as const, max: 100, name: t('units.percent') },
  series: [
    {
      name: t('dashboard.charts.utilization'),
      type: 'bar' as const,
      data: props.data.charts.utilization_by_team.map((t) => t.utilization_pct),
    },
  ],
}))

const projectChartOption = computed(() => {
  const items = props.data.charts.allocation_by_project
  const total = items.reduce((sum, p) => sum + p.hours, 0)
  const pctByName = new Map(
    items.map((p) => [
      p.project_name,
      total > 0 ? Math.round((p.hours / total) * 100) : 0,
    ]),
  )

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: `{b}<br/>{c} ${t('units.hours')} ({d}%)`,
    },
    legend: {
      bottom: 0,
      formatter: (name: string) => `${name} (${pctByName.get(name) ?? 0}%)`,
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['35%', '62%'],
        percentPrecision: 0,
        label: {
          formatter: '{b}\n{d}%',
        },
        data: items.map((p) => ({
          name: p.project_name,
          value: p.hours,
        })),
      },
    ],
  }
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <section class="rounded-lg border border-border bg-surface p-4 shadow-soft lg:col-span-2">
      <h3 class="mb-3 text-sm font-semibold">{{ t('dashboard.charts.dailyTitle') }}</h3>
      <ClientOnly>
        <RcpChart :option="dayChartOption" height="300px" />
      </ClientOnly>
    </section>

    <section
      v-if="data.charts.utilization_by_team.length > 1"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <h3 class="mb-3 text-sm font-semibold">{{ t('dashboard.charts.teamTitle') }}</h3>
      <ClientOnly>
        <RcpChart :option="teamChartOption" />
      </ClientOnly>
    </section>

    <section
      v-if="data.charts.allocation_by_project.length"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <h3 class="mb-3 text-sm font-semibold">{{ t('dashboard.charts.projectTitle') }}</h3>
      <ClientOnly>
        <RcpChart :option="projectChartOption" height="300px" />
      </ClientOnly>
    </section>
  </div>
</template>
