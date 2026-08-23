import type { RcpRoleType } from '~/features/auth/types'

/**
 * Routes restricted to specific roles. Omitted routes are available to any authenticated user.
 * Keep in sync with sidebar / mobile nav visibility.
 */
export const ROUTE_ROLES: Partial<Record<string, readonly RcpRoleType[]>> = {
  '/bench': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/forecast': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/ai': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/approvals': ['administrator', 'executive', 'department_manager'],
  '/clients': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/team': ['administrator', 'executive', 'department_manager'],
  '/teams': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/employees': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/departments': ['administrator', 'executive', 'department_manager'],
  '/holidays': ['administrator', 'executive', 'department_manager', 'team_leader'],
  '/reports': ['administrator', 'executive', 'department_manager', 'team_leader'],
}

/** @deprecated Use ROUTE_ROLES */
export const NAV_ROUTE_ROLES = ROUTE_ROLES

export function normalizeRoutePath(path: string): string {
  const base = path.split('?')[0]?.split('#')[0] || '/'
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1)
  return base
}

export function getRouteAllowedRoles(path: string): readonly RcpRoleType[] | undefined {
  return ROUTE_ROLES[normalizeRoutePath(path)]
}

export function canAccessRoute(
  roleType: RcpRoleType | null | undefined,
  path: string,
): boolean {
  const allowed = getRouteAllowedRoles(path)
  if (!allowed) return true
  if (!roleType) return false
  return allowed.includes(roleType)
}

/** @deprecated Use canAccessRoute */
export function canAccessNavRoute(
  roleType: RcpRoleType | null | undefined,
  path: string,
): boolean {
  return canAccessRoute(roleType, path)
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
  return links.filter((link) => canAccessRoute(roleType, link.to))
}
