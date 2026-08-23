/** Design tokens used by ECharts — read from CSS variables at runtime. */
export type ChartTokens = {
  background: string
  text: string
  axis: string
  grid: string
  legend: string
  tooltipBg: string
  tooltipFg: string
  tooltipBorder: string
  palette: string[]
}

const SERIES_VAR_NAMES = [
  '--rcp-chart-series-1',
  '--rcp-chart-series-2',
  '--rcp-chart-series-3',
  '--rcp-chart-series-4',
  '--rcp-chart-series-5',
  '--rcp-chart-series-6',
  '--rcp-chart-series-7',
  '--rcp-chart-series-8',
] as const

function cssVar(name: string, fallback: string): string {
  if (!import.meta.client) return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Read chart tokens from the active theme (light / dark). */
export function readChartTokens(): ChartTokens {
  return {
    background: cssVar('--rcp-chart-bg', 'transparent'),
    text: cssVar('--rcp-fg', '#24292e'),
    axis: cssVar('--rcp-chart-axis', '#57606a'),
    grid: cssVar('--rcp-chart-grid', '#e1e4e8'),
    legend: cssVar('--rcp-chart-legend', '#57606a'),
    tooltipBg: cssVar('--rcp-chart-tooltip-bg', '#24292e'),
    tooltipFg: cssVar('--rcp-chart-tooltip-fg', '#fafbfc'),
    tooltipBorder: cssVar('--rcp-chart-tooltip-border', '#e1e4e8'),
    palette: SERIES_VAR_NAMES.map((name, index) =>
      cssVar(name, ['#0366d6', '#1a7f37', '#b08800', '#d73a49', '#6f42c1', '#e36209', '#0969da', '#2ea44e'][index]!),
    ),
  }
}
