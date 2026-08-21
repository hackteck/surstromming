import { useAnchored, clamp, rectOf, type Rect, type Size } from '@surstromming/util'
import type { Ref } from 'vue'
import type { PopoverAlign, PopoverSide } from '../index'

/**
 * Places a teleported panel against an anchor it no longer descends from.
 *
 * The measuring, the coordinate space and the tracking are `useAnchored`'s
 * (util) — shared with Tooltip, which has the same mechanics and the opposite
 * policy. What lives here is the policy.
 *
 * It **shifts, it never flips**. The panel is clamped into the visible viewport
 * along the axis its alignment runs on, so `align: end` on an anchor near the
 * left edge can't push it off screen. The other axis is left alone on purpose:
 * that one tracks the anchor, and clamping it would pin the panel to the top of
 * the screen while the thing it belongs to scrolls away underneath.
 *
 * Which is exactly why all four sides have to exist. Not flipping is a policy
 * about what the panel does once it is placed; it is not a reason to leave a
 * consumer unable to *say* `top`, and without that a control near the foot of
 * the screen has its panel cut off with no way out.
 *
 * As the anchor scrolls away the panel goes with it and is **clipped** at the
 * edges of the area the anchor is visible in — the viewport narrowed by its
 * scrolling ancestors, each one only on the axis it actually scrolls. So it
 * slides under the app's chrome rather than over it, and rather than blinking
 * out of existence, while a menu opened inside the sidebar still escapes it
 * sideways. The viewport alone isn't enough for that boundary: an anchor
 * sliding *behind* a sticky header is still inside it.
 */

export interface AnchoredPlacement {
  side: PopoverSide
  align: PopoverAlign
}

export const useAnchoredPosition = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  panelElement: () => HTMLElement | undefined,
  placement: () => AnchoredPlacement,
  open: Ref<boolean>,
) => {
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
  const clipArea = (bounds: Rect) => {
    const clip = { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left }
    for (const element of clippers) {
      const rect = rectOf(element)
      if (element.scrollHeight > element.clientHeight) {
        clip.top = Math.max(clip.top, rect.top)
        clip.bottom = Math.min(clip.bottom, rect.bottom)
      }
      if (element.scrollWidth > element.clientWidth) {
        clip.left = Math.max(clip.left, rect.left)
        clip.right = Math.min(clip.right, rect.right)
      }
    }
    return clip
  }

  // Cuts the panel off at the edges of the area its anchor lives in, so it
  // slides *under* the app's chrome instead of over it — the same thing a panel
  // that wasn't teleported would do inside that scroll container. Empty while
  // nothing needs cutting: `clip-path` makes a containing block, and there's no
  // reason to pay for one on every open popover.
  const clipPathFor = (x: number, y: number, panel: Size, bounds: Rect) => {
    const clip = clipArea(bounds)
    const top = Math.max(0, clip.top - y)
    const right = Math.max(0, x + panel.width - clip.right)
    const bottom = Math.max(0, y + panel.height - clip.bottom)
    const left = Math.max(0, clip.left - x)
    if (!top && !right && !bottom && !left) return ''
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`
  }

  const place = (rect: Rect, panel: Size, bounds: Rect) => {
    const { side, align } = placement()

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

    // The horizontal pair. `top` is the mirror of `bottom` and nothing else:
    // the alignment axis is clamped, the anchor axis is not, and the panel's own
    // height is what puts its lower edge against the trigger.
    if (side === 'bottom' || side === 'top') {
      const start = align === 'start' ? rect.left : rect.right - panel.width
      const x = clamp(start, panel.width, bounds.left, bounds.right)
      const y = side === 'bottom' ? rect.bottom : rect.top - panel.height
      return {
        ...base,
        // The anchor axis follows the trigger, all the way out.
        transform: `translate(${x}px, ${y}px)`,
        minWidth: `${rect.width}px`, // never narrower than what it's anchored to
        clipPath: clipPathFor(x, y, panel, bounds),
      }
    }

    const x = side === 'right' ? rect.right : rect.left - panel.width
    const start = align === 'start' ? rect.top : rect.bottom - panel.height
    const y = clamp(start, panel.height, bounds.top, bounds.bottom)
    return {
      ...base,
      transform: `translate(${x}px, ${y}px)`,
      minWidth: '',
      clipPath: clipPathFor(x, y, panel, bounds),
    }
  }

  return useAnchored(anchor, panelElement, open, place, { onOpen: collectClippers })
}
