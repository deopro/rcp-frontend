/** Display label for a user option / ref (name + email when available). */
export function formatUserLabel(user: {
  email?: string | null
  username?: string | null
  first_name?: string | null
  last_name?: string | null
}): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  const identity = user.email || user.username || ''
  if (name && identity) return `${name} (${identity})`
  return name || identity || '—'
}
