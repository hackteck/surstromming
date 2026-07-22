<template>
  <Teleport to="body">
    <TransitionGroup
      :class="$style.viewport"
      tag="div"
      :enter-from-class="$style.enterFrom"
      :enter-active-class="$style.active"
      :leave-to-class="$style.leaveTo"
      :leave-active-class="$style.active"
      aria-live="polite"
    >
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :title="toast.title"
        :description="toast.description"
        :variant="toast.variant"
        :duration="toast.duration"
        @close="emit('dismiss', toast.id)"
      />
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import type { ToastItem } from './index'

defineProps<{ toasts: ToastItem[] }>()

const emit = defineEmits<{ dismiss: [id: number] }>()
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.viewport {
  position: fixed;
  right: design.spacing(4);
  bottom: design.spacing(4);
  z-index: design.z-index(toast); // above a modal
  display: flex;
  flex-direction: column;
  gap: design.spacing(2);
}

.active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.enterFrom,
.leaveTo {
  opacity: 0;
  transform: translateY(design.spacing(2));
}

@media (prefers-reduced-motion: reduce) {
  .active {
    transition: none;
  }
}
</style>
