/** Stable API error codes returned by Nuxt server routes (never show raw English to users). */
export const ApiErrorCode = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_INACTIVE: 'AUTH_USER_INACTIVE',
  AUTH_MISSING_FIELDS: 'AUTH_MISSING_FIELDS',
  AUTH_OIDC_NOT_CONFIGURED: 'AUTH_OIDC_NOT_CONFIGURED',
  AUTH_OIDC_USER_NOT_FOUND: 'AUTH_OIDC_USER_NOT_FOUND',
  AUTH_OIDC_INVALID: 'AUTH_OIDC_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  VALIDATION: 'VALIDATION',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  PERIOD_LOCKED: 'PERIOD_LOCKED',
  NETWORK: 'NETWORK',
  GENERIC: 'GENERIC',
} as const

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

const MESSAGE_TO_CODE: Record<string, ApiErrorCode> = {
  'invalid identifier or password': ApiErrorCode.AUTH_INVALID_CREDENTIALS,
  'invalid credentials': ApiErrorCode.AUTH_INVALID_CREDENTIALS,
  'identifier and password are required': ApiErrorCode.AUTH_MISSING_FIELDS,
  'user is inactive': ApiErrorCode.AUTH_USER_INACTIVE,
  capacity_exceeded: ApiErrorCode.CAPACITY_EXCEEDED,
  period_locked: ApiErrorCode.PERIOD_LOCKED,
  forbidden: ApiErrorCode.FORBIDDEN,
  'not found': ApiErrorCode.NOT_FOUND,
}

const CODE_TO_I18N: Record<ApiErrorCode, string> = {
  [ApiErrorCode.AUTH_INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [ApiErrorCode.AUTH_USER_INACTIVE]: 'auth.errors.userInactive',
  [ApiErrorCode.AUTH_MISSING_FIELDS]: 'auth.errors.missingFields',
  [ApiErrorCode.AUTH_OIDC_NOT_CONFIGURED]: 'auth.errors.oidcNotConfigured',
  [ApiErrorCode.AUTH_OIDC_USER_NOT_FOUND]: 'auth.errors.oidcUserNotFound',
  [ApiErrorCode.AUTH_OIDC_INVALID]: 'auth.errors.oidcInvalid',
  [ApiErrorCode.FORBIDDEN]: 'errors.forbidden',
  [ApiErrorCode.NOT_FOUND]: 'errors.notFoundRecord',
  [ApiErrorCode.DUPLICATE]: 'errors.duplicate',
  [ApiErrorCode.VALIDATION]: 'errors.validation',
  [ApiErrorCode.CAPACITY_EXCEEDED]: 'allocations.errors.capacityExceeded',
  [ApiErrorCode.PERIOD_LOCKED]: 'allocations.errors.periodLocked',
  [ApiErrorCode.NETWORK]: 'errors.network',
  [ApiErrorCode.GENERIC]: 'errors.genericDescription',
}

export function codeFromMessage(message?: string | null): ApiErrorCode {
  if (!message) return ApiErrorCode.GENERIC
  const normalized = message.trim().toLowerCase()
  if (MESSAGE_TO_CODE[normalized]) return MESSAGE_TO_CODE[normalized]
  if (normalized.includes('unique') || normalized.includes('already exists')) {
    return ApiErrorCode.DUPLICATE
  }
  if (normalized.includes('validation') || normalized.includes('required')) {
    return ApiErrorCode.VALIDATION
  }
  return ApiErrorCode.GENERIC
}

export function codeFromHttpStatus(status: number, message?: string | null): ApiErrorCode {
  if (status === 403) return ApiErrorCode.FORBIDDEN
  if (status === 404) return ApiErrorCode.NOT_FOUND
  if (status === 400) return codeFromMessage(message)
  if (status >= 500) return ApiErrorCode.GENERIC
  return codeFromMessage(message)
}

export function resolveErrorDescription(
  code: ApiErrorCode | string | undefined,
  t: (key: string) => string,
  fallbackKey = 'errors.genericDescription',
): string {
  const mapped = code && CODE_TO_I18N[code as ApiErrorCode]
  if (mapped) return t(mapped)
  return t(fallbackKey)
}

export type ApiErrorToast = {
  title: string
  description: string
}

export function resolveApiErrorToast(error: unknown, t: (key: string) => string): ApiErrorToast {
  const title = t('errors.title')

  if (!(error instanceof Error)) {
    return { title, description: t('errors.genericDescription') }
  }

  if (error.name !== 'ApiError' || !('code' in error)) {
    return { title, description: t('errors.genericDescription') }
  }

  const apiError = error as Error & { code: ApiErrorCode; message: string }
  let description = resolveErrorDescription(apiError.code, t)

  if (apiError.code === ApiErrorCode.GENERIC && apiError.message) {
    const mapped = codeFromMessage(apiError.message)
    if (mapped !== ApiErrorCode.GENERIC) {
      description = resolveErrorDescription(mapped, t)
    }
  }

  return { title, description }
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
