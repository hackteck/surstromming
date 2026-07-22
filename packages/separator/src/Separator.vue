<template>
  <div :class="classes" :role="decorative ? undefined : 'separator'" :aria-orientation="ariaOrientation" />
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { SeparatorOrientation } from './index'

const props = withDefaults(
  defineProps<{
    orientation?: SeparatorOrientation
    /** A purely visual rule carries no role — a meaningful divide keeps it. */
    decorative?: boolean
  }>(),
  { orientation: 'horizontal', decorative: true },
)

// A horizontal separator's default a11y orientation is horizontal, so only a
// vertical one needs to say so; a decorative rule announces nothing at all.
const ariaOrientation = computed(() =>
  !props.decorative && props.orientation === 'vertical' ? 'vertical' : undefined,
)

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`orientation-${props.orientation}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  flex-shrink: 0;
  background-color: design.color(border);
}

.orientation-horizontal {
  width: 100%;
  height: 1px;
}

.orientation-vertical {
  align-self: stretch; // fill the cross axis of a flex row
  width: 1px;
}
</style>
