<template>
  <div
    :class="$style.root"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div :class="$style.bar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number
    max?: number
  }>(),
  { value: 0, max: 100 },
)

// Translating the full-width bar (instead of animating width) keeps the
// browser on the compositor — no layout on every tick of an upload.
const offset = computed(() => {
  const ratio = props.max ? props.value / props.max : 0
  return `-${100 - Math.min(Math.max(ratio, 0), 1) * 100}%`
})
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  width: 100%;
  height: design.spacing(2);
  border-radius: 9999px;
  background-color: design.with-alpha(primary, 20%);
  overflow: hidden;
}

.bar {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background-color: design.color(primary);
  transform: translateX(v-bind(offset));
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
}
</style>
