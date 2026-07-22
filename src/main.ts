import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@surstromming/design/font-list.scss'
import '@surstromming/design/reset.scss'
import { router } from './router'
import { initTheme } from './composables/useTheme'
import App from './App.vue'

// Apply the persisted theme to <html> before the first paint.
initTheme()

createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')
