<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'

const props = defineProps<{
  option: EChartsCoreOption
  height?: string
}>()

const el = ref<HTMLElement | null>(null)
const colorMode = useColorMode()
let chart: import('echarts/core').ECharts | null = null

async function render() {
  if (!import.meta.client) return
  await nextTick()
  if (!el.value || el.value.clientWidth === 0) return

  const echarts = await import('echarts/core')
  const { BarChart, LineChart, PieChart } = await import('echarts/charts')
  const { GridComponent, TooltipComponent, LegendComponent } = await import('echarts/components')
  const { CanvasRenderer } = await import('echarts/renderers')

  echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

  if (!chart) {
    chart = echarts.init(el.value, colorMode.value === 'dark' ? 'dark' : undefined)
  }

  chart.setOption(props.option, true)
  chart.resize()
}

watch(
  () => [props.option, colorMode.value] as const,
  () => {
    if (chart && colorMode.value === 'dark') {
      chart.dispose()
      chart = null
    }
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
  chart?.dispose()
  chart = null
})

function onResize() {
  chart?.resize()
}
</script>

<template>
  <div ref="el" :style="{ height: height || '280px', width: '100%' }" />
</template>
