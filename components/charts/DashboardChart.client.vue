<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import RcpChart from './RcpChart.client.vue'

defineProps<{
  option: EChartsCoreOption
  height?: string
}>()
</script>

<template>
  <RcpChart :option="option" :height="height" />
</template>
