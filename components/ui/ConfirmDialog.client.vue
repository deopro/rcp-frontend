<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { useConfirmDialog } from '~/composables/useConfirmDialog'

const { state, accept, dismiss } = useConfirmDialog()

onKeyStroke('Escape', (event) => {
  if (!state.open) return
  event.preventDefault()
  dismiss()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 md:items-center"
      role="presentation"
      @click.self="dismiss"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="state.open ? 'confirm-dialog-title' : undefined"
        :aria-describedby="state.open ? 'confirm-dialog-message' : undefined"
        class="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-soft"
      >
        <h3 id="confirm-dialog-title" class="text-lg font-semibold">
          {{ state.title }}
        </h3>
        <p id="confirm-dialog-message" class="mt-2 text-sm text-muted">
          {{ state.message }}
        </p>
        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <UiButton type="button" variant="outline" @click="dismiss">
            {{ state.cancelLabel }}
          </UiButton>
          <UiButton
            type="button"
            :variant="state.variant === 'danger' ? 'danger' : 'default'"
            @click="accept"
          >
            {{ state.confirmLabel }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
