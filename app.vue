<template>
  <NuxtLoadingIndicator color="var(--rcp-accent)" :height="2" :throttle="120" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
  <UiConfirmDialog />
</template>
