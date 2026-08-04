<template>
  <Popover v-model:open="open" :layer="layer">
    <template #trigger>
      <button
        :class="triggerClasses"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :disabled="disabled"
        v-bind="$attrs"
        @click="toggle"
        @keydown="onKeydown"
      >
        <span :class="valueClasses">{{ valueLabel }}</span>
        <Icon :icon="ChevronDown" :size="16" />
      </button>
    </template>

    <ul ref="list" :class="$style.list" role="listbox">
      <li
        v-for="(option, index) in options"
        :key="option.value"
        :class="optionClasses(option, index)"
        role="option"
        :aria-selected="option.value === model"
        @click="select(option)"
        @mousemove="activeIndex = index"
      >
        {{ option.label }}
        <Icon v-if="option.value === model" :icon="Check" :size="16" />
      </li>
    </ul>
  </Popover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useCssModule, useTemplateRef, watch } from 'vue'
import { Icon } from '@surstromming/icon'
import { Popover, type PopoverLayer } from '@surstromming/popover'
import { Check, ChevronDown } from 'lucide'
import type { SelectOption, SelectSize } from './index'

// The trigger is the focusable control — id/aria belong on it, not the wrapper.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    size?: SelectSize
    disabled?: boolean
    /**
     * Which rung the list opens on. `popover` is right almost always — but a
     * Select **inside a Dialog** needs `modal`, or its list is drawn at 30
     * while the dialog sits at 70 and the options open behind it. Same prop,
     * same reason, as DropdownMenu's.
     */
    layer?: PopoverLayer
  }>(),
  { placeholder: 'Select…', size: 'md', layer: 'popover' },
)

const model = defineModel<string>()

const open = ref(false)
const activeIndex = ref(-1)

const selected = computed(() => props.options.find((option) => option.value === model.value))
const valueLabel = computed(() => selected.value?.label ?? props.placeholder)

const list = useTemplateRef<HTMLElement>('list')

// A highlight you can't see is worse than none — follow it in a long list.
const revealActive = async () => {
  if (!open.value || activeIndex.value < 0) return
  await nextTick()
  list.value?.children[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
}

// Opening lands on the current choice, so ↓ moves from where you are. Revealing
// it is a separate call rather than a job for the watcher below: reopening on
// the same option doesn't change the index, so nothing would fire and a
// selection far down a long list would open off screen.
watch(open, (isOpen) => {
  if (!isOpen) return
  activeIndex.value = props.options.findIndex((o) => o.value === model.value)
  revealActive()
})

watch(activeIndex, revealActive)

const toggle = () => {
  open.value = !open.value
}

const select = (option: SelectOption) => {
  model.value = option.value
  open.value = false
}

// Skips disabled options; stops at the ends rather than wrapping.
const move = (step: number) => {
  const last = props.options.length - 1
  let next = activeIndex.value
  for (let i = next + step; i >= 0 && i <= last; i += step) {
    if (!props.options[i].disabled) {
      next = i
      break
    }
  }
  activeIndex.value = next
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault() // don't scroll the page
    if (!open.value) open.value = true
    else move(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault() // Space would scroll, Enter would submit the form
    const active = props.options[activeIndex.value]
    if (open.value && active) select(active)
    else open.value = true
  }
}

const $style = useCssModule()
const triggerClasses = computed(() => [$style.trigger, $style[`size-${props.size}`]])
const valueClasses = computed(() => [$style.value, { [$style.isPlaceholder]: !selected.value }])
const optionClasses = (option: SelectOption, index: number) => [
  $style.option,
  { [$style.isActive]: index === activeIndex.value, [$style.isDisabled]: option.disabled },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/select-trigger';
@use 'css/select-list';

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.isPlaceholder {
  color: design.color(muted-foreground);
}
</style>
