<template>
  <div :class="classes" role="radiogroup">
    <label v-for="option in options" :key="option.value" :class="$style.option">
      <span :class="$style.control">
        <input
          v-model="model"
          :class="$style.input"
          type="radio"
          :name="name"
          :value="option.value"
          :disabled="option.disabled"
        />
        <span :class="$style.circle">
          <span :class="$style.dot" />
        </span>
      </span>
      {{ option.label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule, useId } from 'vue'
import type { RadioGroupOrientation, RadioOption } from './index'

const props = withDefaults(
  defineProps<{
    options: RadioOption[]
    orientation?: RadioGroupOrientation
    /** Groups the inputs; only needed when two groups share a form. */
    name?: string
  }>(),
  { orientation: 'vertical' },
)

const model = defineModel<string>()

// One name per group is what makes the natives mutually exclusive.
const generatedName = useId()
const name = computed(() => props.name ?? generatedName)

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`orientation-${props.orientation}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  gap: design.spacing(2);
}

.orientation-vertical {
  flex-direction: column;
}

.orientation-horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: design.spacing(4);
}

.option {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
  font-size: 0.875rem;
  user-select: none;

  &:has(.input:disabled) {
    opacity: 0.5;
  }
}

.control {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: design.spacing(4);
  height: design.spacing(4);
}

// Kept real (not display:none) so clicks, arrow keys and forms stay native.
.input {
  position: absolute;
  inset: 0;
  z-index: 1;
  margin: 0;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.circle {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  border: 1px solid design.color(input);
  border-radius: 9999px;
  box-shadow: design.shadow(xs);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  // Unchecked, the circle needs a fill of its own on a dark surface.
  #{design.$darkThemeSelector} & {
    background-color: design.with-alpha(input, 30%);
  }
}

.dot {
  width: design.spacing(2);
  height: design.spacing(2);
  border-radius: 9999px;
  background-color: design.color(primary);
  transform: scale(0);
  transition: transform 0.15s ease;
}

.input:checked + .circle {
  border-color: design.color(primary);

  .dot {
    transform: scale(1);
  }
}

.input:focus-visible + .circle {
  border-color: design.color(ring);
  box-shadow:
    0 0 0 3px design.with-alpha(ring, 50%),
    design.shadow(xs);
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    transition: none;
  }
}
</style>
