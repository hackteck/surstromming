<template>
  <input
    :class="$style.root"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :value="model"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
  }>(),
  { min: 0, max: 100, step: 1 },
)

const model = defineModel<number>({ default: 0 })

const onInput = (event: Event) => {
  model.value = (event.target as HTMLInputElement).valueAsNumber
}

// Paints the filled part of the track — the only value CSS can't derive itself.
const fill = computed(() => {
  const ratio = (model.value - props.min) / (props.max - props.min)
  return `${Math.min(Math.max(ratio, 0), 1) * 100}%`
})
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

$track-height: design.spacing(1.5);
$thumb-size: design.spacing(4);

.root {
  width: 100%;
  height: $thumb-size;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #{design.color(primary)} v-bind(fill),
    #{design.color(muted)} v-bind(fill)
  );
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% #{$track-height};
  appearance: none;
  cursor: pointer;
  outline: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  // The two pseudo-elements can't be grouped in one rule: an unknown selector
  // in the list makes the whole rule invalid in that engine.
  // White in both themes, like shadcn: the thumb reads as a physical knob on
  // the track rather than a hole punched in it.
  &::-webkit-slider-thumb {
    width: $thumb-size;
    height: $thumb-size;
    border: 1px solid design.color(primary);
    border-radius: 9999px;
    background-color: white;
    box-shadow: design.shadow(sm);
    appearance: none;
    transition: box-shadow 0.15s ease;
  }

  &::-moz-range-thumb {
    width: $thumb-size;
    height: $thumb-size;
    border: 1px solid design.color(primary);
    border-radius: 9999px;
    background-color: white;
    box-shadow: design.shadow(sm);
    transition: box-shadow 0.15s ease;
  }

  // A 4px halo on hover as well as focus — the grab target is bigger than it looks.
  &:hover::-webkit-slider-thumb,
  &:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 4px design.with-alpha(ring, 50%),
      design.shadow(sm);
  }

  &:hover::-moz-range-thumb,
  &:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 4px design.with-alpha(ring, 50%),
      design.shadow(sm);
  }
}
</style>
