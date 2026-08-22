/** Prefix + zero-padded sequence, e.g. RCP0001 */
export const PROJECT_CODE_PREFIX = 'RCP'
export const PROJECT_CODE_PAD = 4

const CODE_RE = new RegExp(`^${PROJECT_CODE_PREFIX}(\\d+)$`, 'i')

export function formatProjectCode(sequence: number): string {
  const n = Math.max(1, Math.floor(sequence))
  return `${PROJECT_CODE_PREFIX}${String(n).padStart(PROJECT_CODE_PAD, '0')}`
}

/** Returns the numeric sequence from a code like RCP0007, or null if not matching. */
export function parseProjectCodeSequence(code: string | null | undefined): number | null {
  if (!code) return null
  const match = String(code).trim().match(CODE_RE)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

/** Next unique code after the highest RCP#### found in existing codes. */
export function nextProjectCode(existingCodes: Iterable<string | null | undefined>): string {
  let max = 0
  for (const code of existingCodes) {
    const seq = parseProjectCodeSequence(code)
    if (seq != null && seq > max) max = seq
  }
  return formatProjectCode(max + 1)
}
