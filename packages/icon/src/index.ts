/**
 * A lucide-style icon node, as imported from the `lucide` package:
 *   import { Command } from "lucide"
 *   <Icon :icon="Command" />
 *
 * Each entry is a `[tag, attributes]` tuple describing one SVG child element.
 */
export type IconNodeChild = [tag: string, attrs: Record<string, string | number | undefined>]
export type IconNode = readonly IconNodeChild[]

export { default as Icon } from './Icon.vue'
