# @surstromming/tooltip

## 0.1.2 — 2026-07-26

### Fixed

- **A tip is placed and flipped correctly on a pinch-zoomed page**, and follows
  the zoom rather than keeping a position measured before it. Same cause and
  same fix as popover 0.1.3 — see its changelog.

### Changed

- Placement mechanics moved to `@surstromming/util`'s `useAnchored`
  (a **new dependency**, `^0.1.1`), shared with Popover. The policy here is
  unchanged and still the opposite one: a tip flips where a panel shifts, and is
  never clipped. No API change.

## 0.1.1 — 2026-07-26

### Fixed

- **The tip flips and clamps against the layout viewport, not the visual one.**
  Same fix as popover 0.1.2 — see its changelog. `window.innerHeight` is the
  visual viewport, which Safari shrinks under pinch-zoom, so the "does it fit
  below?" test and the cross-axis clamp were measuring against an edge that
  wasn't where the rects said it was.

  No API change, and nothing moves on an unzoomed page.
