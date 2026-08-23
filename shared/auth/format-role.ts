type Translate = (key: string) => string
type TranslateExists = (key: string) => boolean

export type RoleRef = {
  type?: string | null
  name?: string | null
}

/** Localized role label; falls back to the stored Strapi name. */
export function formatRoleLabel(
  t: Translate,
  te: TranslateExists,
  role?: RoleRef | null,
): string {
  if (!role) return ''
  const key = `roles.${role.type || ''}`
  if (role.type && te(key)) return t(key)
  return role.name || ''
}
