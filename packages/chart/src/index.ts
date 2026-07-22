export type ChartType = 'line' | 'area' | 'bar'

/** One row of the chart's data — the x value plus a number per series key. */
export type ChartRow = Record<string, string | number | null | undefined>

export interface ChartSeries {
  /** Property to read on every row. */
  key: string
  /** Shown in the legend and the tooltip. */
  label: string
  /** Overrides the palette slot — needed past the fifth series. */
  color?: string
}

export { default as Chart } from './Chart.vue'
