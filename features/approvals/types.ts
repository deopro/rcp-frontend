export type ApprovalStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'locked'

export type StrapiMeta = {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type TeamRef = {
  id: number
  documentId: string
  name: string
}

export type UserRef = {
  id: number
  documentId?: string
  username?: string
  email?: string
  first_name?: string | null
  last_name?: string | null
}

export type Approval = {
  id: number
  documentId: string
  period_start: string
  period_end: string
  status: ApprovalStatus
  comments?: string | null
  team?: TeamRef | null
  submitted_by?: UserRef | null
  approved_by?: UserRef | null
  locked_by?: UserRef | null
  submitted_at?: string | null
  approved_at?: string | null
  locked_at?: string | null
  returned_at?: string | null
}

export type ApprovalInput = {
  team: number
  period_start: string
  period_end: string
  comments?: string | null
}

export type ApprovalAction = 'submit' | 'return' | 'approve' | 'lock' | 'reopen'
