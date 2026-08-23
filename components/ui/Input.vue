<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  modelValue?: string | number | null
  type?: string
  id?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type || 'text'"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :class="
      cn(
        'flex h-11 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
