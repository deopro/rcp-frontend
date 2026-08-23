<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
  <ClientOnly>
    <UiConfirmDialog />
    <template #fallback>
      <span aria-hidden="true" class="hidden" />
    </template>
  </ClientOnly>
</template>
