<template>
  <div :class="$style.menu" role="menu" @keydown="onKeydown">
    <template v-for="(item, index) in items" :key="index">
      <div v-if="'separator' in item" :class="$style.separator" role="separator" />

      <!--
        A submenu is a row that opens a panel of its own, so it is a `Popover`
        whose trigger is that row and whose panel is another one of these. The
        recursion is the whole implementation — nothing here knows how deep it
        is — and reusing Popover is what keeps the second panel identical to the
        first: same surface, same placement, same teleport out of any scroller.
      -->
      <Popover
        v-else-if="'items' in item"
        :open="openIndex === index"
        side="right"
        align="start"
        :layer="layer"
        @update:open="(isOpen: boolean) => setOpen(index, isOpen)"
      >
        <template #trigger>
          <button
            :ref="(el) => setItemRef(el, index)"
            :class="itemClasses(item)"
            type="button"
            role="menuitem"
            tabindex="-1"
            aria-haspopup="menu"
            :aria-expanded="openIndex === index"
            :disabled="item.disabled"
            @click="openBranch(index, true)"
            @pointerenter="openBranch(index, false)"
          >
            <Icon v-if="item.icon" :icon="item.icon" :size="16" />
            {{ item.label }}
            <!--
              An inline caret rather than an `Icon`: the arrow is the component's
              own furniture, not the consumer's, and taking it from lucide would
              make every consumer install an icon set to draw a chevron.
            -->
            <svg
              :class="$style.caret"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </template>

        <!--
          `@mousedown.stop`, and it is what makes a nested panel work at all: it
          is teleported to `<body>`, so to the menu above it a press in here
          lands *outside* — and that menu would close on the press, taking this
          one with it before the click ever fired.

          `@pointerenter` cancels the close the row under the pointer scheduled
          on the way here: reaching a panel on the right means crossing the rows
          below the one that opened it.
        -->
        <MenuPanel
          :items="item.items"
          :layer="layer"
          :autofocus="focusBranch"
          @select="(value: string) => emit('select', value)"
          @close="closeBranch(index)"
          @dismiss="emit('dismiss')"
          @pointerenter="keepBranch"
          @mousedown.stop
        />
      </Popover>

      <button
        v-else
        :ref="(el) => setItemRef(el, index)"
        :class="itemClasses(item)"
        type="button"
        role="menuitem"
        tabindex="-1"
        :disabled="item.disabled"
        @click="emit('select', item.value)"
        @pointerenter="closeBranchSoon"
      >
        <Icon v-if="item.icon" :icon="item.icon" :size="16" />
        {{ item.label }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useCssModule, watch } from 'vue'
import { Icon } from '@surstromming/icon'
import { Popover, type PopoverLayer } from '@surstromming/popover'
import type { DropdownMenuItem, DropdownMenuOption, DropdownMenuSubmenu } from './index'

const props = defineProps<{
  items: DropdownMenuItem[]
  layer: PopoverLayer
  /** Take focus as this panel appears — how a submenu opened by key behaves. */
  autofocus?: boolean
}>()

const emit = defineEmits<{
  /** A leaf was chosen. Rises through every panel to the menu, which closes. */
  select: [value: string]
  /** This panel only — `ArrowLeft`, which steps back to the row that opened it. */
  close: []
  /** The whole menu — `Tab`, which leaves rather than cycling inside it. */
  dismiss: []
}>()

const $style = useCssModule()

/** Which row's submenu is open. One at a time, which is what a menu means. */
const openIndex = ref<number | null>(null)
/** Whether the submenu about to appear should take focus — key, not pointer. */
const focusBranch = ref(false)

/**
 * Buttons keyed by their index in `items` (separators leave gaps — that's fine,
 * the move helper skips anything that isn't a selectable item). Trimmed when the
 * list shrinks, or the arrows land on a button that is no longer mounted.
 */
const itemRefs: (HTMLButtonElement | null)[] = []
const setItemRef = (el: unknown, index: number) => {
  itemRefs[index] = el as HTMLButtonElement | null
}
watch(() => props.items.length, (count) => (itemRefs.length = count))

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

/**
 * A submenu is left open while the pointer crosses the rows under the one that
 * opened it, because that is the path to it: the panel is off to the right, so
 * reaching it means travelling diagonally over its own siblings. Closing on the
 * first of them is what makes a flyout menu feel like it is running away.
 *
 * Long enough to cut that corner, short enough that a submenu left behind on
 * purpose goes away on its own.
 */
const HOVER_GRACE_MS = 240

let closing: ReturnType<typeof setTimeout> | undefined

const keepBranch = () => clearTimeout(closing)

const closeBranchSoon = () => {
  keepBranch()
  closing = setTimeout(() => (openIndex.value = null), HOVER_GRACE_MS)
}

/**
 * Opening, never toggling. A pointer closes a submenu by choosing something or
 * by leaving it; a key closes it with `ArrowLeft` or `Escape`. A row that
 * closed what the pointer had just opened by hovering it would answer the same
 * gesture two different ways depending on how it arrived.
 */
const openBranch = (index: number, takeFocus: boolean) => {
  keepBranch()
  focusBranch.value = takeFocus
  openIndex.value = index
}

const closeBranch = (index: number) => {
  openIndex.value = null
  focusAt(index)
}

/** Popover's own dismissal — an outside press, or Escape. */
const setOpen = (index: number, isOpen: boolean) => {
  if (isOpen) openIndex.value = index
  else if (openIndex.value === index) openIndex.value = null
}

const branchAt = (index: number): DropdownMenuSubmenu | null => {
  const item = props.items[index]
  return item && 'items' in item && !item.disabled ? item : null
}

const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      move(1)
      break
    case 'ArrowUp':
      move(-1)
      break
    case 'ArrowRight': {
      const index = itemRefs.findIndex((el) => el === document.activeElement)
      if (index === -1 || !branchAt(index)) return
      openBranch(index, true)
      break
    }
    case 'ArrowLeft':
      emit('close')
      break
    case 'Home':
      focusEdge('start')
      break
    case 'End':
      focusEdge('end')
      break
    case 'Tab':
      emit('dismiss') // Tab leaves the menu rather than cycling inside it
      return
    default:
      return // Enter/Space land on the focused <button> natively; Escape → Popover
  }
  event.preventDefault() // arrows/Home/End must not scroll the page
}

// A panel opened by key takes focus. `nextTick`, because the panel is placed
// one tick after it mounts and focusing an element the browser has not put
// anywhere yet is how a page scrolls to nowhere. The watcher is what answers
// `ArrowRight` on a submenu the pointer had already opened — mounted by then,
// so mounting alone would never fire again.
onMounted(async () => {
  if (!props.autofocus) return
  await nextTick()
  focusEdge('start')
})
watch(
  () => props.autofocus,
  (take) => {
    if (take) focusEdge('start')
  },
)

onBeforeUnmount(() => clearTimeout(closing))

const itemClasses = (item: DropdownMenuOption | DropdownMenuSubmenu) => [
  $style.item,
  { [$style.isDestructive]: 'destructive' in item && item.destructive },
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
  // Explicit, and it is the submenu rows that need it: a plain row is a flex
  // item of this column and is stretched to the panel by `align-items`, but a
  // submenu's row sits inside `Popover`'s own wrapper `div` — and a `<button>`
  // in normal flow sizes to its content, not to its parent. Left to itself it
  // came out 117px wide in a 184px panel, so its highlight stopped short of the
  // others and the caret sat beside the label instead of at the panel's edge.
  width: 100%;
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

// At the row's trailing edge, always — the row fills the panel, so the arrow
// lines up with every other one down the menu rather than with the end of a
// label. The `auto` margin is also what keeps a short label from dragging it
// inwards.
.caret {
  width: design.spacing(4);
  height: design.spacing(4);
  margin-inline-start: auto;
}

.separator {
  height: 1px;
  margin: design.spacing(1) 0;
  background-color: design.color(border);
}
</style>
