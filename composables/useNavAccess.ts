import type { RcpRoleType } from '~/features/auth/types'
import { canAccessNavRoute } from '~/shared/navigation/nav-access'

export function useNavAccess() {
  const auth = useAuthStore()

  const roleType = computed(() => auth.roleType)

  function canAccess(path: string): boolean {
    return canAccessNavRoute(roleType.value, path)
  }

  function hasAnyRole(...roles: RcpRoleType[]): boolean {
    return auth.hasRole(...roles)
  }

  return {
    roleType,
    canAccess,
    hasAnyRole,
    isEmployee: computed(() => roleType.value === 'employee'),
  }
}
