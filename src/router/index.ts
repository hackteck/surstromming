import { createRouter, createWebHistory } from 'vue-router'
import { homeRoute } from '@/pages/home/homeRoute'
import { componentsRoute } from '@/pages/components/componentsRoute'
import { demoRoute } from '@/pages/demo/demoRoute'
import { webComponentsRoute } from '@/pages/webcomponents/webComponentsRoute'
import { notFoundRoute } from '@/pages/notfound/notFoundRoute'

declare module 'vue-router' {
  interface RouteMeta {
    /** Shown in the header page-switcher; a route without one isn't listed. */
    title?: string
    /** Render the shared header for this route (default true). */
    header?: boolean
  }
}

// Order here is the order pages appear in the switcher.
export const routes = [
  homeRoute,
  demoRoute,
  componentsRoute,
  webComponentsRoute,
  notFoundRoute,
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Shared select handler for nav components: a value that resolves to a route
// navigates, anything else just logs (the router's dev warn flags a typo'd
// path on its own).
export const go = (value: string) => {
  // The catch-all matches anything, so a real route is one that isn't it.
  if (router.resolve(value).name !== notFoundRoute.name) router.push(value)
  else console.log('select', value)
}
