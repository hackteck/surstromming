<template>
  <ul :class="classes">
    <li
      v-for="(item, index) in items"
      :key="item.value"
      :ref="(row) => remember(item.value, row)"
      :class="rowClasses(item, index)"
      :style="rowStyle(index)"
    >
      <button
        type="button"
        :class="$style.handle"
        :aria-label="handleLabel"
        :aria-describedby="labelId(index)"
        @pointerdown="lift($event, index)"
        @pointermove="follow"
        @pointerup="letGo"
        @pointercancel="putBack"
        @lostpointercapture="putBack"
        @keydown="nudge($event, index)"
      >
        <!-- Six dots: the list's own furniture, as ScrollArea's carets are,
             so no icon set is needed to draw a grip. -->
        <svg :class="$style.grip" viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
          <circle cx="2.5" cy="3" r="1.5" />
          <circle cx="7.5" cy="3" r="1.5" />
          <circle cx="2.5" cy="8" r="1.5" />
          <circle cx="7.5" cy="8" r="1.5" />
          <circle cx="2.5" cy="13" r="1.5" />
          <circle cx="7.5" cy="13" r="1.5" />
        </svg>
      </button>
      <button type="button" :class="$style.item" :aria-current="ariaCurrent(item)" @click="emit('select', item.value)">
        <Icon v-if="item.icon" :icon="item.icon" :size="16" />
        <span :id="labelId(index)" :class="$style.label">{{ item.label }}</span>
      </button>
      <slot name="trailing" :item="item" :index="index" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onUpdated, ref, useCssModule, useId, watch } from 'vue'
import { Icon } from '@surstromming/icon'
import type { SortableListItem } from './index'

const props = withDefaults(
  defineProps<{
    items: SortableListItem[]
    /** The handle's accessible name, in the app's language. */
    handleLabel?: string
  }>(),
  { handleLabel: 'Drag to reorder' },
)
const emit = defineEmits<{
  select: [value: string]
  move: [value: string, to: number]
}>()

/** How long a row let go waits for the consumer's new order before the move is taken as refused. */
const REFUSED_AFTER_MS = 500

const STEPS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 }

/** A row carried by its handle, measured as the drag began. */
interface Carry {
  pointer: number
  from: number
  startY: number
  /** How far the pointer has gone up or down since it went down. */
  dy: number
  /** Each row's top and bottom, in the items' order. */
  tops: number[]
  bottoms: number[]
  /** How far the others move to make room: the carried row and the gap after it. */
  step: number
  to: number
  /** Let go, the rows hold where it was dropped until the consumer's order arrives. */
  dropped: boolean
}

const carry = ref<Carry | null>(null)
const rows = new Map<string, HTMLElement>()
let refused: ReturnType<typeof setTimeout> | undefined
/** The row the keys moved, whose handle takes the focus back in its new place. */
let refocus: string | null = null

const baseId = useId()
const labelId = (index: number) => `${baseId}-${index}`

const $style = useCssModule()
const classes = computed(() => [$style.root, { [$style.isSorting]: carry.value !== null }])

function rowClasses(item: SortableListItem, index: number) {
  return [$style.row, { [$style.isActive]: item.active, [$style.isDragged]: carry.value?.from === index }]
}

// The carried row follows the pointer; those it has passed slide aside to
// show where it would go.
function rowStyle(index: number) {
  const held = carry.value
  if (held === null) return undefined
  if (index === held.from) return { transform: `translateY(${held.dy}px)` }
  if (held.from < held.to && index > held.from && index <= held.to) return { transform: `translateY(${-held.step}px)` }
  if (held.to < held.from && index >= held.to && index < held.from) return { transform: `translateY(${held.step}px)` }
  return undefined
}

const ariaCurrent = (item: SortableListItem) => (item.active ? 'true' : undefined)

function remember(value: string, row: unknown) {
  if (row instanceof HTMLElement) rows.set(value, row)
  else rows.delete(value)
}

function lift(event: PointerEvent, index: number) {
  if (event.button !== 0 || carry.value !== null) return
  const handle = event.currentTarget as HTMLElement
  // No text selected along the way: the handle takes the focus itself, so
  // that Escape reaches it.
  event.preventDefault()
  handle.focus()
  try {
    handle.setPointerCapture(event.pointerId)
  } catch {
    // A scripted event has no live pointer to capture.
  }
  const boxes = props.items.map((item) => rows.get(item.value)?.getBoundingClientRect())
  if (boxes.some((box) => box === undefined)) return
  const measured = boxes as DOMRect[]
  const gap = measured.length > 1 ? measured[1].top - measured[0].bottom : 0
  clearTimeout(refused)
  carry.value = {
    pointer: event.pointerId,
    from: index,
    startY: event.clientY,
    dy: 0,
    tops: measured.map((box) => box.top),
    bottoms: measured.map((box) => box.bottom),
    step: measured[index].height + gap,
    to: index,
    dropped: false,
  }
}

/** Where the carried row's top would stand, dropped at place `to`: the others it passed slid aside. */
function slotTop(held: Carry, to: number) {
  const height = held.bottoms[held.from] - held.tops[held.from]
  return to > held.from ? held.bottoms[to] - height : held.tops[to]
}

// Its place is the one whose slot its middle is nearest, so a row of its
// height slides aside once it is carried half way into it, not only once it
// covers it.
function follow(event: PointerEvent) {
  const held = carry.value
  if (held === null || held.dropped || event.pointerId !== held.pointer) return
  const dy = event.clientY - held.startY
  const half = (held.bottoms[held.from] - held.tops[held.from]) / 2
  const middle = held.tops[held.from] + half + dy
  const away = (place: number) => Math.abs(slotTop(held, place) + half - middle)
  let to = held.from
  for (let place = 0; place < held.tops.length; place++) if (away(place) < away(to)) to = place
  carry.value = { ...held, dy, to }
}

function letGo(event: PointerEvent) {
  const held = carry.value
  if (held === null || held.dropped || event.pointerId !== held.pointer) return
  if (held.to === held.from) {
    carry.value = null
    return
  }
  // Held in the place it goes to, so nothing jumps back while the consumer's
  // order is on its way.
  carry.value = { ...held, dy: slotTop(held, held.to) - held.tops[held.from], dropped: true }
  refused = setTimeout(() => (carry.value = null), REFUSED_AFTER_MS)
  emit('move', props.items[held.from].value, held.to)
}

// A carry the browser took away, or Escape: the row goes back. One already
// let go waits for its order; the capture's end after a release is not a
// cancel.
function putBack(event?: PointerEvent) {
  const held = carry.value
  if (held === null || held.dropped || (event !== undefined && event.pointerId !== held.pointer)) return
  carry.value = null
}

function nudge(event: KeyboardEvent, index: number) {
  if (carry.value !== null) {
    // Escape puts back the row being carried, and nothing round it closes.
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      putBack()
    }
    return
  }
  const step = STEPS[event.key]
  if (step === undefined) return
  const to = index + step
  if (to < 0 || to >= props.items.length) return
  event.preventDefault()
  refocus = props.items[index].value
  emit('move', refocus, to)
}

// The consumer's items, in their new order or not: the rows stand as given.
watch(
  () => props.items,
  () => {
    clearTimeout(refused)
    carry.value = null
  },
)

// A node moved in the document loses the focus; the row the keys moved
// takes it back in its new place.
onUpdated(() => {
  if (refocus === null) return
  rows.get(refocus)?.querySelector('button')?.focus()
  refocus = null
})

onBeforeUnmount(() => clearTimeout(refused))
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: design.spacing(1);
  border-radius: design.radius(md);
}

// The others slide aside as a row passes them; the carried one follows the
// pointer as it moves.
.isSorting > .row {
  transition: transform 0.15s ease;
}

// Raised as the library's overlays are, edged as well as shadowed: on a dark
// theme a shadow alone is lost against the panel. A ring, not a border, so
// the row keeps its size as it is lifted.
.isDragged {
  z-index: 1;
  background-color: design.color(popover);
  box-shadow:
    0 0 0 1px design.color(border),
    design.shadow(md);
}

.isSorting > .isDragged {
  transition: none;
}

.handle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  // An icon button's square, as the row's own controls are: a finger aims
  // at it, and one that misses lands on the label and chooses the row.
  width: design.spacing(9);
  height: design.spacing(9);
  padding: 0;
  border-radius: design.radius(md);
  background-color: transparent;
  color: design.color(muted-foreground);
  cursor: grab;
  outline: none;
  // The handle's presses are the carry's, never a scroll's.
  touch-action: none;

  &:hover {
    color: design.color(foreground);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px design.color(ring);
  }

  .isDragged & {
    cursor: grabbing;
  }
}

.grip {
  fill: currentColor;
}

.item {
  display: flex;
  flex: 1;
  gap: design.spacing(2);
  align-items: center;
  min-width: 0;
  height: design.spacing(9);
  padding: 0 design.spacing(2);
  border-radius: design.radius(md);
  background-color: transparent;
  color: inherit;
  font-size: 0.875rem;
  text-align: start;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: design.color(accent);
    color: design.color(accent-foreground);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px design.color(ring);
  }

  svg {
    flex-shrink: 0;
    color: design.color(muted-foreground);
  }

  .isActive & {
    background-color: design.color(accent);
    color: design.color(accent-foreground);
    font-weight: 500;
  }
}

.label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .isSorting > .row {
    transition: none;
  }
}
</style>
