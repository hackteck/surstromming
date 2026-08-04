<template>
  <!-- A plain wrapper, kept for one reason: it's what the panel measures. -->
  <div ref="root">
    <slot name="trigger" />
    <Teleport to="body">
      <ScrollArea v-if="open" ref="panel" :class="classes" :style="panelStyle">
        <slot />
      </ScrollArea>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, useCssModule, useTemplateRef, watch, type ComponentPublicInstance } from 'vue'
import { ScrollArea } from '@surstromming/scroll-area'
import { useAnchoredPosition } from './composables/useAnchoredPosition'
import type { PopoverAlign, PopoverLayer, PopoverSide } from './index'

const props = withDefaults(
  defineProps<{
    align?: PopoverAlign
    side?: PopoverSide
    layer?: PopoverLayer
  }>(),
  { align: 'start', side: 'bottom', layer: 'popover' },
)

const open = defineModel<boolean>('open', { default: false })

const root = useTemplateRef<HTMLElement>('root')
// A component ref now, so the element comes off `$el` — ScrollArea's root.
const panel = useTemplateRef<ComponentPublicInstance>('panel')
const panelElement = () => panel.value?.$el as HTMLElement | undefined

// The panel lives on <body> so no ancestor's overflow can clip it (a sidebar
// scrolls; a menu opening past its edge must not be cut off). The cost is that
// CSS can no longer place it — that's the composable's job.
const { style: panelStyle } = useAnchoredPosition(
  root,
  panelElement,
  () => ({ side: props.side, align: props.align }),
  open,
)

// mousedown, not click: a click that starts inside and ends outside (a drag,
// a text selection in the panel) must not close it.
const onPointerDown = (event: MouseEvent) => {
  const target = event.target as Node
  // The panel is on <body>, so "inside" is two elements now, not one.
  if (root.value?.contains(target) || panelElement()?.contains(target)) return
  open.value = false
}

// An open panel owns Escape, and that needs the capture phase: a Select inside
// a Dialog sits in the dialog's own panel, which listens for Escape there, so
// one press closed the list *and* the dialog behind it. Capturing at the
// document means this runs before the event reaches either.
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  open.value = false
}

const stopListening = () => {
  document.removeEventListener('mousedown', onPointerDown)
  document.removeEventListener('keydown', onKeydown, true)
}

// Listeners only exist while open — no idle cost, nothing to clean up per instance.
watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeydown, true)
  } else {
    stopListening()
  }
})

onBeforeUnmount(stopListening)

const $style = useCssModule()
const classes = computed(() => [
  $style.panel,
  $style[`side-${props.side}`],
  $style[`layer-${props.layer}`],
])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/popover-layers';

// These land on the ScrollArea's own root — it's the panel, so there's no
// wrapper. Placement is inline (`position: fixed` + the measured rect); the gap
// to the trigger stays here as a margin, so tokens stay in CSS.
.panel {
  // Tall enough for a month grid (DatePicker), still a cap on a long list.
  // The ScrollArea is already the column, so this bounds what it scrolls.
  max-height: design.spacing(96);
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
  background-color: design.color(popover);
  color: design.color(popover-foreground);
  box-shadow: design.shadow(md); // lifts it off whatever it covers
}

.side-bottom {
  margin-top: design.spacing(1);
}

.side-right {
  margin-left: design.spacing(1);
}

.side-left {
  margin-right: design.spacing(1);
}
</style>
