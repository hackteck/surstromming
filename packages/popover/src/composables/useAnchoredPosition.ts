import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useResizeObserver } from '@surstromming/util'
import type { PopoverAlign, PopoverSide } from '../index'

/** Kept clear of the viewport edges when a panel has to be shifted inwards. */
const VIEWPORT_MARGIN = 8

export interface AnchoredPlacement {
  side: PopoverSide
  align: PopoverAlign
}

/**
 * Places a teleported panel against an anchor it no longer descends from.
 *
 * Everything here exists because the panel lives on `<body>`: CSS can't reach
 * the anchor, so the coordinates are measured and re-measured — on any ancestor
 * scrolling, on resize, and whenever the panel's own size changes.
 *
 * It **shifts, it never flips**. The panel is clamped into the viewport along
 * the axis its alignment runs on, so `align: end` on an anchor near the left
 * edge can't push it off screen. The other axis is left alone on purpose: that
 * one tracks the anchor, and clamping it would pin the panel to the top of the
 * screen while the thing it belongs to scrolls away underneath.
 *
 * As the anchor scrolls away the panel goes with it and is **clipped** at the
 * edges of the area the anchor is visible in — the viewport narrowed by its
 * scrolling ancestors, each one only on the axis it actually scrolls. So it
 * slides under the app's chrome rather than over it, and rather than blinking
 * out of existence, while a menu opened inside the sidebar still escapes it
 * sideways. The viewport alone isn't enough for that boundary: an anchor
 * sliding *behind* a sticky header is still inside it.
 */
export const useAnchoredPosition = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  panelElement: () => HTMLElement | undefined,
  placement: () => AnchoredPlacement,
  open: Ref<boolean>,
) => {
  const anchorRect = ref<DOMRect | null>(null)
  // The area the anchor is actually allowed to be seen in — the viewport
  // narrowed by every scrolling ancestor. The app shell's `main` starts below
  // the sticky header, which is what keeps a panel off it.
  const clipRect = ref({ top: 0, right: 0, bottom: 0, left: 0 })

  // The chain can't change while the panel is open, so it's collected once and
  // only the rects are re-read per scroll — `getComputedStyle` is too heavy to
  // call on every frame of one.
  let clippers: HTMLElement[] = []

  const collectClippers = () => {
    clippers = []
    let element = anchor.value?.parentElement
    while (element) {
      const { overflow, overflowX, overflowY } = getComputedStyle(element)
      // Anything but `visible` clips: hidden, clip, auto and scroll alike.
      if (/hidden|clip|auto|scroll/.test(overflow + overflowX + overflowY)) {
        clippers.push(element)
      }
      element = element.parentElement
    }
  }

  // Only the axis a container actually *scrolls* on. That's the axis the anchor
  // can slide out of view along, and so the only one worth cutting the panel at
  // — clipping the other one is what stops a menu escaping the sidebar it was
  // opened in, which is the whole reason the panel is teleported.
  // `align: end` and `side: left` are expressed as a right/bottom edge, which
  // only becomes a left/top once the panel's own size is known.
  const panelSize = ref({ width: 0, height: 0 })

  const measure = () => {
    anchorRect.value = anchor.value?.getBoundingClientRect() ?? null

    let clip = { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 }
    for (const element of clippers) {
      const rect = element.getBoundingClientRect()
      if (element.scrollHeight > element.clientHeight) {
        clip.top = Math.max(clip.top, rect.top)
        clip.bottom = Math.min(clip.bottom, rect.bottom)
      }
      if (element.scrollWidth > element.clientWidth) {
        clip.left = Math.max(clip.left, rect.left)
        clip.right = Math.min(clip.right, rect.right)
      }
    }
    clipRect.value = clip
  }

  const measurePanel = () => {
    const element = panelElement()
    if (element) panelSize.value = { width: element.offsetWidth, height: element.offsetHeight }
  }

  const { observe } = useResizeObserver(() => [panelElement()], measurePanel)

  const clamp = (start: number, size: number, limit: number) => {
    const last = Math.max(VIEWPORT_MARGIN, limit - size - VIEWPORT_MARGIN)
    return Math.min(Math.max(start, VIEWPORT_MARGIN), last)
  }

  // Cuts the panel off at the edges of the area its anchor lives in, so it
  // slides *under* the app's chrome instead of over it — the same thing a panel
  // that wasn't teleported would do inside that scroll container. `undefined`
  // while nothing needs cutting: `clip-path` makes a containing block, and
  // there's no reason to pay for one on every open popover.
  const clipPathFor = (
    x: number,
    y: number,
    panelWidth: number,
    panelHeight: number,
    clip: { top: number; right: number; bottom: number; left: number },
  ) => {
    const top = Math.max(0, clip.top - y)
    const right = Math.max(0, x + panelWidth - clip.right)
    const bottom = Math.max(0, y + panelHeight - clip.bottom)
    const left = Math.max(0, clip.left - x)
    if (!top && !right && !bottom && !left) return ''
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`
  }

  const style = computed(() => {
    const rect = anchorRect.value
    if (!rect) return {}

    const { side, align } = placement()
    const { width, height } = panelSize.value

    const clip = clipRect.value

    // `position` is inline because as a class it would race ScrollArea's own
    // `position: relative` on the same element, and cross-package rule order is
    // not something to bet the placement on. Stacking is a class — see
    // `.layer-*` in Popover.vue.
    //
    // Parked at the origin and moved by `transform`, never by `top`/`left`: an
    // inset offset is *also* the space a shrink-to-fit box has left to grow
    // into, so a panel placed 374px along measured 56px wide, which moved it
    // left, which let it grow, which moved it again — a loop the ResizeObserver
    // walked one frame at a time, and it read as the menu sliding out from
    // under its own trigger. From the origin the width is settled before the
    // position is ever applied.
    const base = { position: 'fixed', top: '0px', left: '0px' }

    if (side === 'bottom') {
      const left = align === 'start' ? rect.left : rect.right - width
      const top = rect.bottom
      const x = clamp(left, width, window.innerWidth)
      return {
        ...base,
        // `top` follows the anchor, all the way out.
        transform: `translate(${x}px, ${top}px)`,
        minWidth: `${rect.width}px`, // never narrower than what it's anchored to
        clipPath: clipPathFor(x, top, width, height, clip),
      }
    }

    const x = side === 'right' ? rect.right : rect.left - width
    const y = clamp(align === 'start' ? rect.top : rect.bottom - height, height, window.innerHeight)
    return {
      ...base,
      transform: `translate(${x}px, ${y}px)`,
      clipPath: clipPathFor(x, y, width, height, clip),
    }
  })

  // Vue would apply the new position on its next render tick — a frame late,
  // which reads as the panel lagging behind and snapping back. Writing the same
  // values straight to the element inside the scroll handler removes that tick;
  // the re-render then sets what's already there.
  const track = () => {
    measure()
    const element = panelElement()
    if (element) Object.assign(element.style, style.value)
  }

  const stopTracking = () => {
    window.removeEventListener('scroll', track, true)
    window.removeEventListener('resize', track)
  }

  const startTracking = () => {
    collectClippers()
    measure()
    // The panel only exists while open, so it can only be measured — and
    // observed — once it's in the DOM. `nextTick` lands before paint, so the
    // clamped position is the first one drawn, not a correction after it.
    nextTick(() => {
      measurePanel()
      observe()
    })

    // Capture: a scroll in *any* ancestor moves the anchor, scroll events don't
    // bubble, and a fixed panel doesn't follow on its own.
    window.addEventListener('scroll', track, true)
    window.addEventListener('resize', track)
  }

  watch(open, (isOpen) => {
    if (isOpen) startTracking()
    else stopTracking()
  })

  // A popover can be handed `open: true` from the start. The watcher above
  // can't catch that (there's no change to react to), and an unmeasured panel
  // has no position at all — it lands in the body's flow, unstacked.
  onMounted(() => {
    if (open.value) startTracking()
  })

  onBeforeUnmount(stopTracking)

  return { style, measure }
}
