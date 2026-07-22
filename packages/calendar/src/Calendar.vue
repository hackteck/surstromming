<template>
  <div :class="$style.root">
    <div :class="$style.header">
      <Button variant="ghost" size="icon" aria-label="Previous month" @click="shiftMonth(-1)">
        <Icon :icon="ChevronLeft" :size="16" />
      </Button>
      <span :class="$style.caption">{{ monthLabel }}</span>
      <Button variant="ghost" size="icon" aria-label="Next month" @click="shiftMonth(1)">
        <Icon :icon="ChevronRight" :size="16" />
      </Button>
    </div>

    <div :class="$style.grid">
      <span v-for="name in weekdayNames" :key="name" :class="$style.weekday">{{ name }}</span>

      <template v-for="cell in cells" :key="cell.key">
        <!-- Days spilling in from the neighbouring months are shown, not
             offered: rendering them as buttons would triple the tab stops. -->
        <span v-if="cell.outside" :class="$style.outside">{{ cell.day }}</span>
        <Button
          v-else
          :class="dayClasses(cell)"
          :variant="dayVariant(cell)"
          size="icon"
          :disabled="cell.disabled"
          :aria-current="cell.today ? 'date' : undefined"
          :aria-pressed="cell.selected"
          @click="select(cell.date)"
        >
          {{ cell.day }}
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule, watch } from 'vue'
import { Button, type ButtonVariant } from '@surstromming/button'
import { Icon } from '@surstromming/icon'
import { ChevronLeft, ChevronRight } from 'lucide'
import type { WeekStart } from './index'

interface DayCell {
  key: string
  date: Date
  day: number
  outside: boolean
  today: boolean
  selected: boolean
  disabled: boolean
}

const props = withDefaults(
  defineProps<{
    min?: Date
    max?: Date
    /** Rule out individual days — weekends, holidays, whatever the app knows. */
    isDisabled?: (date: Date) => boolean
    weekStartsOn?: WeekStart
    /** BCP 47 tag for the month and weekday names; omitted means the browser's. */
    locale?: string
  }>(),
  { weekStartsOn: 'monday' },
)

const model = defineModel<Date | null>({ default: null })
/** Any date inside the visible month; the consumer can drive the paging. */
const month = defineModel<Date>('month', { default: () => new Date() })

// A selection made elsewhere (a text field, a preset) has to be on screen.
watch(
  model,
  (value) => {
    if (value) month.value = new Date(value.getFullYear(), value.getMonth(), 1)
  },
  { immediate: true },
)

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

const shiftMonth = (step: number) => {
  month.value = new Date(month.value.getFullYear(), month.value.getMonth() + step, 1)
}

const select = (date: Date) => {
  model.value = date
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(month.value),
)

/** 0 for Sunday, 1 for Monday — the offset the whole grid is built from. */
const firstColumn = computed(() => (props.weekStartsOn === 'sunday' ? 0 : 1))

const weekdayNames = computed(() => {
  const format = new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format
  // 2023-12-31 was a Sunday — a fixed anchor to walk one week from.
  return Array.from({ length: 7 }, (_, index) =>
    format(new Date(2023, 11, 31 + firstColumn.value + index)),
  )
})

const isOutOfRange = (date: Date) =>
  (props.min !== undefined && date < startOfDay(props.min)) ||
  (props.max !== undefined && date > startOfDay(props.max))

// Always six rows: the grid keeps one height whatever month is shown.
const cells = computed<DayCell[]>(() => {
  const year = month.value.getFullYear()
  const index = month.value.getMonth()
  const lead = (new Date(year, index, 1).getDay() - firstColumn.value + 7) % 7
  const today = new Date()

  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(year, index, 1 - lead + offset)
    return {
      key: date.toDateString(),
      date,
      day: date.getDate(),
      outside: date.getMonth() !== index,
      today: isSameDay(date, today),
      selected: model.value !== null && isSameDay(date, model.value),
      disabled: isOutOfRange(date) || (props.isDisabled?.(date) ?? false),
    }
  })
})

const $style = useCssModule()
const dayVariant = (cell: DayCell): ButtonVariant => (cell.selected ? 'primary' : 'ghost')
const dayClasses = (cell: DayCell) => [
  $style.day,
  { [$style.isToday]: cell.today && !cell.selected },
]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: inline-flex;
  flex-direction: column;
  gap: design.spacing(2);
  padding: design.spacing(3);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: design.spacing(2);
}

.caption {
  font-size: 0.875rem;
  font-weight: 500;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;
  gap: design.spacing(1);
}

.weekday {
  padding-bottom: design.spacing(1);
  color: design.color(muted-foreground);
  font-size: 0.75rem;
  font-weight: 500;
}

.day {
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

// A ring rather than a fill — the filled look belongs to the selected day.
.isToday {
  box-shadow: inset 0 0 0 1px design.color(border);
}

.outside {
  display: flex;
  align-items: center;
  justify-content: center;
  width: design.spacing(9);
  height: design.spacing(9);
  color: design.with-alpha(muted-foreground, 50%);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}
</style>
