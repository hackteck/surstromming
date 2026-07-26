# @surstromming/popover

## 0.1.1 — 2026-07-26

### Fixed

- **The panel no longer slides into place.** It is placed with a `transform`
  from the viewport's origin instead of with `top` / `left`. An inset offset is
  also what a shrink-to-fit box has left to grow into, so a panel placed 374px
  along a 430px viewport measured 56px wide — which moved it left, which let it
  grow, which moved it again. The `ResizeObserver` walked that loop one frame at
  a time, and it read as the menu sliding out from under its own trigger for a
  tenth of a second. Worst wherever the panel is placed from its far edge
  (`align: end`, `side: left`) or the viewport is narrow — a phone hit both.

  No API change. The panel now carries a `transform`, so it establishes a
  containing block: a `position: fixed` descendant of a panel would resolve
  against the panel rather than the viewport. Nothing in the kit has one — every
  nested overlay teleports to `<body>`.
