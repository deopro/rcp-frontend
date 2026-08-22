<script setup lang="ts">
defineProps<{
  for?: string
  required?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <label :for="for" class="text-sm font-medium">
    <slot />
    <span v-if="required" class="text-danger" aria-hidden="true"> *</span>
    <span v-if="required" class="sr-only">{{ t('forms.required') }}</span>
  </label>
</template>
