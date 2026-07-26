# @surstromming/tooltip

## 0.1.1 — 2026-07-26

### Fixed

- **The tip flips and clamps against the layout viewport, not the visual one.**
  Same fix as popover 0.1.2 — see its changelog. `window.innerHeight` is the
  visual viewport, which Safari shrinks under pinch-zoom, so the "does it fit
  below?" test and the cross-axis clamp were measuring against an edge that
  wasn't where the rects said it was.

  No API change, and nothing moves on an unzoomed page.
