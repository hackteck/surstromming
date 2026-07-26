import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useResizeObserver } from './useResizeObserver'

/**
 * The measuring and tracking half of placing a teleported overlay against the
 * trigger it no longer descends from. Popover and Tooltip both sit on this; what
 * they *don't* share is the policy — Popover shifts and clips, Tooltip flips —
 * and that stays a `place` function each passes in.
 *
 * Everything here works in **layout coordinates**: the space a `position: fixed`
 * element is placed in, which is not the space a client rect is measured in. See
 * `visualOffset` for the one line where those two part company.
 */

export interface Rect {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

/** Kept clear of the edges when an overlay has to be shifted inwards. */
export const VIEWPORT_MARGIN = 8

// Probed by capability rather than by user agent, and cached: `CSS.supports`
// is cheap but this is read on every frame of a scroll.
let webkit: boolean | undefined
const isWebKit = () => (webkit ??= CSS.supports('-webkit-backdrop-filter', 'none'))

/**
 * What has to be added to a client rect to express it in layout coordinates.
 *
 * Pinch-zoom splits the viewport in two: the **layout** viewport keeps the size
 * the page was laid out at, and the **visual** viewport is the smaller window
 * the reader is looking through, panned around inside it. WebKit reports
 * `getBoundingClientRect()` against that visual window, while a `position:
 * fixed` element is still placed against the layout one — so a panel drawn at
 * the number its trigger measured lands `offsetLeft` away from it, which is off
 * screen entirely once someone has panned to the right of a zoomed page. Every
 * other engine measures against the layout viewport already and needs nothing.
 *
 * This is the correction `@floating-ui/dom` makes for the same case, arrived at
 * the same way; the probe is theirs too.
 */
const visualOffset = () => {
  const viewport = window.visualViewport
  return viewport && isWebKit() ? { x: viewport.offsetLeft, y: viewport.offsetTop } : { x: 0, y: 0 }
}

/** An element's box, in layout coordinates. */
export const rectOf = (element: Element): Rect => {
  const rect = element.getBoundingClientRect()
  const { x, y } = visualOffset()
  return {
    top: rect.top + y,
    right: rect.right + x,
    bottom: rect.bottom + y,
    left: rect.left + x,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * The layout viewport — the page's own box, which is what an overlay is kept
 * inside of.
 *
 * Deliberately **not** the visual viewport, even though that is the part the
 * reader can see. Keeping a panel inside the *page* is a layout question and
 * the answer holds still; keeping it inside the *screen* is a question whose
 * answer changes with every pinch and pan, and an overlay that re-answers it
 * slides out from under its trigger and crawls along the screen edge — chasing
 * the reader instead of staying on the thing it belongs to. It is the same
 * reason the axis that tracks the anchor is left unclamped: a panel pinned to
 * an edge while its trigger moves away is worse than one that leaves with it.
 * Zoomed in, page content that scrolls off the screen is simply panned back to,
 * and an anchored panel is page content.
 */
export const layoutViewport = (): Rect => {
  const { clientWidth, clientHeight } = document.documentElement
  return {
    top: 0,
    right: clientWidth,
    bottom: clientHeight,
    left: 0,
    width: clientWidth,
    height: clientHeight,
  }
}

/** Holds `start` inside `[from, to]`, leaving the margin at either edge. */
export const clamp = (start: number, size: number, from: number, to: number) => {
  const last = Math.max(from + VIEWPORT_MARGIN, to - size - VIEWPORT_MARGIN)
  return Math.min(Math.max(start, from + VIEWPORT_MARGIN), last)
}

export interface AnchoredOptions {
  /** Runs before the first measurement of each open, for state that lasts one. */
  onOpen?: () => void
}

export const useAnchored = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  floating: () => HTMLElement | undefined,
  open: Ref<boolean>,
  place: (anchor: Rect, floating: Size, bounds: Rect) => Record<string, string>,
  options: AnchoredOptions = {},
) => {
  const anchorRect = ref<Rect | null>(null)
  const bounds = ref<Rect>(layoutViewport())
  // `align: end` and `side: left` are a right or bottom edge, which only becomes
  // a left or top once the overlay's own size is known.
  const size = ref<Size>({ width: 0, height: 0 })

  const measure = () => {
    anchorRect.value = anchor.value ? rectOf(anchor.value) : null
    bounds.value = layoutViewport()
  }

  const measureFloating = () => {
    const element = floating()
    if (element) size.value = { width: element.offsetWidth, height: element.offsetHeight }
  }

  const { observe } = useResizeObserver(() => [floating()], measureFloating)

  const style = computed(() =>
    anchorRect.value ? place(anchorRect.value, size.value, bounds.value) : {},
  )

  // Vue would apply the new position on its next render tick — a frame late,
  // which reads as the overlay lagging behind and snapping back. Writing the
  // same values straight to the element removes that tick; the re-render then
  // sets what's already there.
  const track = () => {
    measure()
    const element = floating()
    if (element) Object.assign(element.style, style.value)
  }

  const stopTracking = () => {
    window.removeEventListener('scroll', track, true)
    window.removeEventListener('resize', track)
    // Pinch-zoom and the pan after it fire *neither* of the above, only these.
    // In layout coordinates they change nothing — which is the point — but on
    // WebKit both halves of the conversion move at once, and re-measuring when
    // the gesture settles is what re-converges a rect read mid-pinch.
    window.visualViewport?.removeEventListener('resize', track)
    window.visualViewport?.removeEventListener('scroll', track)
  }

  const startTracking = () => {
    options.onOpen?.()
    measure()
    // The overlay only exists while open, so it can only be measured — and
    // observed — once it's in the DOM. `nextTick` lands before paint, so the
    // placed position is the first one drawn, not a correction after it.
    nextTick(() => {
      measureFloating()
      observe()
    })

    // Capture: a scroll in *any* ancestor moves the trigger, scroll events
    // don't bubble, and a fixed overlay doesn't follow on its own.
    window.addEventListener('scroll', track, true)
    window.addEventListener('resize', track)
    window.visualViewport?.addEventListener('resize', track)
    window.visualViewport?.addEventListener('scroll', track)
  }

  watch(open, (isOpen) => {
    if (isOpen) startTracking()
    else stopTracking()
  })

  // An overlay can be handed `open: true` from the start. The watcher above
  // can't catch that (there's no change to react to), and an unmeasured overlay
  // has no position at all — it lands in the body's flow, unstacked.
  onMounted(() => {
    if (open.value) startTracking()
  })

  onBeforeUnmount(stopTracking)

  // The measurements are handed back as well as fed to `place`: a policy that
  // has a second question to answer about them — which side a tip ended up on —
  // asks it in a computed of its own rather than writing to a ref from inside
  // this one, which would be a side effect in the middle of a render.
  return { style, measure, anchorRect, size, bounds }
}
