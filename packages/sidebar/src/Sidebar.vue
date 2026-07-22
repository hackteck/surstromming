<template>
  <Backdrop :visible="showBackdrop" layer="sidebar" @click="close" />
  <Teleport to="body" :disabled="!isMobile">
    <aside :class="classes" v-bind="$attrs">
      <ScrollArea :class="$style.content">
        <slot />
      </ScrollArea>
    </aside>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { Backdrop } from '@surstromming/backdrop'
import { ScrollArea } from '@surstromming/scroll-area'
import { isMobile } from '@surstromming/util'
import type { SidebarSide } from './index'

// Multi-node root: attrs go to the <aside>.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: SidebarSide
  }>(),
  { side: 'left' },
)
const open = defineModel<boolean>('open')

const showBackdrop = computed(() => isMobile.value && open.value)

const close = () => {
  open.value = false
}

// One <aside> for both modes: at the breakpoint the Teleport reparents it,
// which also resets CSS transitions — no open/close animation on resize.
const $style = useCssModule()
const mode = computed(() => (isMobile.value ? $style.drawer : $style.panel))
const classes = computed(() => [
  $style.root,
  mode.value,
  $style[`side-${props.side}`],
  { [$style.isOpen]: open.value },
])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/sidebar-panel';
@use 'css/sidebar-drawer';
@use 'css/sidebar-content';

.root {
  display: flex;
  flex-direction: column;
  background-color: design.color(sidebar);
  color: design.color(sidebar-foreground);
}


.drawer {
  z-index: design.z-index(sidebar); // only the drawer overlays the page
}

@media (prefers-reduced-motion: reduce) {
  .root {
    transition: none;
  }
}
</style>
