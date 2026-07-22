<template>
  <div :class="$style.root">
    <div v-if="hasHeader" :class="$style.header">
      <slot name="header">
        <h3 v-if="title" :class="$style.title">{{ title }}</h3>
        <p v-if="description" :class="$style.description">{{ description }}</p>
      </slot>
    </div>

    <div :class="$style.content">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="$style.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{
  title?: string
  description?: string
}>()

// The header renders for a custom slot or for either text prop — otherwise it
// would leave an empty padded band at the top.
const slots = useSlots()
const hasHeader = computed(() => !!slots.header || !!props.title || !!props.description)
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(6);
  border: 1px solid design.color(border);
  border-radius: design.radius(xl);
  background-color: design.color(card);
  padding-block: design.spacing(6);
  color: design.color(card-foreground);
  box-shadow: design.shadow(sm);
}

// Sections share the card's inline padding; the gap owns vertical rhythm.
.header,
.content,
.footer {
  padding-inline: design.spacing(6);
}

.header {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1.5);
}

.title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.description {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

.footer {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
}
</style>
