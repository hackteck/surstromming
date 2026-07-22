<template>
  <div :class="$style.root">
    <div v-if="label" :class="$style.label">{{ label }}</div>

    <ul :class="$style.menu">
      <li v-for="item in items" :key="item.value" :class="$style.item">
        <component
          :is="rowElement(item)"
          :class="buttonClasses(item)"
          :href="item.href"
          :type="rowType(item)"
          :aria-current="ariaCurrent(item)"
          @click="select($event, item)"
        >
          <Icon v-if="item.icon" :icon="item.icon" :size="16" />
          <span :class="$style.text">{{ item.label }}</span>
        </component>

        <button
          v-if="nestedEntries(item).length"
          :class="[$style.action, $style.control]"
          type="button"
          :aria-label="`Toggle ${item.label}`"
          :aria-expanded="Boolean(item.expanded)"
          @click="emit('toggle', item.value)"
        >
          <Icon :class="chevronClasses(item)" :icon="ChevronRight" :size="16" />
        </button>

        <DropdownMenu
          v-else-if="menuEntries(item).length"
          :class="$style.action"
          :items="menuEntries(item)"
          :side="menuSide"
          :layer="layer"
          align="start"
          @select="(action) => emit('action', item.value, action)"
        >
          <template #trigger="{ open, toggle: toggleMenu }">
            <button
              :class="triggerClasses(open)"
              type="button"
              aria-label="More"
              @click="toggleMenu"
            >
              <Icon :icon="Ellipsis" :size="16" />
            </button>
          </template>
        </DropdownMenu>

        <!-- inert while collapsed: the rows are clipped, not gone — Tab would
             otherwise walk into links nobody can see. -->
        <div
          v-if="nestedEntries(item).length"
          :class="nestedClasses(item)"
          :inert="!item.expanded"
        >
          <div :class="$style.subInner">
            <ul :class="$style.subList">
              <li v-for="sub in nestedEntries(item)" :key="sub.value">
                <component
                  :is="rowElement(sub)"
                  :class="subButtonClasses(sub)"
                  :href="sub.href"
                  :type="rowType(sub)"
                  :aria-current="ariaCurrent(sub)"
                  @click="select($event, sub)"
                >
                  {{ sub.label }}
                </component>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { DropdownMenu } from '@surstromming/dropdown-menu'
import type { PopoverLayer } from '@surstromming/popover'
import { Icon } from '@surstromming/icon'
import { ChevronRight, Ellipsis } from 'lucide'
import type { SidebarGroupItem, SidebarGroupSide, SidebarGroupSubItem } from './index'

const props = withDefaults(
  defineProps<{
    label?: string
    items: SidebarGroupItem[]
    side?: SidebarGroupSide
    /**
     * Stacking for the action menu, which is teleported to <body>. The `menu`
     * rung by default, above the sidebar's own: on mobile the drawer is
     * teleported too, and a menu opened inside it would otherwise render
     * behind it.
     */
    layer?: PopoverLayer
  }>(),
  { side: 'left', layer: 'menu' },
)

// The menu opens away from the sidebar, over the content. Flipping with the
// sidebar's side is also what an RTL layout will want.
const menuSide = computed(() => (props.side === 'left' ? 'right' : 'left'))

// Fully controlled: `expanded` lives in the data, so the chevron only asks.
const emit = defineEmits<{
  select: [value: string]
  action: [item: string, action: string]
  toggle: [value: string]
}>()

// Empty arrays rather than undefined: the template can count them and loop
// them without narrowing a union across two calls.
const nestedEntries = (item: SidebarGroupItem): SidebarGroupSubItem[] =>
  item.submenu?.type === 'items' ? item.submenu.entries : []

const menuEntries = (item: SidebarGroupItem) =>
  item.submenu?.type === 'menu' ? item.submenu.entries : []

// `href` buys the link affordances a <button> can't have: middle-click,
// Cmd+click, "Open in new tab", the URL preview on hover.
const rowElement = (item: SidebarGroupSubItem) => (item.href ? 'a' : 'button')
const rowType = (item: SidebarGroupSubItem) => (item.href ? undefined : 'button')
const ariaCurrent = (item: SidebarGroupSubItem) => (item.active ? 'page' : undefined)

const select = (event: MouseEvent, item: SidebarGroupSubItem) => {
  // A modified click on a real link is the browser's — that's the whole point
  // of the <a>. (Middle-click fires auxclick, so it never lands here.)
  if (item.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
  event.preventDefault()
  emit('select', item.value)
}

const $style = useCssModule()
const buttonClasses = (item: SidebarGroupItem) => [
  $style.button,
  {
    [$style.isActive]: item.active,
    [$style.hasAction]: Boolean(item.submenu),
  },
]
// The '…' hides until the row is hovered; an open menu holds it visible —
// :focus-within can't, now that the menu it opens is teleported to <body>.
const triggerClasses = (open: boolean) => [
  $style.control,
  $style.onHover,
  { [$style.isOpen]: open },
]
const subButtonClasses = (sub: SidebarGroupSubItem) => [
  $style.subButton,
  { [$style.isActive]: sub.active },
]
const chevronClasses = (item: SidebarGroupItem) => [
  $style.chevron,
  { [$style.isExpanded]: item.expanded },
]
const nestedClasses = (item: SidebarGroupItem) => [
  $style.sub,
  { [$style.isExpanded]: item.expanded },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/sidebar-group-menu';
@use 'css/sidebar-group-sub';

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1);
  padding: design.spacing(2);
}

.label {
  display: flex;
  align-items: center;
  height: design.spacing(8);
  padding: 0 design.spacing(2);
  color: design.with-alpha(sidebar-foreground, 70%);
  font-size: 0.75rem;
  font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  .sub,
  .chevron,
  .onHover {
    transition: none;
  }
}
</style>
