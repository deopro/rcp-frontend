/** Words omitted when deriving project code initials (pt-PT / en). */
const STOP_WORDS = new Set([
  'a',
  'o',
  'os',
  'as',
  'e',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'the',
  'and',
  'of',
  'for',
])

function firstAlphanumericChar(word: string): string {
  const normalized = word.normalize('NFD').replace(/\p{M}/gu, '')
  const match = normalized.match(/[A-Za-z0-9]/)
  return match ? match[0].toUpperCase() : ''
}

/** e.g. "Agência de Gestão Tributária" → "AGT2026" */
export function projectCodeFromName(name: string, year = new Date().getFullYear()): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word.toLowerCase()))
    .map(firstAlphanumericChar)
    .join('')

  if (!initials) return ''
  return `${initials}${year}`
}
