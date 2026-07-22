<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { BadgeVariant } from './index'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant
    /** `a` (or RouterLink) turns it into a link — that's what enables hover. */
    as?: string
  }>(),
  { variant: 'primary', as: 'span' },
)

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`variant-${props.variant}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/badge-variants';

.root {
  display: inline-flex;
  width: fit-content;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: design.spacing(1);
  border-radius: 9999px; // pill
  padding: design.spacing(0.5) design.spacing(2);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  white-space: nowrap;
  overflow: hidden;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  svg {
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
  }

  &:focus-visible {
    border-color: design.color(ring);
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }
}
</style>
