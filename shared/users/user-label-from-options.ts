import type { UserOption } from '~/features/organization/types'

/** Resolve a user relation stub to a display label using loaded user options. */
export function userLabelFromOptions(
  userRef: { id?: number | null } | null | undefined,
  options: UserOption[],
  fallback = '—',
): string {
  if (!userRef?.id) return fallback
  const match = options.find((option) => option.id === userRef.id)
  if (!match) return fallback
  return match.email || match.username || fallback
}
