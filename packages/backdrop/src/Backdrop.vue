<template>
  <Teleport to="body">
    <div :class="classes" v-bind="$attrs" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { BackdropLayer } from './index'

// Teleported root: attrs (@click, class, aria-*) go to the overlay element.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{ visible?: boolean; layer?: BackdropLayer }>(), {
  layer: 'backdrop',
})

const $style = useCssModule()
const classes = computed(() => [
  $style.root,
  $style[`layer-${props.layer}`],
  { [$style.isVisible]: props.visible },
])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/backdrop-layers';

.root {
  position: fixed;
  inset: 0;
  background-color: color-mix(in oklab, black 50%, transparent);
  // Black at 50% alone barely separates a dark panel from a dark page — the
  // blur is what actually pushes the page behind the glass, so the eye lands
  // on what's on top of it.
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden; // fully out of the way when faded out
  // Deliberately outside the transition below. `visibility` interpolates as a
  // step that holds `visible` for the *whole* duration and flips only at the
  // end — which is exactly what lets the scrim fade out instead of vanishing,
  // and also what left it hit-testable at 3% opacity, 190ms after it stopped
  // being wanted. A full-viewport `inset: 0` element then swallows every press
  // on the page: close a drawer, reach for the control beside it, and the tap
  // goes nowhere at all. `pointer-events` carries no transition, so dropping
  // the class stops it capturing on the very frame the close begins, while the
  // fade plays out behind it.
  pointer-events: none;
  transition: opacity 0.2s ease, visibility 0.2s;
}

.isVisible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto; // the scrim is the click target that closes what it dims
}

@media (prefers-reduced-motion: reduce) {
  .root {
    transition: none;
  }
}
</style>
