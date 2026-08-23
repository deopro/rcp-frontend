export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export type StrapiMeta = {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type Holiday = {
  id: number
  documentId: string
  date: string
  name: string
  country: string
  region?: string | null
}

export type HolidayInput = {
  date: string
  name: string
  country: string
  region?: string | null
}

export type EmployeeRef = {
  id: number
  documentId: string
  full_name: string
}

export type Leave = {
  id: number
  documentId: string
  start_date: string
  end_date: string
  leave_type: LeaveType
  status: LeaveStatus
  notes?: string | null
  employee?: EmployeeRef | null
  reviewed_at?: string | null
}

export type LeaveInput = {
  employee?: number | null
  start_date: string
  end_date: string
  leave_type: LeaveType
  status?: LeaveStatus
  notes?: string | null
}
