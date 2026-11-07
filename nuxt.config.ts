import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare-pages'
  },
  modules: ['nuxt-auth-utils', 'nuxt-mdi'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  mdi: {
    componentName: 'NuxtIcon',
    defaultSize: '20px'
  }
})
