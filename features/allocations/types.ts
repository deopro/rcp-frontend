/** Allocations & capacity types (Milestone 6) */

export type AllocationStatus = 'draft' | 'submitted'

export type DayCapacity = {
  date: string
  is_working_day: boolean
  daily_capacity: number
  available_hours: number
  allocated_hours: number
  remaining_hours: number
}

export type EmployeeCapacityRow = {
  employee_id: number
  document_id: string
  full_name: string
  team_id?: number | null
  team_name?: string | null
  days: DayCapacity[]
}

export type CapacityResult = {
  from: string
  to: string
  employees: EmployeeCapacityRow[]
}

export type GridAllocation = {
  id: number
  documentId: string
  allocation_date: string
  hours: number
  notes?: string | null
  status: AllocationStatus
  employee_id?: number
  employee_name?: string
  employee_document_id?: string
  project_id?: number
  project_name?: string
  project_code?: string
  project_document_id?: string
}

export type GridData = {
  capacity: CapacityResult
  allocations: GridAllocation[]
}

export type AllocationInput = {
  employee: number
  project: number
  allocation_date: string
  hours: number
  notes?: string | null
  status?: AllocationStatus
}

export type CopyMode = 'yesterday' | 'previous_week'

export type CopyResult = {
  created: number
  skipped: number
  errors: string[]
}

export type CellKey = `${number}:${string}`

export function cellKey(employeeId: number, date: string): CellKey {
  return `${employeeId}:${date}`
}
