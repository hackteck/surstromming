<template>
  <div :class="classes" role="alert">
    <Icon v-if="icon" :class="$style.icon" :icon="icon" :size="16" />
    <p v-if="title" :class="$style.title">{{ title }}</p>
    <div :class="$style.description">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { Icon } from '@surstromming/icon'
import type { IconNode } from '@surstromming/icon'
import type { AlertVariant } from './index'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    icon?: IconNode
  }>(),
  { variant: 'info' },
)

const $style = useCssModule()
const classes = computed(() => [
  $style.root,
  $style[`variant-${props.variant}`],
  { [$style.hasIcon]: !!props.icon },
])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// Icon in its own column, title and description in the second — so a wrapped
// description lines up under the title instead of under the icon.
.root {
  display: grid;
  grid-template-columns: 1fr;
  gap: design.spacing(0.5) design.spacing(3);
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  background-color: design.color(card);
  padding: design.spacing(3) design.spacing(4);
  color: design.color(card-foreground);
  font-size: 0.875rem;
}

.hasIcon {
  grid-template-columns: auto 1fr;
}

.icon {
  grid-row: span 2;
  margin-top: design.spacing(0.5); // optical: align with the cap height, not the line box
}

.title {
  grid-column: -2;
  min-height: 1rem; // holds the row when the title is empty
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1rem;
}

.description {
  grid-column: -2;
  color: design.color(muted-foreground);
  line-height: 1.5;
}

// Only the text turns red — the border and surface stay neutral, so an alert
// doesn't shout twice.
.variant-destructive {
  color: design.color(destructive);

  .description {
    color: design.with-alpha(destructive, 90%);
  }
}
</style>
