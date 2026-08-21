<template>
  <span
    ref="root"
    :class="$style.root"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="showIfFocusVisible"
    @focusout="hide"
    @keydown.escape="hide"
  >
    <slot />

    <!-- On <body>, so no ancestor's overflow can cut it: every page here
         scrolls through a ScrollArea, which used to swallow a tip whole. -->
    <Teleport to="body">
      <span v-if="open" ref="tip" :class="$style.tip" :style="tipStyle" role="tooltip">
        {{ content }}
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef } from 'vue'
import { useAnchoredTip } from './composables/useAnchoredTip'
import type { TooltipSide } from './index'

const props = withDefaults(
  defineProps<{
    content: string
    side?: TooltipSide
    /** Delay before showing — a pointer just passing through shouldn't flash it. */
    delay?: number
  }>(),
  { side: 'top', delay: 300 },
)

const open = defineModel<boolean>('open', { default: false })

const root = useTemplateRef<HTMLElement>('root')
const tip = useTemplateRef<HTMLElement>('tip')

// Teleported, so CSS can no longer place it against the trigger — the
// coordinates are measured, and the side flips when there's no room.
const { style: tipStyle } = useAnchoredTip(
  root,
  () => tip.value ?? undefined,
  () => props.side,
  open,
)

let timer: ReturnType<typeof setTimeout> | undefined

const show = () => {
  clearTimeout(timer)
  timer = setTimeout(() => (open.value = true), props.delay)
}

// Focus alone is not a reason to show, because not all focus comes from the
// keyboard. A dialog hands focus back to the control that opened it when it
// closes, so clicking a tooltipped opener, then closing the dialog with the
// mouse, showed a tip nothing could dismiss: the pointer is wherever that
// dialog's control was, so no `mouseleave` is ever coming for the trigger.
// `:focus-visible` is the browser's own answer to "am I showing this focus to
// the user", so the tip now appears exactly when the focus ring does.
const showIfFocusVisible = (event: FocusEvent) => {
  if ((event.target as Element | null)?.matches(':focus-visible')) show()
}

// Hiding is immediate: a lingering tooltip over the wrong thing is worse than
// a re-show. The pending open timer is cancelled too.
const hide = () => {
  clearTimeout(timer)
  open.value = false
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: inline-flex;
}

// Placement is inline (`position: fixed` plus the measured rect); stacking
// stays a class, which is the one thing that still reaches a teleported node.
.tip {
  z-index: design.z-index(tooltip); // above overlays; can sit over a dialog's own controls
  width: max-content;
  max-width: design.spacing(56);
  border-radius: design.radius(md);
  background-color: design.color(primary);
  padding: design.spacing(1.5) design.spacing(2.5);
  color: design.color(primary-foreground);
  font-size: 0.75rem;
  line-height: 1rem;
  white-space: normal;
  pointer-events: none; // never eat the hover it's describing
}
</style>
