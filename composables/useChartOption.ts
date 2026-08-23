import type { EChartsCoreOption } from 'echarts/core'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { readChartTokens, withChartDefaults } from '~/shared/charts'

/**
 * Build a theme-aware ECharts option for any page or feature.
 * Recomputes when color mode or source data changes.
 */
export function useChartOption(source: MaybeRefOrGetter<EChartsCoreOption>) {
  const colorMode = useColorMode()

  return computed(() => {
    const _theme = colorMode.value
    return withChartDefaults(toValue(source), readChartTokens())
  })
}
