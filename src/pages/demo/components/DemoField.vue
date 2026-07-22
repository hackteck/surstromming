<template>
  <div :class="$style.root">
    <slot />
  </div>
</template>

<script setup lang="ts">
// A labelled control: caption above, field below, one column of the demo grid.
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(2);
  width: design.spacing(64);
}
</style>
