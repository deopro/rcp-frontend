export type RequiredField = {
  label: string
  value: unknown
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'number') return Number.isNaN(value)
  return false
}

export function getMissingRequiredFields(fields: RequiredField[]): string[] {
  return fields.filter((field) => isEmptyValue(field.value)).map((field) => field.label)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
