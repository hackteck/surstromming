<template>
  <header :class="$style.root">
    <slot />
  </header>
</template>

<style module lang="scss">
@use '@surstromming/design' as design;

// Sticks to the top as the page scrolls — the opaque background and bottom
// border keep content from showing through. Below overlays (Popover 30+),
// above page content.
.root {
  position: sticky;
  top: 0;
  z-index: design.z-index(header);
  display: flex;
  align-items: center;
  gap: design.spacing(2);
  padding: design.spacing(2);
  background-color: design.color(background);
  border-bottom: 1px solid design.color(border);
}
</style>
