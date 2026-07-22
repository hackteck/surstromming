import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import {
  AppWindow,
  Bell,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ChevronRight,
  ChevronsRight,
  ChevronsUpDown,
  CircleDot,
  CircleUser,
  Gauge,
  Group,
  LoaderCircle,
  Menu,
  MessageCircle,
  MousePointerClick,
  Minus,
  PanelTop,
  Rows3,
  Scroll,
  Search,
  SlidersHorizontal,
  Square,
  SquareCheck,
  Table,
  Table2,
  Tag,
  TextCursorInput,
  ToggleRight,
  TriangleAlert,
  WrapText,
} from 'lucide'
import type { IconNode } from '@surstromming/icon'

export type ComponentCategory =
  | 'Forms'
  | 'Navigation'
  | 'Overlays'
  | 'Data display'
  | 'Feedback'

// Order here is the order categories appear on the landing page and in the sidebar.
export const componentCategories: ComponentCategory[] = [
  'Forms',
  'Navigation',
  'Overlays',
  'Data display',
  'Feedback',
]

export interface ComponentMeta {
  /** Display name, matches the exported component (`Button`). */
  name: string
  /** Package name / URL segment (`button` → `/components/button`). */
  slug: string
  category: ComponentCategory
  /** One line for the page header and the landing-grid tile. */
  description: string
  icon: IconNode
  /** The existing demo, reused as the page's live example. Loaded on view. */
  demo: Component
}

// The `demo` is the same `*Demo.vue` the all-in-one page renders — one source,
// shown here per component. `defineAsyncComponent` defers the import to first view.
const demo = (loader: AsyncComponentLoader) => defineAsyncComponent(loader)

export const components: ComponentMeta[] = [
  // Forms
  {
    name: 'Button',
    slug: 'button',
    category: 'Forms',
    description: 'Trigger an action or navigate — six variants, four sizes, renders as a button or a link.',
    icon: MousePointerClick,
    demo: demo(() => import('@/pages/demo/components/ButtonDemo.vue')),
  },
  {
    name: 'ButtonGroup',
    slug: 'button-group',
    category: 'Forms',
    description: 'Buttons joined into one control — split buttons, toolbars, segmented actions.',
    icon: Group,
    demo: demo(() => import('@/pages/demo/components/ButtonGroupDemo.vue')),
  },
  {
    name: 'Input',
    slug: 'input',
    category: 'Forms',
    description: 'A single-line text field over a real native input, with focus ring and invalid states.',
    icon: TextCursorInput,
    demo: demo(() => import('@/pages/demo/components/InputDemo.vue')),
  },
  {
    name: 'Textarea',
    slug: 'textarea',
    category: 'Forms',
    description: 'A multi-line text field sharing the input surface.',
    icon: WrapText,
    demo: demo(() => import('@/pages/demo/components/TextareaDemo.vue')),
  },
  {
    name: 'Select',
    slug: 'select',
    category: 'Forms',
    description: 'A trigger and popover for choosing one option from a list.',
    icon: ChevronsUpDown,
    demo: demo(() => import('@/pages/demo/components/SelectDemo.vue')),
  },
  {
    name: 'Combobox',
    slug: 'combobox',
    category: 'Forms',
    description: 'A select with a search field — type to filter the options.',
    icon: Search,
    demo: demo(() => import('@/pages/demo/components/ComboboxDemo.vue')),
  },
  {
    name: 'Checkbox',
    slug: 'checkbox',
    category: 'Forms',
    description: 'A binary choice with a drawn box over a native checkbox.',
    icon: SquareCheck,
    demo: demo(() => import('@/pages/demo/components/CheckboxDemo.vue')),
  },
  {
    name: 'RadioGroup',
    slug: 'radio-group',
    category: 'Forms',
    description: 'Pick one of several mutually exclusive options.',
    icon: CircleDot,
    demo: demo(() => import('@/pages/demo/components/RadioGroupDemo.vue')),
  },
  {
    name: 'Switch',
    slug: 'switch',
    category: 'Forms',
    description: 'A toggle for an on/off setting.',
    icon: ToggleRight,
    demo: demo(() => import('@/pages/demo/components/SwitchDemo.vue')),
  },
  {
    name: 'Calendar',
    slug: 'calendar',
    category: 'Forms',
    description: 'A month grid for picking a date — no date library, Intl for the names.',
    icon: CalendarDays,
    demo: demo(() => import('@/pages/demo/components/CalendarDemo.vue')),
  },
  {
    name: 'DatePicker',
    slug: 'date-picker',
    category: 'Forms',
    description: 'A field that opens a calendar in a popover.',
    icon: CalendarCheck,
    demo: demo(() => import('@/pages/demo/components/DatePickerDemo.vue')),
  },
  {
    name: 'Slider',
    slug: 'slider',
    category: 'Forms',
    description: 'Pick a numeric value along a track.',
    icon: SlidersHorizontal,
    demo: demo(() => import('@/pages/demo/components/SliderDemo.vue')),
  },

  // Navigation
  {
    name: 'Breadcrumb',
    slug: 'breadcrumb',
    category: 'Navigation',
    description: 'A trail of links back up the page hierarchy.',
    icon: ChevronRight,
    demo: demo(() => import('@/pages/demo/components/BreadcrumbDemo.vue')),
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    category: 'Navigation',
    description: 'Switch between panels with a roving-tabindex tablist.',
    icon: PanelTop,
    demo: demo(() => import('@/pages/demo/components/TabsDemo.vue')),
  },
  {
    name: 'DropdownMenu',
    slug: 'dropdown-menu',
    category: 'Navigation',
    description: 'A menu of actions anchored to a trigger.',
    icon: Menu,
    demo: demo(() => import('@/pages/demo/components/DropdownMenuDemo.vue')),
  },
  {
    name: 'Pagination',
    slug: 'pagination',
    category: 'Navigation',
    description: 'Move through pages of content, ends always in view.',
    icon: ChevronsRight,
    demo: demo(() => import('@/pages/demo/components/PaginationDemo.vue')),
  },

  // Overlays
  {
    name: 'Dialog',
    slug: 'dialog',
    category: 'Overlays',
    description: 'A modal dialog — and alertdialog — with focus trap and scroll lock.',
    icon: AppWindow,
    demo: demo(() => import('@/pages/demo/components/DialogDemo.vue')),
  },
  {
    name: 'Tooltip',
    slug: 'tooltip',
    category: 'Overlays',
    description: 'A short label shown on hover or focus.',
    icon: MessageCircle,
    demo: demo(() => import('@/pages/demo/components/TooltipDemo.vue')),
  },

  // Data display
  {
    name: 'Card',
    slug: 'card',
    category: 'Data display',
    description: 'A surface that groups related content, with an optional header and footer.',
    icon: Square,
    demo: demo(() => import('@/pages/demo/components/CardDemo.vue')),
  },
  {
    name: 'Table',
    slug: 'table',
    category: 'Data display',
    description: 'A presentational, data-driven table with slot escape hatches.',
    icon: Table,
    demo: demo(() => import('@/pages/demo/components/TableDemo.vue')),
  },
  {
    name: 'DataTable',
    slug: 'data-table',
    category: 'Data display',
    description: 'A table composed with sorting, pagination and row selection.',
    icon: Table2,
    demo: demo(() => import('@/pages/demo/components/DataTableDemo.vue')),
  },
  {
    name: 'Chart',
    slug: 'chart',
    category: 'Data display',
    description: 'Line, area and bar charts drawn as plain SVG, with a hover tooltip.',
    icon: ChartColumn,
    demo: demo(() => import('@/pages/demo/components/ChartDemo.vue')),
  },
  {
    name: 'ScrollArea',
    slug: 'scroll-area',
    category: 'Data display',
    description: 'A scroll container that paints its own scrollbar instead of the native one.',
    icon: Scroll,
    demo: demo(() => import('@/pages/demo/components/ScrollAreaDemo.vue')),
  },
  {
    name: 'Accordion',
    slug: 'accordion',
    category: 'Data display',
    description: 'Vertically stacked sections that collapse to save space.',
    icon: Rows3,
    demo: demo(() => import('@/pages/demo/components/AccordionDemo.vue')),
  },
  {
    name: 'Avatar',
    slug: 'avatar',
    category: 'Data display',
    description: "A user's picture, with initials as a graceful fallback.",
    icon: CircleUser,
    demo: demo(() => import('@/pages/demo/components/AvatarDemo.vue')),
  },
  {
    name: 'Badge',
    slug: 'badge',
    category: 'Data display',
    description: 'A small status or count label.',
    icon: Tag,
    demo: demo(() => import('@/pages/demo/components/BadgeDemo.vue')),
  },
  {
    name: 'Separator',
    slug: 'separator',
    category: 'Data display',
    description: 'A thin rule between content.',
    icon: Minus,
    demo: demo(() => import('@/pages/demo/components/SeparatorDemo.vue')),
  },

  // Feedback
  {
    name: 'Alert',
    slug: 'alert',
    category: 'Feedback',
    description: 'A callout for a message that stays on the page.',
    icon: TriangleAlert,
    demo: demo(() => import('@/pages/demo/components/AlertDemo.vue')),
  },
  {
    name: 'Toast',
    slug: 'toast',
    category: 'Feedback',
    description: 'Transient messages stacked over the page.',
    icon: Bell,
    demo: demo(() => import('@/pages/demo/components/ToastDemo.vue')),
  },
  {
    name: 'Progress',
    slug: 'progress',
    category: 'Feedback',
    description: 'Show how far along a task is.',
    icon: Gauge,
    demo: demo(() => import('@/pages/demo/components/ProgressDemo.vue')),
  },
  {
    name: 'Spinner',
    slug: 'spinner',
    category: 'Feedback',
    description: 'An indeterminate loading indicator.',
    icon: LoaderCircle,
    demo: demo(() => import('@/pages/demo/components/SpinnerDemo.vue')),
  },
]

export const componentBySlug = (slug: string): ComponentMeta | undefined =>
  components.find((component) => component.slug === slug)

export const componentsByCategory = (category: ComponentCategory): ComponentMeta[] =>
  components.filter((component) => component.category === category)
