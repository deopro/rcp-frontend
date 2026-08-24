<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { cn } from '~/utils/cn'

export type SearchSelectOption = {
  id: number
  label: string
  searchText?: string
}

const props = defineProps<{
  modelValue: string
  options: SearchSelectOption[]
  disabled?: boolean
  id?: string
  placeholder?: string
  searchPlaceholder?: string
  noneLabel?: string
  allowEmpty?: boolean
  class?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { t } = useI18n()
const open = ref(false)
const query = ref('')
const rootRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

const selected = computed(() =>
  props.options.find((opt) => String(opt.id) === props.modelValue),
)

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((opt) => {
    const haystack = `${opt.label} ${opt.searchText ?? ''}`.toLowerCase()
    return haystack.includes(q)
  })
})

const triggerLabel = computed(() => selected.value?.label || props.placeholder || t('org.none'))

function openPanel() {
  if (props.disabled) return
  open.value = true
  query.value = ''
  nextTick(() => searchRef.value?.focus())
}

function closePanel() {
  open.value = false
  query.value = ''
}

function choose(id: number | '') {
  emit('update:modelValue', id === '' ? '' : String(id))
  closePanel()
}

onClickOutside(rootRef, () => {
  if (open.value) closePanel()
})

onKeyStroke('Escape', (event) => {
  if (!open.value) return
  event.preventDefault()
  closePanel()
})
</script>

<template>
  <div ref="rootRef" :class="cn('relative', props.class)">
    <button
      :id="id"
      type="button"
      class="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open ? closePanel() : openPanel()"
    >
      <span :class="selected ? 'text-foreground' : 'text-muted'">{{ triggerLabel }}</span>
      <svg
        class="ml-auto h-4 w-4 shrink-0 text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
    >
      <div class="border-b border-border p-2">
        <input
          ref="searchRef"
          v-model="query"
          type="search"
          class="flex h-11 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :placeholder="searchPlaceholder ?? t('forms.searchMultiSelect')"
        >
      </div>
      <ul class="max-h-56 overflow-y-auto p-1" role="listbox">
        <li v-if="allowEmpty !== false">
          <button
            type="button"
            class="flex w-full rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-hover"
            @click="choose('')"
          >
            {{ noneLabel ?? t('org.none') }}
          </button>
        </li>
        <li v-if="!filteredOptions.length" class="px-3 py-3 text-center text-sm text-muted">
          {{ t('forms.noMatches') }}
        </li>
        <li v-for="opt in filteredOptions" :key="opt.id">
          <button
            type="button"
            role="option"
            class="flex w-full rounded-md px-3 py-2 text-left text-sm hover:bg-hover"
            :class="String(opt.id) === modelValue ? 'bg-subtle font-medium' : ''"
            :aria-selected="String(opt.id) === modelValue"
            @click="choose(opt.id)"
          >
            {{ opt.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
