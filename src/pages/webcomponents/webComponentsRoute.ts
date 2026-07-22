import type { RouteRecordRaw } from 'vue-router'
import { lazyPage } from '@/router/lazyPage'
import DemoSidebar from '@/pages/demo/components/DemoSidebar.vue'

export const webComponentsRoute: RouteRecordRaw = {
  path: '/webcomponents',
  name: 'webcomponents',
  components: {
    default: lazyPage(() => import('./WebComponents.vue')),
    sidebar: DemoSidebar,
  },
  meta: { title: 'Web components' },
}
