<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-xl font-semibold">{{ t('nav.skills') }}</h2>
    <p class="text-sm text-muted">{{ t('empty.generic') }}</p>
  </div>
</template>
