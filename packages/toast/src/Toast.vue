<template>
  <div
    :class="classes"
    role="status"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <div :class="$style.text">
      <p :class="$style.title">{{ title }}</p>
      <p v-if="description" :class="$style.description">{{ description }}</p>
    </div>

    <button :class="$style.close" type="button" aria-label="Dismiss" @click="close">
      <Icon :icon="X" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useCssModule } from 'vue'
import { Icon } from '@surstromming/icon'
import { X } from 'lucide'
import type { ToastVariant } from './index'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    variant?: ToastVariant
    duration?: number
  }>(),
  { variant: 'info', duration: 5000 },
)

const emit = defineEmits<{ close: [] }>()

// Each toast owns its own timer — the list doesn't have to track any. What's
// left of `duration` is tracked alongside it, so pausing and resuming doesn't
// hand back a full countdown every time the pointer crosses the toast.
let timer: ReturnType<typeof setTimeout> | undefined
let remaining = props.duration
let startedAt = 0

const run = () => {
  if (remaining <= 0) return
  startedAt = Date.now()
  timer = setTimeout(close, remaining)
}

// Reading a toast shouldn't be a race against it: hovering or tabbing into one
// holds it, and reaching for the ✕ can't make it vanish first.
const pause = () => {
  if (!timer) return
  clearTimeout(timer)
  timer = undefined
  remaining -= Date.now() - startedAt
}

const resume = () => {
  if (timer) return
  run()
}

onMounted(run)

onBeforeUnmount(() => {
  clearTimeout(timer)
})

function close() {
  emit('close')
}

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`variant-${props.variant}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  align-items: flex-start;
  gap: design.spacing(3);
  width: design.spacing(80);
  max-width: calc(100vw - #{design.spacing(8)});
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
  background-color: design.color(popover);
  padding: design.spacing(4);
  color: design.color(popover-foreground);
  box-shadow: 0 4px 12px design.with-alpha(foreground, 10%);
}

.text {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 0.875rem;
  font-weight: 500;
}

.description {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

.close {
  flex-shrink: 0;
  border-radius: design.radius(sm);
  background-color: transparent;
  color: design.color(muted-foreground);
  cursor: pointer;
  outline: none;

  &:hover {
    color: design.color(foreground);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }
}

.variant-destructive {
  border-color: design.with-alpha(destructive, 50%);
  color: design.color(destructive);

  .description {
    color: design.with-alpha(destructive, 90%);
  }

  .close {
    color: design.color(destructive);
  }
}
</style>
