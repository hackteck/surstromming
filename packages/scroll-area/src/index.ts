/** One drawn bar covers one axis. */
export type ScrollAxis = 'vertical' | 'horizontal'

/** Which bars a ScrollArea paints — and, with them, which axes scroll. */
export type ScrollAreaOrientation = ScrollAxis | 'both'

export { default as ScrollArea } from './ScrollArea.vue'
