<template>
  <nav aria-label="Breadcrumb">
    <ol :class="$style.list">
      <li v-for="(item, index) in displayed" :key="item.ellipsis ? 'ellipsis' : item.label" :class="$style.item">
        <span v-if="item.ellipsis" :class="$style.ellipsis" role="presentation">
          <Icon :icon="Ellipsis" :size="16" aria-label="Hidden pages" />
        </span>
        <RouterLink v-else-if="item.to" :class="$style.link" :to="item.to">{{ item.label }}</RouterLink>
        <a v-else-if="item.href" :class="$style.link" :href="item.href">{{ item.label }}</a>
        <span v-else :class="$style.current" aria-current="page">{{ item.label }}</span>

        <Icon v-if="index < displayed.length - 1" :class="$style.separator" :icon="ChevronRight" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { Icon } from '@surstromming/icon'
import { ChevronRight, Ellipsis } from 'lucide'
import type { BreadcrumbItem } from './index'

const props = withDefaults(
  defineProps<{
    items: BreadcrumbItem[]
    /** Collapse the middle to an ellipsis once the trail is longer than this. */
    maxItems?: number
  }>(),
  { maxItems: 0 },
)

type Displayed = (BreadcrumbItem & { ellipsis?: false }) | { ellipsis: true }

// Keep the root and the tail — the two ends tell you where you are and where
// you came from; the middle is what folds away.
const displayed = computed<Displayed[]>(() => {
  const { items, maxItems } = props
  if (!maxItems || items.length <= maxItems) return items

  const tail = maxItems - 1 // the root plus this many trailing items stay visible
  return [items[0], { ellipsis: true }, ...items.slice(items.length - tail)]
})

const $style = useCssModule()
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: design.spacing(1.5);
  margin: 0;
  padding: 0;
  list-style: none;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
  word-break: break-word;

  @include design.screen(sm) {
    gap: design.spacing(2.5);
  }
}

.item {
  display: inline-flex;
  align-items: center;
  gap: design.spacing(1.5);
}

.link {
  transition: color 0.15s ease;

  &:hover {
    color: design.color(foreground);
  }
}

// Normal weight: the trail is navigation, not a heading — colour alone marks
// where you are.
.current {
  color: design.color(foreground);
}

.ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: design.spacing(4);
  height: design.spacing(4);
}

.separator {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
