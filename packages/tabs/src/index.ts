export type TabsVariant = 'solid' | 'line'
export type TabsOrientation = 'horizontal' | 'vertical'

export interface TabItem {
  label: string
  value: string
  disabled?: boolean
}

export { default as Tabs } from './Tabs.vue'
