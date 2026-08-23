import type { EChartsCoreOption } from 'echarts/core'
import type { ChartTokens } from './tokens'
import { readChartTokens } from './tokens'

export const RCP_CHART_THEME = 'rcp'

let registered = false

/** Build an ECharts theme object from RCP design tokens (GitHub Desktop palette). */
export function buildEchartsTheme(tokens: ChartTokens): Record<string, unknown> {
  const axisCommon = {
    axisLine: { lineStyle: { color: tokens.grid } },
    axisTick: { lineStyle: { color: tokens.grid } },
    axisLabel: { color: tokens.axis },
    nameTextStyle: { color: tokens.axis },
  }

  return {
    color: tokens.palette,
    backgroundColor: tokens.background,
    textStyle: {
      color: tokens.text,
      fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    },
    title: {
      textStyle: { color: tokens.text },
      subtextStyle: { color: tokens.axis },
    },
    legend: {
      textStyle: { color: tokens.legend },
      pageTextStyle: { color: tokens.legend },
      inactiveColor: tokens.axis,
    },
    tooltip: {
      backgroundColor: tokens.tooltipBg,
      borderColor: tokens.tooltipBorder,
      textStyle: { color: tokens.tooltipFg },
    },
    categoryAxis: {
      ...axisCommon,
      splitLine: { show: false },
    },
    valueAxis: {
      ...axisCommon,
      splitLine: { lineStyle: { color: tokens.grid, type: 'dashed' as const } },
    },
    timeAxis: axisCommon,
    logAxis: axisCommon,
    line: {
      lineStyle: { width: 2 },
      symbolSize: 6,
      emphasis: { focus: 'series' as const },
    },
    bar: {
      barMaxWidth: 48,
      emphasis: { focus: 'series' as const },
    },
    pie: {
      label: { color: tokens.text },
      labelLine: { lineStyle: { color: tokens.grid } },
    },
  }
}

/** Register (or refresh) the RCP ECharts theme from current CSS variables. */
export function registerRcpChartTheme(echarts: {
  registerTheme: (name: string, theme: Record<string, unknown>) => void
}): ChartTokens {
  const tokens = readChartTokens()
  echarts.registerTheme(RCP_CHART_THEME, buildEchartsTheme(tokens))
  registered = true
  return tokens
}

export function isRcpChartThemeRegistered(): boolean {
  return registered
}

/** Merge chart-specific defaults into an option (use after theme registration). */
export function withChartDefaults(
  option: EChartsCoreOption,
  tokens: ChartTokens = readChartTokens(),
): EChartsCoreOption {
  const axisStyle = {
    axisLine: { lineStyle: { color: tokens.grid } },
    axisLabel: { color: tokens.axis },
    nameTextStyle: { color: tokens.axis },
  }

  const next: EChartsCoreOption = {
    ...option,
    color: option.color ?? tokens.palette,
    textStyle: { color: tokens.text, ...(option.textStyle as object | undefined) },
    legend: {
      textStyle: { color: tokens.legend },
      ...(option.legend as object | undefined),
    },
    tooltip: {
      backgroundColor: tokens.tooltipBg,
      borderColor: tokens.tooltipBorder,
      textStyle: { color: tokens.tooltipFg },
      ...(option.tooltip as object | undefined),
    },
  }

  if (option.xAxis) {
    next.xAxis = mergeAxis(option.xAxis, {
      ...axisStyle,
      splitLine: { show: false },
    })
  }

  if (option.yAxis) {
    next.yAxis = mergeAxis(option.yAxis, {
      ...axisStyle,
      splitLine: { lineStyle: { color: tokens.grid, type: 'dashed' as const } },
    })
  }

  return next
}

function mergeAxis(
  axis: EChartsCoreOption['xAxis'],
  defaults: Record<string, unknown>,
): EChartsCoreOption['xAxis'] {
  if (Array.isArray(axis)) {
    return axis.map((item) => ({ ...defaults, ...(item as object) }))
  }
  return { ...defaults, ...(axis as object | undefined) }
}
