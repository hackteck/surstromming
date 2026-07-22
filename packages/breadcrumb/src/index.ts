import type { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  /** An href, or a router target. The last item is the current page — leave it out. */
  href?: string
  to?: RouteLocationRaw
}

export { default as Breadcrumb } from './Breadcrumb.vue'
