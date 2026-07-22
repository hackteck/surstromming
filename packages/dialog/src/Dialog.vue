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
      <div v-if="open" :class="$style.overlay" @mousedown.self="onOutside">
        <div
          ref="panel"
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
            aria-label="Close"
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
            <slot />
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
import type { DialogRole } from './index'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    role?: DialogRole
  }>(),
  { role: 'dialog' },
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

// Only the content scrolls — the header, the ✕ and the footer stay put. The
// class lands on the ScrollArea's own root, which is already a flex column;
// all it needs from the panel is permission to shrink.
.body {
  min-height: 0; // a flex child only shrinks below its content with this
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

.enterFrom,
.leaveTo {
  opacity: 0;
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .active {
    transition: none;
  }
}
</style>
