export type ToastVariant = 'info' | 'destructive'

export interface ToastItem {
  id: number
  title: string
  description?: string
  variant?: ToastVariant
  /** Milliseconds before it dismisses itself; 0 keeps it until dismissed. */
  duration?: number
}

export { default as Toaster } from './Toaster.vue'
export { default as Toast } from './Toast.vue'
