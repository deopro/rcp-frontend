<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const { t } = useI18n()
const colorMode = useColorMode()
const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))
</script>

<template>
  <ClientOnly>
    <Toaster
      rich-colors
      close-button
      position="bottom-right"
      :theme="theme"
      :container-aria-label="t('a11y.toasts')"
      :toast-options="{
        class: 'border border-border shadow-soft',
        closeButtonAriaLabel: t('a11y.closeToast'),
      }"
    />
  </ClientOnly>
</template>
