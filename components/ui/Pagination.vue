<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { PAGE_SIZE_OPTIONS } from '~/composables/useClientPagination'

const props = withDefaults(
  defineProps<{
    page: number
    pageSize: number
    pageCount: number
    total: number
    from: number
    to: number
    pageSizeOptions?: readonly number[]
  }>(),
  {
    pageSizeOptions: () => PAGE_SIZE_OPTIONS,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const { t } = useI18n()

const pages = computed(() => {
  const count = props.pageCount
  const current = props.page
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1)
  }
  const set = new Set<number>([1, count, current, current - 1, current + 1])
  if (current <= 3) {
    set.add(2)
    set.add(3)
    set.add(4)
  }
  if (current >= count - 2) {
    set.add(count - 1)
    set.add(count - 2)
    set.add(count - 3)
  }
  return [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b)
})

function go(next: number) {
  const clamped = Math.min(props.pageCount, Math.max(1, next))
  if (clamped !== props.page) emit('update:page', clamped)
}

function onPageSize(value: string) {
  const size = Number(value)
  if (!Number.isFinite(size)) return
  emit('update:pageSize', size)
  emit('update:page', 1)
}
</script>

<template>
  <nav
    v-if="total > 0"
    class="flex flex-col gap-3 rounded-lg border border-border bg-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
    :aria-label="t('pagination.label')"
  >
    <p class="text-xs text-muted sm:text-sm">
      {{ t('pagination.showing', { from, to, total }) }}
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <label class="inline-flex items-center gap-2 text-xs text-muted">
        <span class="whitespace-nowrap">{{ t('pagination.perPage') }}</span>
        <select
          class="h-9 rounded-lg border border-border bg-input px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :value="String(pageSize)"
          :aria-label="t('pagination.perPage')"
          @change="onPageSize(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="String(size)">
            {{ size }}
          </option>
        </select>
      </label>

      <div class="inline-flex items-center gap-0.5">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          :disabled="page <= 1"
          :aria-label="t('pagination.first')"
          @click="go(1)"
        >
          <ChevronsLeft class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          :disabled="page <= 1"
          :aria-label="t('pagination.prev')"
          @click="go(page - 1)"
        >
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
        </button>

        <template v-for="(n, i) in pages" :key="n">
          <span
            v-if="i > 0 && n - pages[i - 1]! > 1"
            class="px-1 text-xs text-muted"
            aria-hidden="true"
          >
            …
          </span>
          <button
            type="button"
            class="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors"
            :class="
              n === page
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-hover'
            "
            :aria-current="n === page ? 'page' : undefined"
            :aria-label="t('pagination.page', { page: n })"
            @click="go(n)"
          >
            {{ n }}
          </button>
        </template>

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          :disabled="page >= pageCount"
          :aria-label="t('pagination.next')"
          @click="go(page + 1)"
        >
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          :disabled="page >= pageCount"
          :aria-label="t('pagination.last')"
          @click="go(pageCount)"
        >
          <ChevronsRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </nav>
</template>
