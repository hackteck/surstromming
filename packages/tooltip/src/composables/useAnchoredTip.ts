import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { TooltipSide } from '../index'

/** Distance between the trigger and the tip. */
const GAP = 6
/** Kept clear of the viewport edges when the tip has to be shifted inwards. */
const MARGIN = 8

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * Places a teleported tip against the trigger it no longer descends from.
 *
 * The tip lives on `<body>` because a tooltip that gets clipped is worse than
 * no tooltip: with the tip inside the trigger's own box, any `overflow`
 * ancestor cuts it — and every page in this library scrolls through a
 * `ScrollArea`, so a trigger near the top of one had its whole tip cut away.
 *
 * Unlike a popover this **flips**. A popover is a surface you work in, so it
 * shifts and stays on the side it was asked for; a tip is a label, and a label
 * that would land off-screen belongs on the other side of the thing it labels.
 * The cross axis is then clamped into the viewport.
 */
export const useAnchoredTip = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  tipElement: () => HTMLElement | undefined,
  preferred: () => TooltipSide,
  open: Ref<boolean>,
) => {
  const anchorRect = ref<DOMRect | null>(null)
  const tipSize = ref({ width: 0, height: 0 })

  const measure = () => {
    anchorRect.value = anchor.value?.getBoundingClientRect() ?? null
  }

  const measureTip = () => {
    const element = tipElement()
    if (element) tipSize.value = { width: element.offsetWidth, height: element.offsetHeight }
  }

  const clamp = (start: number, size: number, limit: number) => {
    const last = Math.max(MARGIN, limit - size - MARGIN)
    return Math.min(Math.max(start, MARGIN), last)
  }

  // The asked-for side wins whenever it fits. When it doesn't, the opposite one
  // is only better if *it* fits — otherwise flipping would just move the
  // problem, so the tip stays where the consumer put it.
  const side = computed<TooltipSide>(() => {
    const rect = anchorRect.value
    const want = preferred()
    if (!rect) return want

    const { width, height } = tipSize.value
    const fits: Record<TooltipSide, boolean> = {
      top: rect.top - height - GAP >= MARGIN,
      bottom: rect.bottom + height + GAP <= window.innerHeight - MARGIN,
      left: rect.left - width - GAP >= MARGIN,
      right: rect.right + width + GAP <= window.innerWidth - MARGIN,
    }
    return fits[want] || !fits[OPPOSITE[want]] ? want : OPPOSITE[want]
  })

  const style = computed(() => {
    const rect = anchorRect.value
    const { width, height } = tipSize.value
    // Rendered but not yet measured: park it out of sight rather than let a
    // frame of it land at the top-left corner.
    if (!rect || !width) return { position: 'fixed' as const, top: '0', left: '0', visibility: 'hidden' as const }

    if (side.value === 'top' || side.value === 'bottom') {
      const top = side.value === 'top' ? rect.top - height - GAP : rect.bottom + GAP
      const left = clamp(rect.left + rect.width / 2 - width / 2, width, window.innerWidth)
      return { position: 'fixed' as const, top: `${top}px`, left: `${left}px` }
    }

    const left = side.value === 'left' ? rect.left - width - GAP : rect.right + GAP
    const top = clamp(rect.top + rect.height / 2 - height / 2, height, window.innerHeight)
    return { position: 'fixed' as const, top: `${top}px`, left: `${left}px` }
  })

  // Any ancestor scrolling moves the trigger, and scroll events don't bubble —
  // hence capture. Writing straight to the element skips the render tick that
  // would otherwise show as the tip lagging a frame behind.
  const track = () => {
    measure()
    const element = tipElement()
    if (element) Object.assign(element.style, style.value)
  }

  const stopTracking = () => {
    window.removeEventListener('scroll', track, true)
    window.removeEventListener('resize', track)
  }

  const startTracking = () => {
    measure()
    // The tip only exists while open, so it can only be measured once it's in
    // the DOM. `nextTick` lands before paint, so the placed position is the
    // first one drawn rather than a correction after it.
    nextTick(measureTip)

    // Capture: a scroll in *any* ancestor moves the trigger, scroll events
    // don't bubble, and a fixed tip doesn't follow on its own.
    window.addEventListener('scroll', track, true)
    window.addEventListener('resize', track)
  }

  watch(open, (isOpen) => {
    if (isOpen) startTracking()
    else stopTracking()
  })

  // `v-model:open` can hand it `true` from the start; the watcher has no change
  // to react to, and an unmeasured tip has no position at all.
  onMounted(() => {
    if (open.value) startTracking()
  })

  onBeforeUnmount(stopTracking)

  return { style, side }
}
