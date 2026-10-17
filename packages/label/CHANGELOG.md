# @surstromming/label

## 0.1.1 — 2026-10-17

### Fixed

- **A caption that wraps has room between its lines.** At `line-height: 1`
  the lines of a caption that wrapped touched: a Russian instruction above a
  field, on a phone, in a consumer (Isometria's editor). The caption now
  sets `line-height: 1.25` and gives the half-leading back with
  `margin-block: -0.125em`, so a caption of one line of text takes exactly
  the room it took before, and a form keeps its rhythm. A line beside
  something taller than its text, an icon or a checkbox, takes up to 3.5 px
  less than it did.
