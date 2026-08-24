/** Stable project colours from id — matches chart series tokens. */
export const PROJECT_CHIP_COUNT = 8
export const MAX_VISIBLE_PROJECT_CHIPS = 3

export function projectColorIndex(projectId: number | null | undefined): number {
  const id = Number(projectId)
  if (!Number.isFinite(id)) return 0
  return ((Math.trunc(id) % PROJECT_CHIP_COUNT) + PROJECT_CHIP_COUNT) % PROJECT_CHIP_COUNT
}

export function projectChipClass(projectId: number | null | undefined): string {
  return `rcp-project-chip rcp-project-chip-${projectColorIndex(projectId) + 1}`
}

export function projectChipLabel(code?: string | null, name?: string | null): string {
  const trimmedName = name?.trim()
  if (trimmedName) return trimmedName
  return code?.trim() || '—'
}

export function formatAllocationHours(hours: number): string {
  const n = Number(hours)
  if (!Number.isFinite(n)) return '0'
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}
