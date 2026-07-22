import type { RouteRecordRaw } from 'vue-router'
import { lazyPage } from '@/router/lazyPage'
import DemoSidebar from '@/pages/demo/components/DemoSidebar.vue'

// The landing page — first item in the sidebar, and the app's index.
export const homeRoute: RouteRecordRaw = {
  path: '/',
  name: 'home',
  components: {
    default: lazyPage(() => import('./HomePage.vue')),
    sidebar: DemoSidebar,
  },
  meta: { title: 'Home' },
}
