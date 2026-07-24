# @surstromming/scroll-area

## 0.1.1 — 2026-07-24

### Added

- **Horizontal scrolling.** Both axes scroll by default now, with a bar each,
  and a bar is only there while its own axis overflows — so a wide table or a
  row of cards gets a bottom bar without asking, and nothing else changes.
- **`orientation`** — `both` (the default), `vertical` or `horizontal`. It
  *forbids* an axis rather than asking for a bar: `vertical` clips sideways
  overflow, `horizontal` clips vertical.
- Exported types `ScrollAreaOrientation` and `ScrollAxis`.

### Changed

- The root is a **CSS grid** (`1fr auto / 1fr auto`), not a flex column. Each
  bar sits in a track of its own, so the space it takes *is* its gutter and two
  bars leave the corner empty without being told about each other.
- The gutter is that track and no longer `padding-right` on the viewport.
  Padding sits at the *end* of the content: it keeps the last row clear of a
  bottom bar but lets every row before it scroll underneath.
- A bar with nothing to scroll now collapses across (`width: 0` / `height: 0`)
  instead of unmounting, so its track stays measurable — and it stops taking
  pointer events while it's out of sight.
- `overscroll-behavior: contain` is applied per axis, only on an axis that
  really scrolls.
- Internals: the bar is a private `ScrollBar.vue`, and `useScrollMetrics` is
  axis-generic (`thumbHeight`/`thumbTop` → `thumbLength`/`thumbOffset`). Not
  exported, but the package ships raw source, so a deep import would notice.

### Might break

- **`display` on the root.** A consumer class that sets `display: flex` — or
  anything else — on the ScrollArea root now fights the grid, and the bars land
  in the wrong place. Set height, width and surface there; leave `display` alone.
- **A horizontal bar can now appear where nothing was there before.** Content
  wider than the viewport used to scroll sideways silently — `overflow-x` was
  never stated and the browser promoted it to `auto` behind the hidden native
  bar. It's a real, drawn bar now, and it takes 18px off the bottom. Where the
  overflow was an accident and clipping is what's wanted, say
  `orientation="vertical"`.

## 0.1.0

Initial release.
