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
  transition: opacity 0.2s ease, visibility 0.2s;
}

.isVisible {
  opacity: 1;
  visibility: visible;
}

@media (prefers-reduced-motion: reduce) {
  .root {
    transition: none;
  }
}
</style>
