/** Stable API error codes returned by Nuxt server routes (never show raw English to users). */
export const ApiErrorCode = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_INACTIVE: 'AUTH_USER_INACTIVE',
  AUTH_MISSING_FIELDS: 'AUTH_MISSING_FIELDS',
  GENERIC: 'GENERIC',
} as const

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

const MESSAGE_TO_CODE: Record<string, ApiErrorCode> = {
  'invalid identifier or password': ApiErrorCode.AUTH_INVALID_CREDENTIALS,
  'invalid credentials': ApiErrorCode.AUTH_INVALID_CREDENTIALS,
  'identifier and password are required': ApiErrorCode.AUTH_MISSING_FIELDS,
  'user is inactive': ApiErrorCode.AUTH_USER_INACTIVE,
}

const CODE_TO_I18N: Record<ApiErrorCode, string> = {
  [ApiErrorCode.AUTH_INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [ApiErrorCode.AUTH_USER_INACTIVE]: 'auth.errors.userInactive',
  [ApiErrorCode.AUTH_MISSING_FIELDS]: 'auth.errors.missingFields',
  [ApiErrorCode.GENERIC]: 'errors.generic',
}

export function codeFromMessage(message?: string | null): ApiErrorCode {
  if (!message) return ApiErrorCode.GENERIC
  return MESSAGE_TO_CODE[message.trim().toLowerCase()] ?? ApiErrorCode.GENERIC
}

export function resolveErrorDescription(
  code: ApiErrorCode | string | undefined,
  t: (key: string) => string,
  fallbackKey = 'errors.generic',
): string {
  const mapped = code && CODE_TO_I18N[code as ApiErrorCode]
  if (mapped) return t(mapped)
  return t(fallbackKey)
}

export type FetchErrorShape = {
  data?: { code?: string }
  statusMessage?: string
  message?: string
}

export function codeFromFetchError(error: unknown): ApiErrorCode {
  const err = error as FetchErrorShape
  if (err.data?.code && CODE_TO_I18N[err.data.code as ApiErrorCode]) {
    return err.data.code as ApiErrorCode
  }
  return codeFromMessage(err.statusMessage || err.message)
}
