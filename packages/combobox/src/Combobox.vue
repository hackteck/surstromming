<template>
  <Popover v-model:open="open" :layer="layer">
    <template #trigger>
      <button
        :class="$style.trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :disabled="disabled"
        v-bind="$attrs"
        @click="toggle"
        @keydown="onTriggerKeydown"
      >
        <span :class="valueClasses">{{ valueLabel }}</span>
        <Icon :icon="ChevronsUpDown" :size="16" />
      </button>
    </template>

    <div :class="$style.search">
      <Input
        ref="search"
        v-model="query"
        type="search"
        :placeholder="searchPlaceholder"
        @keydown="onSearchKeydown"
      />
    </div>

    <ul ref="list" :class="$style.list" role="listbox">
      <li
        v-for="(option, index) in matches"
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
      <li v-if="!matches.length" :class="$style.empty">{{ emptyText }}</li>
    </ul>
  </Popover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useCssModule, useTemplateRef, watch } from 'vue'
import { Icon } from '@surstromming/icon'
import { Input } from '@surstromming/input'
import { Popover, type PopoverLayer } from '@surstromming/popover'
import { Check, ChevronsUpDown } from 'lucide'
import type { ComboboxOption } from './index'

// The trigger is the focusable control — id/aria belong on it, not the wrapper.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options: ComboboxOption[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    /**
     * Which rung the panel opens on. Inside a Dialog it has to be `modal`, or
     * the panel is drawn at 30 under a dialog at 70 — see Select's.
     */
    layer?: PopoverLayer
  }>(),
  {
    placeholder: 'Select…',
    searchPlaceholder: 'Search…',
    emptyText: 'Nothing found.',
    layer: 'popover',
  },
)

const model = defineModel<string>()

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const search = useTemplateRef<InstanceType<typeof Input>>('search')
const list = useTemplateRef<HTMLElement>('list')

const selected = computed(() => props.options.find((option) => option.value === model.value))
const valueLabel = computed(() => selected.value?.label ?? props.placeholder)

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.options
  return props.options.filter((option) => option.label.toLowerCase().includes(needle))
})

// Every keystroke re-filters, so the old index would point at the wrong option.
watch(matches, () => {
  activeIndex.value = 0
})

// A highlight you can't see is worse than none — follow it in a long list.
watch(activeIndex, async (index) => {
  if (!open.value || index < 0) return
  await nextTick()
  list.value?.children[index]?.scrollIntoView({ block: 'nearest' })
})

// A combobox that doesn't focus its search field is just a select with extra steps.
watch(open, async (isOpen) => {
  if (!isOpen) {
    query.value = ''
    return
  }
  await nextTick()
  search.value?.focus()
})

const toggle = () => {
  open.value = !open.value
}

const select = (option: ComboboxOption) => {
  model.value = option.value
  open.value = false
}

// Skips disabled options; stops at the ends rather than wrapping.
const move = (step: number) => {
  const last = matches.value.length - 1
  let next = activeIndex.value
  for (let i = next + step; i >= 0 && i <= last; i += step) {
    if (!matches.value[i].disabled) {
      next = i
      break
    }
  }
  activeIndex.value = next
}

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    open.value = true
  }
}

const onSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault() // don't move the text caret
    move(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    const active = matches.value[activeIndex.value]
    if (active) select(active)
  }
}

const $style = useCssModule()
const valueClasses = computed(() => [$style.value, { [$style.isPlaceholder]: !selected.value }])
const optionClasses = (option: ComboboxOption, index: number) => [
  $style.option,
  { [$style.isActive]: index === activeIndex.value, [$style.isDisabled]: option.disabled },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/combobox-list';

.trigger {
  @include design.field;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: design.spacing(2);
  width: 100%;
  height: design.spacing(9);
  padding-inline: design.spacing(3);
  font-size: 0.875rem;
  white-space: nowrap;
  text-align: start;
  cursor: pointer;

  // The chevrons are affordance, not content.
  svg {
    flex-shrink: 0;
    color: design.color(muted-foreground);
    pointer-events: none;
  }

  &:hover {
    #{design.$darkThemeSelector} & {
      background-color: design.with-alpha(input, 50%);
    }
  }
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.isPlaceholder {
  color: design.color(muted-foreground);
}

.search {
  border-bottom: 1px solid design.color(border);
  padding: design.spacing(1);
}
</style>
