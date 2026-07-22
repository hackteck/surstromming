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
  line-height: 1;
  user-select: none; // double-clicking a caption should focus the field
}

.isDisabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
