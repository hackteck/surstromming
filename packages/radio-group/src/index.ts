export type RadioGroupOrientation = 'vertical' | 'horizontal'

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

export { default as RadioGroup } from './RadioGroup.vue'
