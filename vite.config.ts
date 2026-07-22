import { execSync } from 'node:child_process'
import { cpSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => {

  // the app imports @surstromming/custom-web-components from its dist
  if (!existsSync('packages/custom-web-components/dist')) {
    execSync('npm run build --workspace @surstromming/custom-web-components', { stdio: 'inherit' });
  }

  if (command === 'build') {
    if (process.env.CI) {
      cpSync('packages/custom-web-components/dist', 'public/custom_components_dist', { recursive: true });
    }
  }

  // main configuration for Vite
  return {
    plugins: [
      vue({
        template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('ss-') } },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  } satisfies UserConfig
})
