/** Build Strapi 5 REST write payloads (omit empty relations, use connect syntax). */

export function compactData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue
    out[key] = value
  }
  return out as Partial<T>
}

/** manyToOne / oneToOne relation by numeric entry id. */
export function connectOne(id: number | null | undefined): { connect: { id: number }[] } | undefined {
  if (id == null || Number.isNaN(id)) return undefined
  return { connect: [{ id }] }
}

/** manyToMany relation by numeric entry ids. */
export function connectMany(ids: number[] | null | undefined): { connect: { id: number }[] } | undefined {
  if (!ids?.length) return undefined
  return { connect: ids.map((id) => ({ id })) }
}
