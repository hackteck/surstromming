<template>
  <nav v-if="visible" aria-label="Pagination">
    <ul :class="$style.list">
      <li>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous page"
          :disabled="atFirst"
          @click="previous"
        >
          <Icon :icon="ChevronLeft" />
        </Button>
      </li>

      <li v-for="item in displayed" :key="item.key">
        <span v-if="item.ellipsis" :class="$style.ellipsis">
          <Icon :icon="Ellipsis" :size="16" />
        </span>
        <Button
          v-else
          :variant="pageVariant(item.page)"
          size="icon"
          :aria-current="ariaCurrent(item.page)"
          @click="model = item.page"
        >
          {{ item.page }}
        </Button>
      </li>

      <li>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next page"
          :disabled="atLast"
          @click="next"
        >
          <Icon :icon="ChevronRight" />
        </Button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button, type ButtonVariant } from '@surstromming/button'
import { Icon } from '@surstromming/icon'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide'

const props = defineProps<{
  /** Total pages; `≤ 1` renders nothing. */
  pageCount: number
}>()

/** Current page, 1-based. */
const model = defineModel<number>({ required: true })

const visible = computed(() => props.pageCount > 1)
const atFirst = computed(() => model.value <= 1)
const atLast = computed(() => model.value >= props.pageCount)

const previous = () => {
  model.value -= 1
}
const next = () => {
  model.value += 1
}

type Displayed = { key: number; ellipsis?: false; page: number } | { key: string; ellipsis: true }

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)
const page = (value: number): Displayed => ({ key: value, page: value })
const ellipsis = (side: 'start' | 'end'): Displayed => ({ key: `${side}-ellipsis`, ellipsis: true })

// Up to 7 slots so the layout never jumps as the current page moves: the ends
// always visible, one neighbor on each side of the current page, one ellipsis
// per folded range.
const displayed = computed<Displayed[]>(() => {
  const count = props.pageCount
  const current = model.value

  if (count <= 7) return range(1, count).map(page)
  if (current <= 4) return [...range(1, 5).map(page), ellipsis('end'), page(count)]
  if (current >= count - 3) return [page(1), ellipsis('start'), ...range(count - 4, count).map(page)]
  return [
    page(1),
    ellipsis('start'),
    ...range(current - 1, current + 1).map(page),
    ellipsis('end'),
    page(count),
  ]
})

const pageVariant = (value: number): ButtonVariant =>
  value === model.value ? 'outline' : 'ghost'
const ariaCurrent = (value: number) => (value === model.value ? 'page' : undefined)
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.list {
  display: flex;
  align-items: center;
  gap: design.spacing(1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: design.spacing(9);
  height: design.spacing(9);
}
</style>
