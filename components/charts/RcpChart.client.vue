<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import {
  RCP_CHART_THEME,
  registerRcpChartTheme,
  withChartDefaults,
} from '~/shared/charts'

const props = defineProps<{
  option: EChartsCoreOption
  height?: string
}>()

const el = ref<HTMLElement | null>(null)
const colorMode = useColorMode()
let chart: import('echarts/core').ECharts | null = null
let echartsModule: typeof import('echarts/core') | null = null

async function ensureEcharts() {
  if (echartsModule) return echartsModule

  const echarts = await import('echarts/core')
  const { BarChart, LineChart, PieChart } = await import('echarts/charts')
  const { GridComponent, TooltipComponent, LegendComponent } = await import('echarts/components')
  const { CanvasRenderer } = await import('echarts/renderers')

  echarts.use([
    BarChart,
    LineChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
  ])

  echartsModule = echarts
  return echarts
}

async function render() {
  if (!import.meta.client) return
  await nextTick()
  if (!el.value || el.value.clientWidth === 0) return

  const echarts = await ensureEcharts()
  registerRcpChartTheme(echarts)

  if (!chart) {
    chart = echarts.init(el.value, RCP_CHART_THEME)
  }

  chart.setOption(withChartDefaults(props.option), true)
  chart.resize()
}

function resetChart() {
  chart?.dispose()
  chart = null
}

watch(
  () => [props.option, colorMode.value] as const,
  () => {
    resetChart()
    render()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  render()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  resetChart()
})

function onResize() {
  chart?.resize()
}
</script>

<template>
  <div ref="el" :style="{ height: height || '280px', width: '100%' }" />
</template>
