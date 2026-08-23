export type ReportType =
  | 'monthly-capacity'
  | 'employee-allocation'
  | 'project-allocation'
  | 'team'
  | 'department'
  | 'executive'
  | 'utilization'
  | 'bench'
  | 'skills'
  | 'forecast'

export type ReportFormat = 'xlsx' | 'csv' | 'pdf'

export type ReportFilters = {
  departmentId?: number
  teamId?: number
  projectId?: number
  employeeId?: number
  scope?: 'org' | 'department' | 'team' | 'project'
  granularity?: 'day' | 'week' | 'month'
}

export type ReportDownloadInput = {
  type: ReportType
  format: ReportFormat
  from: string
  to: string
  filters?: ReportFilters
}
