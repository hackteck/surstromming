export interface AccordionItem {
  title: string
  value: string
  /** Plain-text body. For markup, use the `#<value>` slot instead. */
  content?: string
  disabled?: boolean
}

export { default as Accordion } from './Accordion.vue'
