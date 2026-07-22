<template>
  <div :class="$style.root">
    <div v-for="item in items" :key="item.value" :class="$style.item">
      <h3>
        <button
          :class="$style.trigger"
          type="button"
          :aria-expanded="isOpen(item.value)"
          :disabled="item.disabled"
          @click="toggle(item.value)"
        >
          {{ item.title }}
          <Icon :class="chevronClasses(item.value)" :icon="ChevronDown" :size="16" />
        </button>
      </h3>

      <!-- Grid 0fr → 1fr: animates to the content's real height, no JS measuring. -->
      <div :class="contentClasses(item.value)">
        <div :class="$style.contentInner">
          <div :class="$style.body">
            <slot :name="item.value">{{ item.content }}</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCssModule } from 'vue'
import { Icon } from '@surstromming/icon'
import { ChevronDown } from 'lucide'
import type { AccordionItem } from './index'

const props = withDefaults(
  defineProps<{
    items: AccordionItem[]
    /** Let several sections stay open at once. */
    multiple?: boolean
  }>(),
  { multiple: false },
)

// One model for both modes: the list of open values.
const model = defineModel<string[]>({ default: () => [] })

const isOpen = (value: string) => model.value.includes(value)

const toggle = (value: string) => {
  if (isOpen(value)) {
    model.value = model.value.filter((open) => open !== value)
    return
  }
  model.value = props.multiple ? [...model.value, value] : [value]
}

const $style = useCssModule()
const chevronClasses = (value: string) => [
  $style.chevron,
  { [$style.isOpen]: isOpen(value) },
]
const contentClasses = (value: string) => [
  $style.content,
  { [$style.isOpen]: isOpen(value) },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  width: 100%;
}

.item {
  border-bottom: 1px solid design.color(border);

  // The list ends at the last title; a trailing rule would float unattached.
  &:last-child {
    border-bottom: none;
  }
}

.trigger {
  display: flex;
  align-items: flex-start; // a two-line title keeps the chevron on the first line
  justify-content: space-between;
  gap: design.spacing(4);
  width: 100%;
  background-color: transparent;
  padding: design.spacing(4) 0;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: start;
  cursor: pointer;
  outline: none;
  transition: box-shadow 0.15s ease;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    border-radius: design.radius(sm);
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.chevron {
  flex-shrink: 0;
  transform: translateY(2px); // optical: align with the cap height, not the line box
  color: design.color(muted-foreground);
  transition: transform 0.2s ease;
}

.chevron.isOpen {
  transform: translateY(2px) rotate(180deg);
}

// The row collapses to 0fr and expands to 1fr — the content keeps its natural
// height, so nothing has to be measured in JS.
.content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.2s ease;
}

.content.isOpen {
  grid-template-rows: 1fr;
}

.contentInner {
  overflow: hidden; // required: a grid item won't shrink below its content without it
}

.body {
  padding-bottom: design.spacing(4);
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

@media (prefers-reduced-motion: reduce) {
  .content,
  .chevron {
    transition: none;
  }
}
</style>
