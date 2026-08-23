<template>
  <div class="flex h-dvh overflow-hidden bg-background text-foreground">
    <AppDesktopSidebar />

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <AppHeader>
        <template #actions>
          <slot name="header-actions" />
        </template>
      </AppHeader>

      <main class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-safe-nav md:px-6 md:pb-6">
        <slot />
      </main>
    </div>

    <AppMobileBottomNav />
  </div>
</template>
