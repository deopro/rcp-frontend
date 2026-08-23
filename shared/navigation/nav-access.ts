import type { RcpRoleType } from '~/features/auth/types'

/** Routes restricted to these roles; omitted routes are visible to all authenticated users. */
export const NAV_ROUTE_ROLES: Partial<Record<string, readonly RcpRoleType[]>> = {
  '/bench': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/approvals': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/clients': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/team': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/teams': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/employees': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/departments': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/holidays': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/reports': ['administrator', 'executive', 'department_manager', 'team_leader'],
}

export function canAccessNavRoute(
  roleType: RcpRoleType | null | undefined,
  path: string,
): boolean {
  const allowed = NAV_ROUTE_ROLES[path]
  if (!allowed) return true
  if (!roleType) return false
  return allowed.includes(roleType)
}

export type NavLinkDef = {
  to: string
  label: string
  icon?: unknown
  match?: RegExp
}

export function filterNavLinks<T extends { to: string }>(
  links: T[],
  roleType: RcpRoleType | null | undefined,
): T[] {
  return links.filter((link) => canAccessNavRoute(roleType, link.to))
}
