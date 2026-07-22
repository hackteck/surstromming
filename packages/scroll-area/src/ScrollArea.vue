<template>
  <component
    :is="as"
    :class="$style.root"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
  >
    <div ref="viewport" :class="viewportClasses" @scroll="onScroll">
      <slot />
    </div>

    <!-- Only here when there's something to scroll, and then it stays — a
         browser scrollbar, drawn by us: an arrow at each end, a draggable
         thumb between, and a track you can page on. -->
    <div v-if="scrollable" :class="barClasses" aria-hidden="true">
      <button :class="$style.arrow" type="button" tabindex="-1" @pointerdown="startStepping(-1)">
        <svg :class="$style.caret" viewBox="0 0 12 9" width="12" height="9">
          <path d="M6 2.5 9.5 7H2.5Z" /></svg>
      </button>

      <div ref="track" :class="$style.track" @pointerdown="pageTowards">
        <div
          :class="thumbClasses"
          :style="thumbStyle"
          @pointerdown.stop="startDragging"
          @pointermove="drag"
          @pointerup="stopDragging"
          @pointercancel="stopDragging"
        />
      </div>

      <button :class="$style.arrow" type="button" tabindex="-1" @pointerdown="startStepping(1)">
        <svg :class="[$style.caret, $style.caretDown]" viewBox="0 0 12 9" width="12" height="9">
          <path d="M6 2.5 9.5 7H2.5Z" /></svg>
      </button>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useCssModule, useTemplateRef } from 'vue'
import { useScrollMetrics } from './composables/useScrollMetrics'

const props = withDefaults(
  defineProps<{
    /** Root element — `main` makes the page itself the scroller. */
    as?: string
    /**
     * Float the bar over the content and fade it out when idle, instead of
     * keeping it parked in a gutter of its own.
     */
    autoHide?: boolean
  }>(),
  { as: 'div', autoHide: false },
)

/** One arrow click, in pixels — roughly a text line, as in a browser. */
const STEP = 40
const REPEAT_DELAY = 300
const REPEAT_INTERVAL = 60
/** How long an auto-hiding bar stays up after the last scroll. */
const IDLE_DELAY = 800

const viewport = useTemplateRef<HTMLElement>('viewport')
const track = useTemplateRef<HTMLElement>('track')

const { measure, scrollable, maxScroll, thumbHeight, thumbTravel, thumbTop } = useScrollMetrics(
  viewport,
  track,
)

const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translateY(${thumbTop.value}px)`,
}))

const dragging = ref(false)
const hovering = ref(false)
const scrolling = ref(false)

let idleTimer: number | undefined
const onScroll = () => {
  measure()
  if (!props.autoHide) return
  scrolling.value = true
  clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    scrolling.value = false
  }, IDLE_DELAY)
}

// Only an auto-hiding bar can be invisible; otherwise it's simply always there.
const visible = computed(
  () => !props.autoHide || hovering.value || dragging.value || scrolling.value,
)

// Grabbing the thumb anywhere must not jump it under the cursor, so remember
// where inside it the drag started.
let grabOffset = 0

const startDragging = (event: PointerEvent) => {
  measure()
  const trackTop = track.value?.getBoundingClientRect().top ?? 0
  grabOffset = event.clientY - trackTop - thumbTop.value
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const drag = (event: PointerEvent) => {
  if (!dragging.value || thumbTravel.value === 0) return
  const trackTop = track.value?.getBoundingClientRect().top ?? 0
  const top = event.clientY - trackTop - grabOffset
  const clamped = Math.min(Math.max(top, 0), thumbTravel.value)
  if (viewport.value) viewport.value.scrollTop = (clamped / thumbTravel.value) * maxScroll.value
}

// pointercancel too: a browser gesture (a touch turning into a page swipe) ends
// the pointer without ever sending pointerup, and the thumb would stay stuck.
const stopDragging = () => {
  dragging.value = false
}

/** Clicking the track above or below the thumb moves one viewport that way. */
const pageTowards = (event: PointerEvent) => {
  const trackTop = track.value?.getBoundingClientRect().top ?? 0
  const direction = event.clientY < trackTop + thumbTop.value ? -1 : 1
  viewport.value?.scrollBy({ top: direction * (viewport.value?.clientHeight ?? 0), behavior: 'smooth' })
}

let repeatDelay: number | undefined
let repeatInterval: number | undefined

const stopStepping = () => {
  clearTimeout(repeatDelay)
  clearInterval(repeatInterval)
}

// Press-and-hold repeats, the way a native arrow button does.
const startStepping = (direction: number) => {
  const step = () => viewport.value?.scrollBy({ top: direction * STEP })
  step()
  repeatDelay = window.setTimeout(() => {
    repeatInterval = window.setInterval(step, REPEAT_INTERVAL)
  }, REPEAT_DELAY)
  window.addEventListener('pointerup', stopStepping, { once: true })
}

onBeforeUnmount(() => {
  clearTimeout(idleTimer)
  stopStepping()
  window.removeEventListener('pointerup', stopStepping)
})

const $style = useCssModule()
// The gutter is the parked bar's; an auto-hiding one floats over the content.
const viewportClasses = computed(() => [
  $style.viewport,
  {
    [$style.isScrollable]: scrollable.value,
    [$style.hasGutter]: scrollable.value && !props.autoHide,
  },
])
const barClasses = computed(() => [
  $style.bar,
  { [$style.isFloating]: props.autoHide, [$style.isHidden]: !visible.value },
])
const thumbClasses = computed(() => [$style.thumb, { [$style.isDragging]: dragging.value }])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// A flex column so the viewport works from a fixed height *and* from a
// max-height (a popover panel): flex shrinks it to what's available, and
// `min-height: 0` is what lets it shrink below its content.
.root {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// The native bar is hidden, not removed — the element still scrolls with the
// wheel, the keyboard and a trackpad; only the painting is ours.
.viewport {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

// Only while it really scrolls. On a viewport with nothing to scroll,
// `contain` still swallows the wheel instead of letting it reach an ancestor
// that could have used it — a silently dead scroll wherever the height didn't
// come through.
.isScrollable {
  overscroll-behavior: contain;
}

// The bar is always there once there's something to scroll, so it gets a gutter
// of its own rather than covering the last line of every row — the same deal a
// classic browser scrollbar makes.
.hasGutter {
  padding-right: design.spacing(4.5);
}

// The one case the painted bar must not win: forced colors (Windows high
// contrast) replaces our tokens wholesale, and the OS bar is what the user
// asked for. Hand scrolling back to the browser rather than paint over it.
@media (forced-colors: active) {
  .viewport {
    scrollbar-width: auto;

    &::-webkit-scrollbar {
      display: initial;
    }
  }

  .bar {
    display: none;
  }
}

.bar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: design.spacing(4.5);
  transition: opacity 0.2s ease;
}

// Floating over the content instead of beside it, so it needs a wash to stay
// readable over whatever it covers.
.isFloating {
  background-color: design.with-alpha(background, 85%);
}

.isHidden {
  opacity: 0;
}

.arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: design.spacing(4.5);
  padding: 0;
  border: none;
  background: none;
  cursor: default;
}

// A filled triangle, as the native bar draws it — a stroked chevron reads as a
// link affordance at this size, and lucide has no solid caret. Stroking the
// path in its own fill colour with a round join is what rounds the corners.
.caret {
  flex-shrink: 0; // flexbox would otherwise squeeze it to a sliver
  // Opaque on purpose: fill and stroke overlap, so a translucent colour would
  // compound along the edge and draw a darker rim.
  fill: design.color(muted-foreground);
  stroke: design.color(muted-foreground);
  stroke-width: 2;
  stroke-linejoin: round;
  transition:
    fill 0.15s ease,
    stroke 0.15s ease;

  .arrow:hover & {
    fill: design.color(foreground);
    stroke: design.color(foreground);
  }
}

.caretDown {
  transform: rotate(180deg);
}

.track {
  position: relative;
  flex: 1;
}

// Centred in the bar and narrower than it: the bar is the hit area, the thumb
// is the mark.
.thumb {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  width: design.spacing(2.25);
  margin-inline: auto;
  border-radius: 999px;
  background-color: design.with-alpha(foreground, 45%);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: design.with-alpha(foreground, 60%);
  }
}

.isDragging {
  background-color: design.with-alpha(foreground, 75%);
}
</style>
