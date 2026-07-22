<template>
  <Popover v-model:open="open">
    <template #trigger>
      <Button
        :class="triggerClasses"
        variant="outline"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="open"
        v-bind="$attrs"
        @click="toggle"
      >
        <Icon :icon="CalendarDays" :size="16" />
        <span :class="$style.label">{{ label }}</span>
      </Button>
    </template>

    <Calendar
      v-model="model"
      :min="min"
      :max="max"
      :is-disabled="isDisabled"
      :week-starts-on="weekStartsOn"
      :locale="locale"
      @update:model-value="open = false"
    />
  </Popover>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { Button } from '@surstromming/button'
import { Calendar, type WeekStart } from '@surstromming/calendar'
import { Icon } from '@surstromming/icon'
import { Popover } from '@surstromming/popover'
import { CalendarDays } from 'lucide'

// The trigger is the focusable control — id/aria belong on it, not the wrapper.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    placeholder?: string
    /** How the chosen date is written on the trigger. */
    format?: (date: Date) => string
    min?: Date
    max?: Date
    isDisabled?: (date: Date) => boolean
    weekStartsOn?: WeekStart
    /** BCP 47 tag for the label and the calendar; omitted means the browser's. */
    locale?: string
    disabled?: boolean
  }>(),
  { placeholder: 'Pick a date', weekStartsOn: 'monday' },
)

const model = defineModel<Date | null>({ default: null })

const open = defineModel<boolean>('open', { default: false })

const toggle = () => {
  open.value = !open.value
}

const label = computed(() => {
  const date = model.value
  if (!date) return props.placeholder
  if (props.format) return props.format(date)
  return new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium' }).format(date)
})

const $style = useCssModule()
const triggerClasses = computed(() => [
  $style.trigger,
  { [$style.isPlaceholder]: model.value === null },
])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// Left-aligned and full-width: it reads as a field, not as a button.
.trigger {
  justify-content: flex-start;
  width: 100%;
  font-weight: 400;
}

.isPlaceholder {
  color: design.color(muted-foreground);
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
