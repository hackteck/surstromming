<template>
  <label :class="classes">
    <slot />
  </label>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'

const props = defineProps<{ disabled?: boolean }>()

const $style = useCssModule()
const classes = computed(() => [$style.root, { [$style.isDisabled]: props.disabled }])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
  font-size: 0.875rem;
  font-weight: 500;
  // Room between the lines of a caption that wraps, as a Russian one on a
  // phone does: at 1 they touched. The margins give the half-leading back,
  // so a caption of one line stands exactly where it stood at 1.
  line-height: 1.25;
  margin-block: -0.125em;
  user-select: none; // double-clicking a caption should focus the field
}

.isDisabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
