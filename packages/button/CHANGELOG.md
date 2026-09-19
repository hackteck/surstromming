# @surstromming/button

## 0.1.1 — 2026-09-19

### Fixed

- **`as` accepts a component, as the README always said it did.** The prop
  was typed `string`, so the documented `:as="RouterLink"` failed `vue-tsc`
  with `Type '_RouterLinkI' is not assignable to type 'string'` — at runtime it
  rendered correctly, because `<component :is>` takes either. It is now
  `string | Component`. Found by a consumer (BrainTrain), whose header back
  button and not-found link are exactly that case.

  No runtime change, and nothing to do in a consumer that passes a tag name.
  `type` and `disabled` still apply only when `as` is `button`; a component
  gets `aria-disabled` instead, as any other non-button element does.

## 0.1.0 — 2026-07-22

- First release.
