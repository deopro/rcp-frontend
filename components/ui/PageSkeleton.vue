<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'table' | 'dashboard' | 'kpis' | 'grid' | 'list' | 'cards'
    rows?: number
  }>(),
  {
    variant: 'table',
    rows: 8,
  },
)

const { t } = useI18n()
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">{{ t('a11y.loading') }}</span>

    <!-- KPI + charts (dashboard) -->
    <div v-if="variant === 'dashboard'" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="n in 4"
          :key="`kpi-${n}`"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <UiSkeleton class="h-3 w-20" />
          <UiSkeleton class="mt-3 h-8 w-24" />
        </div>
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <UiSkeleton class="h-3 w-32" />
          <UiSkeleton class="mt-4 h-48 w-full rounded-md" />
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <UiSkeleton class="h-3 w-28" />
          <UiSkeleton class="mt-4 h-48 w-full rounded-md" />
        </div>
      </div>
      <div class="rounded-lg border border-border bg-surface p-4 shadow-soft">
        <UiSkeleton class="h-3 w-40" />
        <div class="mt-4 space-y-3">
          <div v-for="n in 4" :key="`pending-${n}`" class="flex items-center gap-3">
            <UiSkeleton class="h-9 w-9 shrink-0 rounded-md" />
            <div class="min-w-0 flex-1 space-y-2">
              <UiSkeleton class="h-3 w-2/3" />
              <UiSkeleton class="h-3 w-1/3" />
            </div>
            <UiSkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- KPI row + table (bench, forecast) -->
    <div v-else-if="variant === 'kpis'" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="n in 4"
          :key="`stat-${n}`"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <UiSkeleton class="h-3 w-24" />
          <UiSkeleton class="mt-3 h-8 w-20" />
        </div>
      </div>
      <div class="overflow-hidden rounded-lg border border-border bg-surface">
        <div class="border-b border-border bg-subtle px-4 py-3">
          <div class="flex gap-8">
            <UiSkeleton class="h-3 w-28" />
            <UiSkeleton class="hidden h-3 w-20 sm:block" />
            <UiSkeleton class="hidden h-3 w-16 md:block" />
            <UiSkeleton class="ml-auto h-3 w-14" />
          </div>
        </div>
        <div class="divide-y divide-border">
          <div v-for="n in rows" :key="`kpi-row-${n}`" class="flex items-center gap-4 px-4 py-3.5">
            <UiSkeleton class="h-3 w-36" />
            <UiSkeleton class="hidden h-3 w-24 sm:block" />
            <UiSkeleton class="hidden h-3 w-16 md:block" />
            <UiSkeleton class="ml-auto h-3 w-12" />
          </div>
        </div>
      </div>
    </div>

    <!-- Allocation-style grid -->
    <div v-else-if="variant === 'grid'" class="overflow-hidden rounded-lg border border-border bg-surface">
      <div class="flex gap-2 border-b border-border bg-subtle px-3 py-3">
        <UiSkeleton class="h-3 w-32 shrink-0" />
        <UiSkeleton v-for="n in 5" :key="`col-${n}`" class="h-3 flex-1" />
      </div>
      <div class="divide-y divide-border">
        <div v-for="n in rows" :key="`grid-row-${n}`" class="flex items-center gap-2 px-3 py-2.5">
          <UiSkeleton class="h-3 w-32 shrink-0" />
          <UiSkeleton v-for="c in 5" :key="`cell-${n}-${c}`" class="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </div>

    <!-- Notification / feed list -->
    <div v-else-if="variant === 'list'" class="space-y-2">
      <div
        v-for="n in rows"
        :key="`item-${n}`"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <UiSkeleton class="h-3 w-24" />
        <UiSkeleton class="mt-3 h-4 w-3/4" />
        <UiSkeleton class="mt-2 h-3 w-1/2" />
      </div>
    </div>

    <!-- Result cards (AI) -->
    <div v-else-if="variant === 'cards'" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="n in 3"
          :key="`card-kpi-${n}`"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <UiSkeleton class="h-3 w-20" />
          <UiSkeleton class="mt-3 h-8 w-16" />
        </div>
      </div>
      <div
        v-for="n in 4"
        :key="`card-${n}`"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <UiSkeleton class="h-4 w-40" />
            <UiSkeleton class="h-3 w-2/3" />
          </div>
          <UiSkeleton class="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>

    <!-- Default CRUD table + mobile cards -->
    <div v-else>
      <div class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <div class="border-b border-border bg-subtle px-4 py-3">
          <div class="flex gap-8">
            <UiSkeleton class="h-3 w-32" />
            <UiSkeleton class="h-3 w-24" />
            <UiSkeleton class="h-3 w-20" />
            <UiSkeleton class="ml-auto h-3 w-16" />
          </div>
        </div>
        <div class="divide-y divide-border">
          <div v-for="n in rows" :key="`row-${n}`" class="flex items-center gap-8 px-4 py-3.5">
            <div class="w-40 space-y-1.5">
              <UiSkeleton class="h-3.5 w-36" />
              <UiSkeleton class="h-3 w-24" />
            </div>
            <UiSkeleton class="h-3 w-28" />
            <UiSkeleton class="h-3 w-16" />
            <UiSkeleton class="ml-auto h-7 w-14 rounded-md" />
          </div>
        </div>
      </div>
      <ul class="space-y-3 md:hidden">
        <li
          v-for="n in Math.min(rows, 5)"
          :key="`mobile-${n}`"
          class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-2">
              <UiSkeleton class="h-4 w-2/3" />
              <UiSkeleton class="h-3 w-1/2" />
            </div>
            <UiSkeleton class="h-5 w-16 rounded-full" />
          </div>
          <UiSkeleton class="mt-3 h-9 w-full rounded-lg" />
        </li>
      </ul>
    </div>
  </div>
</template>
