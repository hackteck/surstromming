# @surstromming/table

## 0.1.1 — 2026-07-24

### Changed

- The private scroll wrapper is a
  [`ScrollArea`](https://github.com/hackteck/surstromming/tree/main/packages/scroll-area)
  instead of a `div` with `overflow-x: auto`, so a table wider than its box
  scrolls under the drawn bar like every other scroller here. When it fits, the
  bar takes no space at all.
- New dependency: `@surstromming/scroll-area@^0.1.1` — the release that paints a
  horizontal bar at all, so the range can't be `^0.1.0`.

### Might break

- **The `<table>` sits one level deeper.** The wrapper now has an inner viewport
  element between it and the table. Anything that reaches the table by structure
  (`querySelector('div > table')`, `:deep(> table)`) has to account for it.
  Attrs still land on the `<table>` itself, unchanged.
- **The horizontal scrollbar is painted, not the OS one** — same gestures, own
  look. Under `forced-colors` ScrollArea hands the native bar back.

## 0.1.0

Initial release.
