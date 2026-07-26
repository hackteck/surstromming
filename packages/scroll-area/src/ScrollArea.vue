<template>
  <component
    :is="as"
    :class="$style.root"
    @pointerenter="onPointerEnter"
    @pointerleave="hovering = false"
  >
    <div ref="viewport" :class="viewportClasses" @scroll="onScroll">
      <slot />
    </div>

    <!-- One bar per painted axis — there when there's something to scroll, and
         then it stays. Each sits in a grid track of its own, so the space it
         takes is the gutter, and it reports its axis for the wheel rule. -->
    <ScrollBar
      v-if="showsVerticalBar"
      axis="vertical"
      :viewport="viewport"
      :auto-hide="autoHide"
      :active="active"
      @scrollable="scrollsVertically = $event"
    />

    <ScrollBar
      v-if="showsHorizontalBar"
      axis="horizontal"
      :viewport="viewport"
      :auto-hide="autoHide"
      :active="active"
      @scrollable="scrollsHorizontally = $event"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useCssModule, useTemplateRef } from 'vue'
import ScrollBar from './ScrollBar.vue'
import type { ScrollAreaOrientation } from './index'

const props = withDefaults(
  defineProps<{
    /** Root element — `main` makes the page itself the scroller. */
    as?: string
    /**
     * Which axes may scroll, and so which bars can appear. Both, by default —
     * a bar is only ever there when its own axis actually overflows, so naming
     * an axis is about *forbidding* the other one, not about asking for a bar.
     */
    orientation?: ScrollAreaOrientation
    /**
     * Float the bar over the content and fade it out when idle, instead of
     * keeping it parked in a gutter of its own.
     */
    autoHide?: boolean
  }>(),
  { as: 'div', orientation: 'both', autoHide: false },
)

/** How long an auto-hiding bar stays up after the last scroll. */
const IDLE_DELAY = 800

const viewport = useTemplateRef<HTMLElement>('viewport')

const showsVerticalBar = computed(() => props.orientation !== 'horizontal')
const showsHorizontalBar = computed(() => props.orientation !== 'vertical')

// Reported by the bars: each one knows whether its own axis overflows, and the
// wheel rule below is the only thing out here that has to care.
const scrollsVertically = ref(false)
const scrollsHorizontally = ref(false)

const hovering = ref(false)
const scrolling = ref(false)
const active = computed(() => hovering.value || scrolling.value)

/**
 * **A touch is not a hover**, and taking it for one cost a whole app its taps.
 *
 * iOS fires `pointerenter` for a finger, on every tap. With `autoHide` that
 * flipped an idle bar to visible *during* the gesture — `.isHidden` drops
 * `pointer-events: none`, so a full-height strip appears over the content
 * between the finger going down and coming up. WebKit re-hit-tests at
 * `touchend` to synthesize the click, finds the layer under the finger has
 * changed, and quietly declines: no `mousedown`, no `mouseup`, no `click`.
 * Every button inside the scroller stopped working, on a phone only, and
 * intermittently — a bar already up because you'd just scrolled left nothing to
 * change, and the tap went through.
 *
 * Mouse and pen only, then. A touch scroller still shows its bar while it
 * scrolls, which is the whole of what an overlay bar is for.
 */
const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType !== 'touch') hovering.value = true
}

let idleTimer: number | undefined
// Measuring is each bar's own business; this is only about waking an idle one.
const onScroll = () => {
  if (!props.autoHide) return
  scrolling.value = true
  clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    scrolling.value = false
  }, IDLE_DELAY)
}

onBeforeUnmount(() => clearTimeout(idleTimer))

const $style = useCssModule()
const viewportClasses = computed(() => [
  $style.viewport,
  $style[`orientation-${props.orientation}`],
  {
    [$style.isScrollableY]: scrollsVertically.value,
    [$style.isScrollableX]: scrollsHorizontally.value,
  },
])
</script>

<style module lang="scss">
// Nothing here draws — the paint and the tokens are the bar's, and the grid
// below is all this element is.
//
// A grid with a track per bar: the viewport takes what's left, and a bar that
// isn't showing collapses its `auto` track back to nothing — which is also what
// leaves the corner empty when both are out. The space a bar takes *is* its
// gutter; padding can't do this job, since padding at the end of the content
// still lets the content scroll under a bar sitting on the bottom edge.
//
// `1fr` plus `min-*: 0` on the viewport is what makes it work from a fixed
// height *and* from a max-height (a popover panel): the row shrinks to what's
// available, and the viewport is allowed to shrink below its content.
.root {
  position: relative; // an auto-hiding bar leaves the grid and floats in here
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  overflow: hidden;
}

// The native bar is hidden, not removed — the element still scrolls with the
// wheel, the keyboard and a trackpad; only the painting is ours.
.viewport {
  grid-row: 1;
  grid-column: 1;
  min-width: 0;
  min-height: 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

// Both axes are stated, always: leaving one `visible` makes the browser promote
// it to `auto`, and an axis that scrolls without a bar of ours scrolls behind
// the hidden native one instead.
.orientation-vertical {
  overflow-x: hidden;
  overflow-y: auto;
}

.orientation-horizontal {
  overflow-x: auto;
  overflow-y: hidden;
}

.orientation-both {
  overflow: auto;
}

// Only on an axis that really scrolls, and only that axis. On one with nothing
// to scroll, `contain` still swallows the wheel instead of letting it reach an
// ancestor that could have used it — a silently dead scroll wherever the height
// didn't come through.
.isScrollableY {
  overscroll-behavior-y: contain;
}

.isScrollableX {
  overscroll-behavior-x: contain;
}

// The one case the painted bar must not win: forced colors (Windows high
// contrast) replaces our tokens wholesale, and the OS bar is what the user
// asked for. Hand scrolling back to the browser rather than paint over it; the
// space comes back on its own, since the hidden bars collapse their tracks.
@media (forced-colors: active) {
  .viewport {
    scrollbar-width: auto;

    &::-webkit-scrollbar {
      display: initial;
    }
  }
}
</style>
