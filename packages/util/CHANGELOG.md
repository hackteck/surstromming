# @surstromming/util

## 0.1.1 — 2026-07-26

### Added

- **`useAnchored`**, the measuring and tracking half of placing a teleported
  overlay against a trigger it no longer descends from: the anchor's rect in
  layout coordinates, the viewport it's kept inside, the overlay's own size, and
  the listeners that keep all three fresh. `Popover` and `Tooltip` were two
  copies of this with two different bugs in it; each now passes in a `place`
  function and keeps nothing but its policy. `rectOf`, `layoutViewport`, `clamp`
  and `VIEWPORT_MARGIN` come out with it.

  Nothing is removed, so every existing consumer is unaffected.

