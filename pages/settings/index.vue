<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { formatRoleLabel } from '~/shared/auth/format-role'
import { formatUserLabel } from '~/shared/users/format-user-label'

const { t, te } = useI18n()
const auth = useAuthStore()
const { logout, loggingOut } = useLogout()

const displayName = computed(() =>
  auth.user ? formatUserLabel(auth.user) : '',
)

const roleLabel = computed(() => formatRoleLabel(t, te, auth.user?.role))
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <div>
      <h2 class="text-xl font-semibold">{{ t('nav.settings') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('settings.subtitle') }}</p>
    </div>

    <section
      v-if="auth.user"
      class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <h3 class="text-sm font-semibold">{{ t('settings.account') }}</h3>
      <div>
        <p class="text-sm font-medium">{{ displayName }}</p>
        <p class="text-xs text-muted">{{ auth.user.email }}</p>
        <p v-if="roleLabel" class="mt-1 text-xs text-muted">
          {{ roleLabel }}
        </p>
      </div>
      <UiButton
        variant="outline"
        class="w-full sm:w-auto"
        :disabled="loggingOut"
        @click="logout"
      >
        {{ loggingOut ? t('auth.signingOut') : t('auth.signOut') }}
      </UiButton>
    </section>

    <section class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-soft">
      <h3 class="text-sm font-semibold">{{ t('theme.label') }}</h3>
      <AppThemeToggle variant="select" />
    </section>

    <section class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-soft">
      <h3 class="text-sm font-semibold">{{ t('actions.language') }}</h3>
      <AppLanguageSwitcher />
    </section>
  </div>
</template>
