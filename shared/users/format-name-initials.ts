/** Two-letter initials from a display name (first + last word). */
export function formatNameInitials(name: string | null | undefined): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0]?.[0] || '?'
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  return (first + last).toUpperCase()
}
