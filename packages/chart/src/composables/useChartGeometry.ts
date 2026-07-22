import { computed, ref, type Ref } from 'vue'
import { useResizeObserver } from '@surstromming/util'
import type { ChartRow, ChartSeries, ChartType } from '../index'

/** What the geometry needs from the component's props. */
export interface ChartGeometryInput {
  data: ChartRow[]
  series: ChartSeries[]
  xKey: string
  type: ChartType
  height: number
  formatValue?: (value: number) => string
}

// Room for the y labels on the left and the x labels below.
const PADDING = { top: 12, right: 12, bottom: 28, left: 44 }
const TICK_COUNT = 4
/** Share of a band the bars occupy — the rest is the gap between groups. */
const BAR_FILL = 0.7
const BAR_GAP = 2
const BAR_RADIUS = 4
/** Below this, x labels start being skipped rather than overlapping. */
const X_LABEL_WIDTH = 56

/**
 * Everything that turns rows into coordinates: the plot box, a "nice" y scale,
 * the x bands, and one ready-to-render array per mark shape. No interaction —
 * the hover layer stays in the component, since that half is about the pointer
 * rather than about the data.
 */
export const useChartGeometry = (
  props: ChartGeometryInput,
  root: Readonly<Ref<HTMLElement | null>>,
) => {
  const width = ref(640)

  // The chart fills whatever it's put in, so its width is measured, not given.
  useResizeObserver(
    () => [root.value],
    () => {
      width.value = root.value?.clientWidth ?? 0
    },
  )

  const numberFormat = new Intl.NumberFormat()
  const format = (value: number) => props.formatValue?.(value) ?? numberFormat.format(value)

  const toNumber = (value: ChartRow[string]) => (typeof value === 'number' ? value : 0)

  const plot = computed(() => ({
    left: PADDING.left,
    top: PADDING.top,
    right: Math.max(PADDING.left, width.value - PADDING.right),
    bottom: props.height - PADDING.bottom,
    width: Math.max(0, width.value - PADDING.left - PADDING.right),
    height: Math.max(0, props.height - PADDING.top - PADDING.bottom),
  }))

  // A "nice" step — 1, 2 or 5 times a power of ten — so tick labels read as
  // round numbers instead of the data's exact extremes.
  const niceStep = (span: number) => {
    const rough = span / TICK_COUNT
    const magnitude = 10 ** Math.floor(Math.log10(rough))
    const normalized = rough / magnitude
    if (normalized <= 1) return magnitude
    if (normalized <= 2) return 2 * magnitude
    if (normalized <= 5) return 5 * magnitude
    return 10 * magnitude
  }

  const scale = computed(() => {
    const values = props.data.flatMap((row) => props.series.map((entry) => toNumber(row[entry.key])))
    // Zero is always in range: a bar chart that doesn't start at zero lies.
    const highest = Math.max(0, ...values)
    const lowest = Math.min(0, ...values)
    const step = niceStep(highest - lowest || 1)
    return { min: Math.floor(lowest / step) * step, max: Math.ceil(highest / step) * step, step }
  })

  const yOf = (value: number) => {
    const { min, max } = scale.value
    const span = max - min || 1
    return plot.value.top + plot.value.height * (1 - (value - min) / span)
  }

  const baselineY = computed(() => yOf(Math.max(scale.value.min, 0)))

  const ticks = computed(() => {
    const { min, max, step } = scale.value
    const count = Math.round((max - min) / step)
    return Array.from({ length: count + 1 }, (_, index) => {
      const value = min + index * step
      return { value, y: yOf(value), label: format(value) }
    })
  })

  const bands = computed(() => {
    const bandWidth = props.data.length === 0 ? 0 : plot.value.width / props.data.length
    return props.data.map((row, index) => ({
      key: `${row[props.xKey]}-${index}`,
      index,
      x: plot.value.left + bandWidth * index,
      width: bandWidth,
      center: plot.value.left + bandWidth * (index + 0.5),
    }))
  })

  // Slots are handed out in order and never cycled — a sixth series has to bring
  // its own `color` (see $colors chart-1…5 in the design package).
  const colorOf = (entry: ChartSeries, index: number) =>
    entry.color ?? `var(--series-${Math.min(index, 4) + 1})`

  const pointsOf = (entry: ChartSeries) =>
    props.data.map((row, index) => `${bands.value[index].center},${yOf(toNumber(row[entry.key]))}`)

  const lines = computed(() => {
    if (props.type === 'bar') return []
    return props.series.map((entry, index) => ({
      key: entry.key,
      color: colorOf(entry, index),
      points: pointsOf(entry).join(' '),
    }))
  })

  const areas = computed(() => {
    if (props.type !== 'area') return []
    return props.series.map((entry, index) => {
      const points = pointsOf(entry)
      const first = bands.value[0]?.center ?? 0
      const last = bands.value[bands.value.length - 1]?.center ?? 0
      return {
        key: entry.key,
        color: colorOf(entry, index),
        path: `M${first},${baselineY.value} L${points.join(' L')} L${last},${baselineY.value} Z`,
      }
    })
  })

  // A bar is anchored to the baseline and rounded at the far end only.
  const barPath = (x: number, top: number, barWidth: number, barHeight: number, radius: number) => {
    const r = Math.min(radius, barWidth / 2, barHeight)
    return `M${x},${top + barHeight} V${top + r} Q${x},${top} ${x + r},${top} H${x + barWidth - r} Q${x + barWidth},${top} ${x + barWidth},${top + r} V${top + barHeight} Z`
  }

  const bars = computed(() => {
    if (props.type !== 'bar') return []
    const count = props.series.length
    return props.data.flatMap((row, rowIndex) => {
      const band = bands.value[rowIndex]
      const groupWidth = band.width * BAR_FILL
      const barWidth = Math.max(1, (groupWidth - BAR_GAP * (count - 1)) / count)
      const groupLeft = band.center - groupWidth / 2

      return props.series.map((entry, seriesIndex) => {
        const value = toNumber(row[entry.key])
        const y = yOf(value)
        return {
          key: `${entry.key}-${rowIndex}`,
          color: colorOf(entry, seriesIndex),
          path: barPath(
            groupLeft + seriesIndex * (barWidth + BAR_GAP),
            Math.min(y, baselineY.value),
            barWidth,
            Math.abs(y - baselineY.value),
            // A bar below the baseline is rounded at its own far end, downwards —
            // not worth a second path shape, so it stays square.
            value >= 0 ? BAR_RADIUS : 0,
          ),
        }
      })
    })
  })

  const xLabels = computed(() => {
    const fit = Math.max(1, Math.floor(plot.value.width / X_LABEL_WIDTH))
    const step = Math.ceil(props.data.length / fit)
    return bands.value
      .filter((band) => band.index % step === 0)
      .map((band) => ({ key: band.key, x: band.center, text: String(props.data[band.index][props.xKey]) }))
  })

  return { width, plot, ticks, bands, xLabels, lines, areas, bars, yOf, colorOf, format, toNumber }
}
