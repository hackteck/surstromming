import type { RouteRecordRaw } from 'vue-router'
import { lazyPage } from '@/router/lazyPage'
import DemoSidebar from '@/pages/demo/components/DemoSidebar.vue'

// One page for every component — the slug picks which from the registry.
// No `meta.title`, so a component isn't listed in the header page-switcher.
export const componentsRoute: RouteRecordRaw = {
  path: '/components/:slug',
  name: 'component',
  components: {
    default: lazyPage(() => import('./ComponentPage.vue')),
    sidebar: DemoSidebar,
  },
}
