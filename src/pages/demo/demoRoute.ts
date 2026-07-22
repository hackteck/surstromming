import type { RouteRecordRaw } from 'vue-router'
import { lazyPage } from '@/router/lazyPage'
import DemoSidebar from './components/DemoSidebar.vue'

// The all-in-one page: every component on one scroll. Per-component pages live
// under /components/:slug; this is the overview the landing page links to.
export const demoRoute: RouteRecordRaw = {
  path: '/demo',
  name: 'demo',
  components: {
    default: lazyPage(() => import('./DemoPage.vue')),
    sidebar: DemoSidebar,
  },
  meta: { title: 'All components' },
}
