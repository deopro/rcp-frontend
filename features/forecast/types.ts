export type ForecastScope = 'org' | 'department' | 'team' | 'project'
export type ForecastGranularity = 'day' | 'week' | 'month'
export type ForecastHealth = 'over' | 'under' | 'healthy'

export type ForecastSeriesPoint = {
  period_start: string
  period_end: string
  label: string
  available_hours: number
  allocated_hours: number
  remaining_hours: number
  utilization_pct: number
  bench_pct: number
  over_allocated_hours: number
  health: ForecastHealth
}

export type ForecastBaseline = {
  available_hours: number
  allocated_hours: number
  remaining_hours: number
  utilization_pct: number
  bench_pct: number
  employees: number
  over_allocation_days: number
}

export type ProjectDemand = {
  project_id: number
  project_name: string
  capacity_hours: number
  allocated_hours: number
  remaining_hours: number
  demand_pct: number
}

export type ForecastResult = {
  status: 'ok'
  scope: ForecastScope
  granularity: ForecastGranularity
  from: string
  to: string
  filters: {
    department_id?: number | null
    team_id?: number | null
    project_id?: number | null
  }
  baseline: ForecastBaseline
  series: ForecastSeriesPoint[]
  project_demand?: ProjectDemand | null
}

export type ForecastFilters = {
  departmentId?: number
  teamId?: number
  projectId?: number
}
