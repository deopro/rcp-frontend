export function isAccountBlocked(user: { blocked?: unknown } | null | undefined): boolean {
  return Boolean(user?.blocked)
}
