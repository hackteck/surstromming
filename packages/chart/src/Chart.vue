<template>
  <div ref="root" :class="$style.root">
    <svg
      :class="$style.svg"
      :width="width"
      :height="height"
      role="img"
      :aria-label="ariaLabel"
      @pointerleave="activeIndex = -1"
    >
      <!-- Grid first, so every mark paints over it. -->
      <line
        v-for="tick in ticks"
        :key="tick.value"
        :class="$style.grid"
        :x1="plot.left"
        :x2="plot.right"
        :y1="tick.y"
        :y2="tick.y"
      />
      <text
        v-for="tick in ticks"
        :key="`label-${tick.value}`"
        :class="$style.axisText"
        :x="plot.left - 8"
        :y="tick.y"
        text-anchor="end"
        dominant-baseline="middle"
      >
        {{ tick.label }}
      </text>

      <text
        v-for="label in xLabels"
        :key="label.key"
        :class="$style.axisText"
        :x="label.x"
        :y="height - 8"
        text-anchor="middle"
      >
        {{ label.text }}
      </text>

      <!-- The band under the pointer: a line/area gets a crosshair, bars a wash. -->
      <template v-if="activeIndex >= 0">
        <rect
          v-if="type === 'bar'"
          :class="$style.highlight"
          :x="bands[activeIndex].x"
          :y="plot.top"
          :width="bands[activeIndex].width"
          :height="plot.height"
        />
        <line
          v-else
          :class="$style.crosshair"
          :x1="bands[activeIndex].center"
          :x2="bands[activeIndex].center"
          :y1="plot.top"
          :y2="plot.bottom"
        />
      </template>

      <path
        v-for="area in areas"
        :key="area.key"
        :class="$style.area"
        :d="area.path"
        :fill="area.color"
      />

      <polyline
        v-for="line in lines"
        :key="line.key"
        :class="$style.line"
        :points="line.points"
        :stroke="line.color"
      />

      <path v-for="bar in bars" :key="bar.key" :d="bar.path" :fill="bar.color" />

      <!-- Markers only on the hovered point: a dot on every point is noise. -->
      <circle
        v-for="marker in markers"
        :key="marker.key"
        :class="$style.marker"
        :cx="marker.x"
        :cy="marker.y"
        :r="4"
        :fill="marker.color"
      />

      <!-- Transparent hit targets, one per row and full height, so the tooltip
           follows the pointer without having to hit a 2px line. -->
      <rect
        v-for="band in bands"
        :key="band.key"
        :class="$style.band"
        :x="band.x"
        :y="plot.top"
        :width="band.width"
        :height="plot.height"
        @pointerenter="activeIndex = band.index"
      />
    </svg>

    <div v-if="tooltip" :class="$style.tooltip" :style="tooltipStyle">
      <p :class="$style.tooltipTitle">{{ tooltip.title }}</p>
      <p v-for="entry in tooltip.entries" :key="entry.key" :class="$style.tooltipRow">
        <span :class="$style.swatch" :style="{ backgroundColor: entry.color }" />
        <span :class="$style.tooltipLabel">{{ entry.label }}</span>
        <span :class="$style.tooltipValue">{{ entry.value }}</span>
      </p>
    </div>

    <ul v-if="showLegend" :class="$style.legend">
      <li v-for="entry in legend" :key="entry.key" :class="$style.legendItem">
        <span :class="$style.swatch" :style="{ backgroundColor: entry.color }" />
        {{ entry.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useChartGeometry } from './composables/useChartGeometry'
import type { ChartRow, ChartSeries, ChartType } from './index'

const props = withDefaults(
  defineProps<{
    data: ChartRow[]
    series: ChartSeries[]
    /** Property holding the x label on every row. */
    xKey: string
    type?: ChartType
    /** Plot height in pixels; the width comes from the container. */
    height?: number
    formatValue?: (value: number) => string
  }>(),
  { type: 'line', height: 240 },
)

const root = useTemplateRef<HTMLElement>('root')
const { width, plot, ticks, bands, xLabels, lines, areas, bars, yOf, colorOf, format, toNumber } =
  useChartGeometry(props, root)

// ─── The hover layer ─────────────────────────────────────────────────────────
const activeIndex = ref(-1)

const markers = computed(() => {
  if (props.type === 'bar' || activeIndex.value < 0) return []
  const row = props.data[activeIndex.value]
  return props.series.map((entry, index) => ({
    key: entry.key,
    x: bands.value[activeIndex.value].center,
    y: yOf(toNumber(row[entry.key])),
    color: colorOf(entry, index),
  }))
})

const tooltip = computed(() => {
  const row = props.data[activeIndex.value]
  if (!row) return null
  return {
    title: String(row[props.xKey]),
    entries: props.series.map((entry, index) => ({
      key: entry.key,
      label: entry.label,
      color: colorOf(entry, index),
      value: format(toNumber(row[entry.key])),
    })),
  }
})

// Follows the band but never hangs off either edge.
const tooltipStyle = computed(() => {
  const center = bands.value[activeIndex.value]?.center ?? 0
  return { left: `${Math.min(Math.max(center, plot.value.left), plot.value.right)}px` }
})

const showLegend = computed(() => props.series.length > 1)
const legend = computed(() =>
  props.series.map((entry, index) => ({
    key: entry.key,
    label: entry.label,
    color: colorOf(entry, index),
  })),
)

const ariaLabel = computed(
  () => `${props.type} chart: ${props.series.map((entry) => entry.label).join(', ')}`,
)
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// The palette, handed to the marks as inline `fill`/`stroke` — SVG attributes
// can't call a Sass function, so the tokens land here once and JS reads them
// back as var(). Internal plumbing, not a public token.
.root {
  --series-1: #{design.color(chart-1)};
  --series-2: #{design.color(chart-2)};
  --series-3: #{design.color(chart-3)};
  --series-4: #{design.color(chart-4)};
  --series-5: #{design.color(chart-5)};

  position: relative;
  width: 100%;
}

.svg {
  display: block;
  overflow: visible;
}

.grid {
  stroke: design.color(border);
  stroke-width: 1;
}

.axisText {
  fill: design.color(muted-foreground);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}

.crosshair {
  stroke: design.color(border);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.highlight {
  fill: design.with-alpha(muted-foreground, 12%);
}

.line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.area {
  opacity: 0.2;
}

// A surface-colored ring keeps the marker readable over its own line.
.marker {
  stroke: design.color(background);
  stroke-width: 2;
}

.band {
  fill: transparent;
}

.tooltip {
  position: absolute;
  top: design.spacing(2);
  min-width: design.spacing(36);
  transform: translateX(-50%);
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
  padding: design.spacing(2);
  background-color: design.color(popover);
  color: design.color(popover-foreground);
  box-shadow: design.shadow(md);
  font-size: 0.75rem;
  pointer-events: none;
}

.tooltipTitle {
  margin: 0 0 design.spacing(1);
  color: design.color(muted-foreground);
}

.tooltipRow {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
  margin: 0;
  line-height: 1.5rem;
}

.tooltipLabel {
  flex: 1;
}

.tooltipValue {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.swatch {
  flex-shrink: 0;
  width: design.spacing(2);
  height: design.spacing(2);
  border-radius: design.radius(sm);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: design.spacing(4);
  margin: 0;
  padding: design.spacing(2) 0 0;
  list-style: none;
  color: design.color(muted-foreground);
  font-size: 0.75rem;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
}
</style>
