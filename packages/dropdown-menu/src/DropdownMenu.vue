<template>
  <Popover v-model:open="open" :align="align" :side="side" :layer="layer">
    <template #trigger>
      <slot name="trigger" :open="open" :toggle="toggle" />
    </template>

    <div ref="menu" :class="$style.menu" role="menu" @keydown="onKeydown">
      <template v-for="(item, index) in items" :key="index">
        <div v-if="'separator' in item" :class="$style.separator" role="separator" />
        <button
          v-else
          :ref="(el) => setItemRef(el, index)"
          :class="itemClasses(item)"
          type="button"
          role="menuitem"
          tabindex="-1"
          :disabled="item.disabled"
          @click="select(item)"
        >
          <Icon v-if="item.icon" :icon="item.icon" :size="16" />
          {{ item.label }}
        </button>
      </template>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import { nextTick, useCssModule, useTemplateRef, watch } from 'vue'
import { Icon } from '@surstromming/icon'
import { Popover, type PopoverLayer } from '@surstromming/popover'
import type {
  DropdownMenuAlign,
  DropdownMenuItem,
  DropdownMenuOption,
  DropdownMenuSide,
} from './index'

const props = withDefaults(
  defineProps<{
    items: DropdownMenuItem[]
    align?: DropdownMenuAlign
    side?: DropdownMenuSide
    layer?: PopoverLayer
  }>(),
  { align: 'start', side: 'bottom', layer: 'popover' },
)

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ select: [value: string] }>()

const toggle = () => {
  open.value = !open.value
}

const menu = useTemplateRef<HTMLElement>('menu')

// Buttons keyed by their index in `items` (separators leave gaps — that's fine,
// the move helper skips anything that isn't a selectable item).
const itemRefs: (HTMLButtonElement | null)[] = []
const setItemRef = (el: unknown, index: number) => {
  itemRefs[index] = el as HTMLButtonElement | null
}

const isSelectable = (item: DropdownMenuItem) => !('separator' in item) && !item.disabled

const focusAt = (index: number) => itemRefs[index]?.focus()

const focusEdge = (from: 'start' | 'end') => {
  const order = from === 'start' ? [...props.items.keys()] : [...props.items.keys()].reverse()
  const index = order.find((i) => isSelectable(props.items[i]))
  if (index !== undefined) focusAt(index)
}

// Steps from the focused item, wrapping, skipping separators and disabled ones.
const move = (direction: 1 | -1) => {
  const count = props.items.length
  const active = itemRefs.findIndex((el) => el === document.activeElement)
  const from = active === -1 ? (direction === 1 ? -1 : count) : active
  for (let step = 1; step <= count; step++) {
    const index = (from + direction * step + count * count) % count
    if (isSelectable(props.items[index])) {
      focusAt(index)
      return
    }
  }
}

const select = (item: DropdownMenuOption) => {
  emit('select', item.value)
  open.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      move(1)
      break
    case 'ArrowUp':
      move(-1)
      break
    case 'Home':
      focusEdge('start')
      break
    case 'End':
      focusEdge('end')
      break
    case 'Tab':
      open.value = false // Tab leaves the menu rather than cycling inside it
      return
    default:
      return // Enter/Space land on the focused <button> natively; Escape → Popover
  }
  event.preventDefault() // arrows/Home/End must not scroll the page
}

// Opening moves focus into the menu; the trigger it came from gets focus back
// on close, so a keyboard user never loses their place.
let trigger: HTMLElement | null = null
watch(open, async (isOpen) => {
  if (isOpen) {
    trigger = document.activeElement as HTMLElement
    await nextTick()
    focusEdge('start')
  } else if (menu.value?.contains(document.activeElement)) {
    trigger?.focus()
  }
})

const $style = useCssModule()
const itemClasses = (item: DropdownMenuOption) => [
  $style.item,
  { [$style.isDestructive]: item.destructive },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.menu {
  display: flex;
  flex-direction: column;
  min-width: design.spacing(48);
  padding: design.spacing(1);
}

.item {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
  border-radius: design.radius(sm);
  background-color: transparent;
  padding: design.spacing(1.5) design.spacing(2);
  color: design.color(popover-foreground);
  font-size: 0.875rem;
  text-align: start;
  white-space: nowrap;
  cursor: pointer;
  outline: none;

  // Hover and keyboard focus share one highlight — the item the pointer or the
  // arrows landed on is the one Enter would fire.
  &:hover,
  &:focus-visible {
    background-color: design.color(accent);
    color: design.color(accent-foreground);
  }

  &:disabled {
    color: design.color(muted-foreground);
    pointer-events: none;
  }

  svg {
    flex-shrink: 0;
    color: design.color(muted-foreground);
  }
}

.isDestructive {
  color: design.color(destructive);

  &:hover,
  &:focus-visible {
    background-color: design.with-alpha(destructive, 10%);
    color: design.color(destructive);
  }

  svg {
    color: design.color(destructive);
  }
}

.separator {
  height: 1px;
  margin: design.spacing(1) 0;
  background-color: design.color(border);
}
</style>
