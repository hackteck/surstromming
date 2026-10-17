<template>
  <Backdrop :visible="open" layer="modal" />
  <Teleport to="body">
    <Transition
      :enter-from-class="$style.enterFrom"
      :leave-to-class="$style.leaveTo"
      :enter-active-class="$style.active"
      :leave-active-class="$style.active"
    >
      <!-- The overlay catches an outside click; the panel stops it bubbling. -->
      <div v-if="open" :class="overlayClasses" @mousedown.self="onOutside">
        <div
          ref="panel"
          v-bind="$attrs"
          :class="$style.panel"
          :role="role"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="description ? descriptionId : undefined"
          @keydown="onKeydown"
        >
          <button
            v-if="showClose"
            :class="$style.close"
            type="button"
            :aria-label="closeLabel"
            @click="open = false"
          >
            <Icon :icon="X" :size="16" />
          </button>

          <div v-if="hasHeader" :class="$style.header">
            <slot name="header">
              <h2 v-if="title" :id="titleId" :class="$style.title">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" :class="$style.description">
                {{ description }}
              </p>
            </slot>
          </div>

          <ScrollArea v-if="$slots.default" :class="$style.body">
            <div :class="$style.content">
              <slot />
            </div>
          </ScrollArea>

          <div v-if="$slots.footer" :class="$style.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useCssModule, useId, useSlots, useTemplateRef } from 'vue'
import { Backdrop } from '@surstromming/backdrop'
import { Icon } from '@surstromming/icon'
import { ScrollArea } from '@surstromming/scroll-area'
import { X } from 'lucide'
import { useModalFocus } from './composables/useModalFocus'
import type { DialogRole, DialogSide } from './index'

// Multi-node root (Backdrop + Teleport): attrs would be dropped, so `class`
// never reached the panel and its width could not be overridden.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    role?: DialogRole
    side?: DialogSide
    /** The ✕'s accessible name, in the app's language. */
    closeLabel?: string
  }>(),
  { role: 'dialog', side: 'center', closeLabel: 'Close' },
)

const open = defineModel<boolean>('open', { default: false })

// Dismissal follows the role: a `dialog` closes on ✕/Escape/outside, an
// `alertdialog` is a decision you can't wave away. (A boolean override prop is
// a trap — an absent boolean prop is `false`, not `undefined`, so it can't
// carry a role-dependent default; role is the single source of truth.)
const dismissible = computed(() => props.role === 'dialog')
const showClose = dismissible

const slots = useSlots()
const hasHeader = computed(() => !!slots.header || !!props.title || !!props.description)

const titleId = useId()
const descriptionId = useId()

const panel = useTemplateRef<HTMLElement>('panel')

const onOutside = () => {
  if (dismissible.value) open.value = false
}

const { trapTab } = useModalFocus(panel, open)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && dismissible.value) {
    open.value = false
    return
  }
  if (event.key === 'Tab') trapTab(event)
}

const $style = useCssModule()
const overlayClasses = computed(() => [$style.overlay, $style[`side-${props.side}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.overlay {
  position: fixed;
  inset: 0;
  z-index: design.z-index(modal); // its Backdrop sits one step under
  display: flex;
  align-items: center;
  justify-content: center;
  padding: design.spacing(4);
}

// On an edge the panel is a sheet, flush with that edge: the overlay stops
// centring it and gives up its padding.
.side-top {
  align-items: flex-start;
  padding: 0;
}

.side-right {
  justify-content: flex-end;
  align-items: stretch;
  padding: 0;
}

.side-bottom {
  align-items: flex-end;
  padding: 0;
}

.side-left {
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
}

.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: design.spacing(4);
  width: 100%;
  max-width: design.spacing(120);
  max-height: calc(100vh - #{design.spacing(8)});
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  // `popover`, not `background`: in dark mode they differ (0.205 vs 0.145), and
  // a panel painted in the page's own colour has nothing to stand out against.
  background-color: design.color(popover);
  padding: design.spacing(6);
  color: design.color(popover-foreground);
  box-shadow: design.shadow(md);
  overflow: hidden; // the body scrolls, not the whole panel
  outline: none;
}

// A sheet runs the length of its edge, square, and bordered only where it
// meets the page. `:where()` keeps these at `.panel`'s own weight, so a
// consumer's class still sets a sheet's width as it sets a dialog's.
:where(.side-left, .side-right) .panel {
  max-width: design.spacing(80);
  max-height: none;
  border-block: none;
  border-radius: 0;
}

:where(.side-top, .side-bottom) .panel {
  max-width: none;
  border-inline: none;
  border-radius: 0;
}

:where(.side-top) .panel {
  border-top: none;
}

:where(.side-right) .panel {
  border-right: none;
}

:where(.side-bottom) .panel {
  border-bottom: none;
}

:where(.side-left) .panel {
  border-left: none;
}

// Only the content scrolls — the header, the ✕ and the footer stay put. The
// class lands on the ScrollArea's own root, which is already the column that
// bounds itself; all it needs from the panel is permission to shrink.
//
// The negative margin is the other half of `.content`'s padding: it hands the
// panel back exactly what the padding took, so the body still lines up with the
// header and the footer.
.body {
  min-height: 0; // a flex child only shrinks below its content with this
  margin: design.spacing(-1);
}

// A focus ring is painted *outside* the control's border box — 3px of it — and
// a scroller clips at its own padding edge, so a full-width field in a dialog
// had its ring shaved flat on both sides (measured: field and viewport both
// 741→1171, ring 738→1174). The room has to be *inside* the scroller, which is
// why this is padding on a child and not a negative margin on `.body` itself —
// that would only push the content out of the box doing the clipping.
.content {
  padding: design.spacing(1);
}

.close {
  position: absolute;
  top: design.spacing(4);
  right: design.spacing(4);
  border-radius: design.radius(sm);
  background-color: transparent;
  color: design.color(muted-foreground);
  cursor: pointer;
  outline: none;

  &:hover {
    color: design.color(foreground);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }
}

.header {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1.5);
  padding-right: design.spacing(6); // clear the close button
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.25;
}

.description {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: design.spacing(2);
}

.active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

// A sheet slides in from its edge while the overlay round it fades: the fade
// is what Transition times the leave by, so the two end together.
.active .panel {
  transition: transform 0.2s ease;
}

.enterFrom,
.leaveTo {
  opacity: 0;
}

.side-center:is(.enterFrom, .leaveTo) {
  transform: scale(0.97);
}

.side-top:is(.enterFrom, .leaveTo) .panel {
  transform: translateY(-100%);
}

.side-right:is(.enterFrom, .leaveTo) .panel {
  transform: translateX(100%);
}

.side-bottom:is(.enterFrom, .leaveTo) .panel {
  transform: translateY(100%);
}

.side-left:is(.enterFrom, .leaveTo) .panel {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .active,
  .active .panel {
    transition: none;
  }
}
</style>
