<script setup lang="ts">
import { ShieldX } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { t } = useI18n()

const fromPath = computed(() => {
  const value = route.query.from
  return typeof value === 'string' && value.startsWith('/') ? value : null
})
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
    <div class="rounded-full bg-subtle p-4">
      <ShieldX class="size-10 text-muted" aria-hidden="true" />
    </div>
    <h1 class="mt-6 text-xl font-semibold">{{ t('errors.accessDenied.title') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('errors.accessDenied.description') }}</p>
    <p v-if="fromPath" class="mt-2 font-mono text-xs text-muted">{{ fromPath }}</p>
    <NuxtLink to="/" class="mt-6">
      <UiButton>{{ t('errors.accessDenied.back') }}</UiButton>
    </NuxtLink>
  </div>
</template>
