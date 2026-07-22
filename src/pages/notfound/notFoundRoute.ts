import type { RouteRecordRaw } from 'vue-router'
import { lazyPage } from '@/router/lazyPage'
import DemoSidebar from '@/pages/demo/components/DemoSidebar.vue'

// Catch-all — must stay last in `routes`. No `meta.title`, so it isn't listed
// in the header page-switcher.
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  components: {
    default: lazyPage(() => import('./NotFoundPage.vue')),
    sidebar: DemoSidebar,
  },
}
