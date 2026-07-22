<template>
  <div :class="rootClasses">
    <div :class="listClasses" role="tablist" :aria-orientation="orientation">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :id="tabId(tab.value)"
        :ref="(el) => setTabRef(el, index)"
        :class="tabClasses(tab)"
        type="button"
        role="tab"
        :aria-selected="tab.value === model"
        :aria-controls="panelId"
        :tabindex="tab.value === model ? 0 : -1"
        :disabled="tab.disabled"
        @click="model = tab.value"
        @keydown="onKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- tabindex: a panel holding only text would otherwise be unreachable
         from the tab it belongs to. -->
    <div
      :id="panelId"
      :class="$style.panel"
      role="tabpanel"
      tabindex="0"
      :aria-labelledby="tabId(model)"
    >
      <slot :name="model" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule, useId } from 'vue'
import type { TabItem, TabsOrientation, TabsVariant } from './index'

const props = withDefaults(
  defineProps<{
    tabs: TabItem[]
    variant?: TabsVariant
    orientation?: TabsOrientation
  }>(),
  { variant: 'solid', orientation: 'horizontal' },
)

const model = defineModel<string>({ required: true })

// One id pair for the whole set: every tab points at the single panel, and the
// panel names whichever tab is currently showing in it.
const uid = useId()
const panelId = `${uid}-panel`
const tabId = (value: string) => `${uid}-tab-${value}`

// Roving tabindex: one Tab stop for the whole list, arrows move within it.
// Trimmed to `tabs`, so a shrinking list leaves no unmounted buttons behind.
const tabRefs: HTMLButtonElement[] = []
const setTabRef = (el: unknown, index: number) => {
  tabRefs[index] = el as HTMLButtonElement
  tabRefs.length = props.tabs.length
}

// Wraps around, skipping disabled tabs.
const move = (from: number, step: number) => {
  const count = props.tabs.length
  for (let i = 1; i <= count; i++) {
    const next = (from + step * i + count * count) % count
    if (!props.tabs[next].disabled) {
      model.value = props.tabs[next].value
      tabRefs[next]?.focus()
      return
    }
  }
}

// The arrows follow the axis the tabs are laid out on.
const keys = computed(() =>
  props.orientation === 'vertical'
    ? { previous: 'ArrowUp', next: 'ArrowDown' }
    : { previous: 'ArrowLeft', next: 'ArrowRight' },
)

const onKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === keys.value.next) move(index, 1)
  else if (event.key === keys.value.previous) move(index, -1)
  else return

  event.preventDefault() // don't scroll the page along that axis
}

const $style = useCssModule()
const rootClasses = computed(() => [$style.root, $style[`orientation-${props.orientation}`]])
const listClasses = computed(() => [$style.list, $style[`variant-${props.variant}`]])
const tabClasses = (tab: TabItem) => [
  $style.tab,
  { [$style.isActive]: tab.value === model.value },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/tabs-variants';

.root {
  display: flex;
  gap: design.spacing(2);
}

.orientation-horizontal {
  flex-direction: column;
}

.orientation-vertical {
  flex-direction: row;

  .list {
    flex-direction: column;
    height: fit-content;
  }
}

.list {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  gap: design.spacing(1);
}

.tab {
  position: relative;
  background-color: transparent;
  padding: design.spacing(1.5) design.spacing(3);
  color: design.color(muted-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-visible {
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.panel {
  flex: 1;
  outline: none;
}
</style>
