export type RcpRoleType =
  | 'employee'
  | 'team_leader'
  | 'department_manager'
  | 'executive'
  | 'administrator'
  | 'authenticated'
  | 'public'

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name?: string | null
  last_name?: string | null
  preferred_locale?: 'pt-PT' | 'en'
  blocked?: boolean
  role?: {
    id: number
    name: string
    type: RcpRoleType | string
  }
}

export type LoginResponse = {
  jwt: string
  user: AuthUser
}

export type SessionResponse = {
  authenticated: boolean
  token: string | null
  user: AuthUser | null
}
