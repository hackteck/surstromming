import { computed, type Ref } from 'vue'
import { useAnchored, clamp, type Rect, type Size } from '@surstromming/util'
import type { TooltipSide } from '../index'

/** Distance between the trigger and the tip. */
const GAP = 6

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
 * The measuring, the coordinate space and the tracking are `useAnchored`'s
 * (util), shared with Popover. The policy here is the opposite of that one:
 * this **flips**. A popover is a surface you work in, so it shifts and stays on
 * the side it was asked for; a tip is a label, and a label that would land off
 * screen belongs on the other side of the thing it labels. The cross axis is
 * then clamped into the viewport. It is also **not** clipped the way a panel is
 * — on the ladder's top rung a tip is supposed to paint over the header.
 */
export const useAnchoredTip = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  tipElement: () => HTMLElement | undefined,
  preferred: () => TooltipSide,
  open: Ref<boolean>,
) => {
  // The asked-for side wins whenever it fits. When it doesn't, the opposite one
  // is only better if *it* fits — otherwise flipping would just move the
  // problem, so the tip stays where the consumer put it.
  const sideFor = (rect: Rect, tip: Size, bounds: Rect): TooltipSide => {
    const want = preferred()
    const margin = GAP
    const fits: Record<TooltipSide, boolean> = {
      top: rect.top - tip.height - margin >= bounds.top,
      bottom: rect.bottom + tip.height + margin <= bounds.bottom,
      left: rect.left - tip.width - margin >= bounds.left,
      right: rect.right + tip.width + margin <= bounds.right,
    }
    return fits[want] || !fits[OPPOSITE[want]] ? want : OPPOSITE[want]
  }

  const place = (rect: Rect, tip: Size, bounds: Rect) => {
    // Rendered but not yet measured: park it out of sight rather than let a
    // frame of it land at the top-left corner.
    if (!tip.width) {
      return { position: 'fixed', top: '0px', left: '0px', visibility: 'hidden' }
    }

    const to = sideFor(rect, tip, bounds)

    if (to === 'top' || to === 'bottom') {
      const top = to === 'top' ? rect.top - tip.height - GAP : rect.bottom + GAP
      const left = clamp(
        rect.left + rect.width / 2 - tip.width / 2,
        tip.width,
        bounds.left,
        bounds.right,
      )
      return { position: 'fixed', top: `${top}px`, left: `${left}px`, visibility: 'visible' }
    }

    const left = to === 'left' ? rect.left - tip.width - GAP : rect.right + GAP
    const top = clamp(
      rect.top + rect.height / 2 - tip.height / 2,
      tip.height,
      bounds.top,
      bounds.bottom,
    )
    return { position: 'fixed', top: `${top}px`, left: `${left}px`, visibility: 'visible' }
  }

  const { style, anchorRect, size, bounds } = useAnchored(anchor, tipElement, open, place)

  // Which side it actually ended up on, for the caller's arrow — the same
  // question `place` answers, asked separately so neither writes to the other.
  const side = computed(() =>
    anchorRect.value && size.value.width
      ? sideFor(anchorRect.value, size.value, bounds.value)
      : preferred(),
  )

  return { style, side }
}
