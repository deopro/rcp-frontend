<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { useAuthStore } from '~/features/auth/stores/auth'
import { codeFromFetchError, resolveErrorDescription } from '~/shared/api/error-codes'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

const { t, locale, setLocale } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const route = useRoute()
const config = useRuntimeConfig()
const submitting = ref(false)
const showPassword = ref(false)
const microsoftEnabled = computed(() => config.public.authMode === 'oidc')

onMounted(() => {
  const code = typeof route.query.error === 'string' ? route.query.error : ''
  if (!code) return
  toast.error({
    title: t('auth.loginErrorTitle'),
    description: resolveErrorDescription(code, t, 'auth.errors.oidcInvalid'),
  })
})

function signInWithMicrosoft() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  const params = new URLSearchParams()
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    params.set('redirect', redirect)
  }
  const qs = params.toString()
  window.location.href = qs ? `/api/auth/microsoft?${qs}` : '/api/auth/microsoft'
}

const schema = computed(() =>
  toTypedSchema(
    z.object({
      identifier: z.string().min(1, t('auth.validation.identifierRequired')),
      password: z.string().min(1, t('auth.validation.passwordRequired')),
    }),
  ),
)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    identifier: '',
    password: '',
  },
})

const [identifier, identifierAttrs] = defineField('identifier')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(
  async (values) => {
    submitting.value = true
    try {
      const result = await auth.login(values.identifier, values.password)
      if (result.user.preferred_locale && result.user.preferred_locale !== locale.value) {
        await setLocale(result.user.preferred_locale)
      }
      toast.success({
        title: t('auth.loginSuccessTitle'),
        description: t('auth.loginSuccessDescription'),
      })
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      await navigateTo(redirect || '/')
    } catch (error: unknown) {
      toast.error({
        title: t('auth.loginErrorTitle'),
        description: resolveErrorDescription(codeFromFetchError(error), t, 'auth.loginErrorDescription'),
      })
    } finally {
      submitting.value = false
    }
  },
  (fieldErrors) => {
    const messages = [fieldErrors.identifier, fieldErrors.password].filter(Boolean)
    toast.warning({
      title: t('forms.validationTitle'),
      description: messages.length ? messages.join(' ') : t('auth.errors.missingFields'),
    })
  },
)
</script>

<template>
  <div class="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-soft sm:p-8">
    <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.loginTitle') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.loginSubtitle') }}</p>

    <form class="mt-8 space-y-4" novalidate @submit.prevent="onSubmit">
      <div class="space-y-1.5">
        <UiFormLabel for="identifier" required>{{ t('auth.identifier') }}</UiFormLabel>
        <input
          id="identifier"
          v-model="identifier"
          v-bind="identifierAttrs"
          type="text"
          autocomplete="username"
          required
          class="touch-target w-full rounded-lg border border-border bg-input px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :placeholder="t('auth.identifierPlaceholder')"
        >
        <p v-if="errors.identifier" class="text-xs text-danger">{{ errors.identifier }}</p>
      </div>

      <div class="space-y-1.5">
        <UiFormLabel for="password" required>{{ t('auth.password') }}</UiFormLabel>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="touch-target w-full rounded-lg border border-border bg-input py-0 pl-3 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :placeholder="t('auth.passwordPlaceholder')"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" />
            <Eye v-else class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p v-if="errors.password" class="text-xs text-danger">{{ errors.password }}</p>
      </div>

      <UiButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? t('auth.signingIn') : t('auth.signIn') }}
      </UiButton>
    </form>

    <template v-if="microsoftEnabled">
      <div class="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span class="h-px flex-1 bg-border" />
        {{ t('auth.microsoft.or') }}
        <span class="h-px flex-1 bg-border" />
      </div>
      <UiButton class="mt-4 w-full" variant="outline" type="button" @click="signInWithMicrosoft">
        {{ t('auth.microsoft.continue') }}
      </UiButton>
    </template>
  </div>
</template>
