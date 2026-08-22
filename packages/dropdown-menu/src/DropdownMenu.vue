<template>
  <Popover v-model:open="open" :align="align" :side="side" :layer="layer">
    <template #trigger>
      <slot name="trigger" :open="open" :toggle="toggle" />
    </template>

    <!--
      The panel is a component of its own because a submenu is another one of
      it. `autofocus` is bound to `open` rather than set: the panel mounts as
      the menu opens, so it is already true by the time it reads it.
    -->
    <MenuPanel
      :items="items"
      :layer="layer"
      :autofocus="open"
      @select="select"
      @dismiss="open = false"
    />
  </Popover>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Popover, type PopoverLayer } from '@surstromming/popover'
import MenuPanel from './MenuPanel.vue'
import type { DropdownMenuAlign, DropdownMenuItem, DropdownMenuSide } from './index'

withDefaults(
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

const select = (value: string) => {
  emit('select', value)
  open.value = false
}

// Opening moves focus into the menu — the panel takes it as it mounts. The
// trigger gets it back on close, so a keyboard user never loses their place.
// **Any** menu, not this panel: a submenu is a panel of its own on `<body>`,
// so focus in one is not inside anything this component can reach for.
let trigger: HTMLElement | null = null
watch(open, (isOpen) => {
  if (isOpen) {
    trigger = document.activeElement as HTMLElement
  } else if ((document.activeElement as HTMLElement | null)?.closest('[role="menu"]')) {
    // `preventScroll`, because what usually closes a menu is a press somewhere
    // else, and this runs before that press has focused what it hit. Scrolling
    // the trigger back into view drags the page to wherever its row happens to
    // be — in a long list, nowhere near what the reader is looking at. The
    // press then puts focus where it belongs, so only the scroll is given up.
    trigger?.focus({ preventScroll: true })
  }
})
</script>
