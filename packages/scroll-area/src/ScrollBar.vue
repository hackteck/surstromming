<template>
  <div :class="classes" aria-hidden="true">
    <button :class="$style.arrow" type="button" tabindex="-1" @pointerdown="startStepping(-1)">
      <svg :class="[$style.caret, $style.caretStart]" viewBox="0 0 12 9" width="12" height="9">
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
      <svg :class="[$style.caret, $style.caretEnd]" viewBox="0 0 12 9" width="12" height="9">
        <path d="M6 2.5 9.5 7H2.5Z" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useCssModule, useTemplateRef, watch } from 'vue'
import { useScrollMetrics } from './composables/useScrollMetrics'
import type { ScrollAxis } from './index'

// Private to the package: ScrollArea owns the viewport and hands one of these
// to each axis it paints. Everything below is written once and runs either way.
const props = defineProps<{
  axis: ScrollAxis
  /** The element that actually scrolls. Null until ScrollArea has mounted it. */
  viewport: HTMLElement | null
  /** Float over the content and fade out when idle. */
  autoHide: boolean
  /** The pointer is over the area, or it's being scrolled — wake an idle bar. */
  active: boolean
}>()

const emit = defineEmits<{ scrollable: [boolean] }>()

/** One arrow click, in pixels — roughly a text line, as in a browser. */
const STEP = 40
const REPEAT_DELAY = 300
const REPEAT_INTERVAL = 60

const horizontal = props.axis === 'horizontal'

const viewport = computed(() => props.viewport)
const track = useTemplateRef<HTMLElement>('track')

const { measure, scrollable, maxScroll, thumbLength, thumbTravel, thumbOffset } = useScrollMetrics(
  viewport,
  track,
  props.axis,
)

// The space is this bar's own to take or give back, but the rule that keeps a
// dead axis from swallowing the wheel sits on the viewport — so ScrollArea has
// to hear when this axis starts and stops overflowing.
watch(scrollable, (value) => emit('scrollable', value))

const thumbStyle = computed(() =>
  horizontal
    ? { width: `${thumbLength.value}px`, transform: `translateX(${thumbOffset.value}px)` }
    : { height: `${thumbLength.value}px`, transform: `translateY(${thumbOffset.value}px)` },
)

const dragging = ref(false)

// Only an auto-hiding bar can be invisible; otherwise it's simply always there
// once there's something to scroll.
const visible = computed(
  () => scrollable.value && (!props.autoHide || props.active || dragging.value),
)

const pointerOffset = (event: PointerEvent) => (horizontal ? event.clientX : event.clientY)

/** Where the track starts, in viewport coordinates. */
const trackStart = () => {
  const rect = track.value?.getBoundingClientRect()
  if (!rect) return 0
  return horizontal ? rect.left : rect.top
}

const scrollBy = (distance: number, behavior: ScrollBehavior = 'auto') => {
  props.viewport?.scrollBy(horizontal ? { left: distance, behavior } : { top: distance, behavior })
}

// Grabbing the thumb anywhere must not jump it under the cursor, so remember
// where inside it the drag started.
let grabOffset = 0

const startDragging = (event: PointerEvent) => {
  measure()
  grabOffset = pointerOffset(event) - trackStart() - thumbOffset.value
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const drag = (event: PointerEvent) => {
  const element = props.viewport
  if (!dragging.value || thumbTravel.value === 0 || !element) return
  const position = pointerOffset(event) - trackStart() - grabOffset
  const clamped = Math.min(Math.max(position, 0), thumbTravel.value)
  const scroll = (clamped / thumbTravel.value) * maxScroll.value
  if (horizontal) element.scrollLeft = scroll
  else element.scrollTop = scroll
}

// pointercancel too: a browser gesture (a touch turning into a page swipe) ends
// the pointer without ever sending pointerup, and the thumb would stay stuck.
const stopDragging = () => {
  dragging.value = false
}

/** Clicking the track past the thumb moves one viewport that way. */
const pageTowards = (event: PointerEvent) => {
  const element = props.viewport
  if (!element) return
  const direction = pointerOffset(event) < trackStart() + thumbOffset.value ? -1 : 1
  scrollBy(direction * (horizontal ? element.clientWidth : element.clientHeight), 'smooth')
}

let repeatDelay: number | undefined
let repeatInterval: number | undefined

const stopStepping = () => {
  clearTimeout(repeatDelay)
  clearInterval(repeatInterval)
}

// Press-and-hold repeats, the way a native arrow button does.
const startStepping = (direction: number) => {
  const step = () => scrollBy(direction * STEP)
  step()
  repeatDelay = window.setTimeout(() => {
    repeatInterval = window.setInterval(step, REPEAT_INTERVAL)
  }, REPEAT_DELAY)
  window.addEventListener('pointerup', stopStepping, { once: true })
}

onBeforeUnmount(() => {
  stopStepping()
  window.removeEventListener('pointerup', stopStepping)
  emit('scrollable', false) // a bar that leaves takes its axis's rules with it
})

const $style = useCssModule()
const classes = computed(() => [
  $style.root,
  $style[`axis-${props.axis}`],
  { [$style.isFloating]: props.autoHide, [$style.isHidden]: !visible.value },
])
const thumbClasses = computed(() => [$style.thumb, { [$style.isDragging]: dragging.value }])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// How thick the bar is, and so how much of ScrollArea's grid it takes.
$thickness: design.spacing(4.5);

.root {
  display: flex;
  overflow: hidden; // nothing sticks out of a collapsed bar
  transition: opacity 0.2s ease;
}

// A track of ScrollArea's grid each, which is what keeps them out of each
// other's corner and the content out from under both.
.axis-vertical {
  grid-row: 1;
  grid-column: 2;
  flex-direction: column;
  width: $thickness;
}

.axis-horizontal {
  grid-row: 2;
  grid-column: 1;
  flex-direction: row;
  height: $thickness;
}

// Still in the DOM while it's out of sight — its track has to stay measurable —
// but flat, so the grid gives the space back. Unclickable too: the content
// underneath is what the pointer is aiming at.
.isHidden {
  opacity: 0;
  pointer-events: none;
}

.axis-vertical.isHidden {
  width: 0;
}

.axis-horizontal.isHidden {
  height: 0;
}

// autoHide floats it over the content instead of beside it: out of the grid, so
// it takes no track at all, and with a wash to stay readable over what it
// covers. After the collapsing rules — a floating bar keeps its size, visible or
// not, since it costs the layout nothing either way.
.isFloating {
  position: absolute;
  background-color: design.with-alpha(background, 85%);
}

.isFloating.axis-vertical {
  top: 0;
  right: 0;
  bottom: 0;
  width: $thickness;
}

.isFloating.axis-horizontal {
  right: 0;
  bottom: 0;
  left: 0;
  height: $thickness;
}

.arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: $thickness;
  height: $thickness;
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

// One triangle, drawn pointing up and turned towards the end it scrolls to. The
// rotation is CSS on the element, so the 12×9 box turns with it and nothing clips.
.axis-vertical .caretEnd {
  transform: rotate(180deg);
}

.axis-horizontal .caretStart {
  transform: rotate(-90deg);
}

.axis-horizontal .caretEnd {
  transform: rotate(90deg);
}

.track {
  position: relative;
  flex: 1;
}

// Centred across the bar and thinner than it: the bar is the hit area, the
// thumb is the mark.
.thumb {
  position: absolute;
  border-radius: 999px;
  background-color: design.with-alpha(foreground, 45%);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: design.with-alpha(foreground, 60%);
  }
}

.axis-vertical .thumb {
  top: 0;
  right: 0;
  left: 0;
  width: design.spacing(2.25);
  margin-inline: auto;
}

.axis-horizontal .thumb {
  top: 0;
  bottom: 0;
  left: 0;
  height: design.spacing(2.25);
  margin-block: auto;
}

.isDragging {
  background-color: design.with-alpha(foreground, 75%);
}

// The one case the painted bar must not win: forced colors (Windows high
// contrast) replaces our tokens wholesale, and the OS bar is what the user
// asked for. ScrollArea hands scrolling back to the browser; this gets out of
// the way rather than painting over it.
@media (forced-colors: active) {
  .root {
    display: none;
  }
}
</style>
