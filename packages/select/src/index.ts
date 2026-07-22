export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export { default as Select } from './Select.vue'
