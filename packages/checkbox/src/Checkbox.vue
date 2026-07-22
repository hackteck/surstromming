<template>
  <span :class="$style.root">
    <input ref="input" v-model="model" :class="$style.input" type="checkbox" v-bind="$attrs" />
    <span :class="$style.box">
      <Icon v-if="mark" :icon="mark" :size="14" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from 'vue'
import { Icon } from '@surstromming/icon'
import { Check, Minus } from 'lucide'

// The native input is the interactive element — id/aria/name belong on it.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /**
     * Neither checked nor unchecked — "some of the things below are". It's a
     * display state, not a third value: clicking still resolves to a boolean,
     * and the consumer decides what that means.
     */
    indeterminate?: boolean
  }>(),
  { indeterminate: false },
)

const model = defineModel<boolean>()

const input = useTemplateRef<HTMLInputElement>('input')

// `indeterminate` is a DOM property with no attribute behind it, so Vue can't
// bind it — it has to be assigned. CSS still sees it as `:indeterminate`.
watchEffect(() => {
  if (input.value) input.value.indeterminate = props.indeterminate
})

const mark = computed(() => {
  if (props.indeterminate) return Minus
  return model.value ? Check : null
})
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: design.spacing(4);
  height: design.spacing(4);
}

// Kept real (not display:none) so clicks, focus and forms stay native;
// it sits on top of the drawn box and is simply invisible.
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

.box {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  border: 1px solid design.color(input);
  border-radius: design.radius(sm);
  color: design.color(primary-foreground);
  box-shadow: design.shadow(xs);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  // Unchecked, the box needs a fill of its own on a dark surface.
  #{design.$darkThemeSelector} & {
    background-color: design.with-alpha(input, 30%);
  }
}

// Indeterminate is painted like checked — it means "something is selected", so
// it should read as an on state, not as a third colour.
.input:checked + .box,
.input:indeterminate + .box {
  border-color: design.color(primary);
  background-color: design.color(primary);

  #{design.$darkThemeSelector} & {
    background-color: design.color(primary);
  }
}

.input:focus-visible + .box {
  border-color: design.color(ring);
  box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
}

.input[aria-invalid='true'] + .box {
  border-color: design.color(destructive);
  box-shadow: 0 0 0 3px design.with-alpha(destructive, 20%);
}

.input:disabled + .box {
  opacity: 0.5;
}

#{design.$darkThemeSelector} .input[aria-invalid='true'] + .box {
  box-shadow: 0 0 0 3px design.with-alpha(destructive, 40%);
}
</style>
