<template>
  <div :class="classes" role="group">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { ButtonGroupOrientation } from './index'

const props = withDefaults(defineProps<{ orientation?: ButtonGroupOrientation }>(), {
  orientation: 'horizontal',
})

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`orientation-${props.orientation}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: inline-flex;

  // The children are whole components (Button, a Select trigger), whose class
  // names are hashed and unreachable from here — so the group reaches them as
  // elements. Every rule below is written with *both* root classes, because a
  // single one only ties with Button's own `border-radius` and the winner would
  // come down to which package's CSS was injected last.
  > * {
    position: relative; // so a focus ring can be raised above its neighbour
  }

  // A ring drawn on the seam would be half-covered by the next button.
  > *:hover,
  > *:focus-within {
    z-index: 1;
  }
}

// Buttons meet flush: the inner corners square off and the shared edge is drawn
// once, not twice.
//
// Each rule reaches one level deeper than the direct child, because a child
// isn't always the button itself — `DropdownMenu` hands over `Popover`'s
// measuring wrapper with the trigger inside it. One level is the whole set of
// cases here; anything deeper is a layout the group has no business restyling.
.orientation-horizontal {
  flex-direction: row;

  &.root > *,
  &.root > * > :is(button, a) {
    border-radius: 0;
  }

  &.root > *:not(:first-child) {
    margin-left: -1px;
  }

  &.root > *:first-child,
  &.root > *:first-child > :is(button, a) {
    border-top-left-radius: design.radius(md);
    border-bottom-left-radius: design.radius(md);
  }

  &.root > *:last-child,
  &.root > *:last-child > :is(button, a) {
    border-top-right-radius: design.radius(md);
    border-bottom-right-radius: design.radius(md);
  }
}

.orientation-vertical {
  flex-direction: column;
  align-items: stretch;

  &.root > *,
  &.root > * > :is(button, a) {
    border-radius: 0;
  }

  &.root > *:not(:first-child) {
    margin-top: -1px;
  }

  &.root > *:first-child,
  &.root > *:first-child > :is(button, a) {
    border-top-left-radius: design.radius(md);
    border-top-right-radius: design.radius(md);
  }

  &.root > *:last-child,
  &.root > *:last-child > :is(button, a) {
    border-bottom-left-radius: design.radius(md);
    border-bottom-right-radius: design.radius(md);
  }
}
</style>
