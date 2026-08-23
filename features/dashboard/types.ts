export type DashboardKpis = {
  employees: number
  available_hours: number
  allocated_hours: number
  remaining_hours: number
  utilization_pct: number
  bench_pct: number
  active_projects: number
  pending_approvals: number
  pending_leave: number
}

export type DaySeriesPoint = {
  date: string
  available_hours: number
  allocated_hours: number
  utilization_pct: number
}

export type TeamSeriesPoint = {
  team_id: number
  team_name: string
  available_hours: number
  allocated_hours: number
  utilization_pct: number
  bench_pct: number
}

export type ProjectSeriesPoint = {
  project_id: number
  project_name: string
  hours: number
}

export type PendingApprovalItem = {
  document_id: string
  team_name: string
  period_start: string
  period_end: string
  status: string
}

export type PendingLeaveItem = {
  document_id: string
  employee_name: string
  start_date: string
  end_date: string
  leave_type: string
}

export type DashboardResult = {
  role: string
  from: string
  to: string
  filters: {
    department_id?: number | null
    team_id?: number | null
    project_id?: number | null
    employee_id?: number | null
  }
  kpis: DashboardKpis
  charts: {
    utilization_by_day: DaySeriesPoint[]
    utilization_by_team: TeamSeriesPoint[]
    allocation_by_project: ProjectSeriesPoint[]
  }
  pending: {
    approvals: PendingApprovalItem[]
    leave: PendingLeaveItem[]
  }
}

export type DashboardFilters = {
  departmentId?: number
  teamId?: number
  projectId?: number
  employeeId?: number
}
