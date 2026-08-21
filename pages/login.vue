<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { useAuthStore } from '~/features/auth/stores/auth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

const { t, locale, setLocale } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const route = useRoute()
const submitting = ref(false)

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

const onSubmit = handleSubmit(async (values) => {
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
    const err = error as { statusMessage?: string; data?: { message?: string } }
    toast.error({
      title: t('auth.loginErrorTitle'),
      description: err.statusMessage || err.data?.message || t('auth.loginErrorDescription'),
    })
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-soft sm:p-8">
    <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.loginTitle') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('auth.loginSubtitle') }}</p>

    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="identifier">{{ t('auth.identifier') }}</label>
        <input
          id="identifier"
          v-model="identifier"
          v-bind="identifierAttrs"
          type="text"
          autocomplete="username"
          class="touch-target w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :placeholder="t('auth.identifierPlaceholder')"
        >
        <p v-if="errors.identifier" class="text-xs text-danger">{{ errors.identifier }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="password">{{ t('auth.password') }}</label>
        <input
          id="password"
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          autocomplete="current-password"
          class="touch-target w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :placeholder="t('auth.passwordPlaceholder')"
        >
        <p v-if="errors.password" class="text-xs text-danger">{{ errors.password }}</p>
      </div>

      <UiButton type="submit" class="w-full" :disabled="submitting">
        {{ submitting ? t('auth.signingIn') : t('auth.signIn') }}
      </UiButton>
    </form>
  </div>
</template>
