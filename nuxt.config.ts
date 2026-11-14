import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare-pages'
  },
  modules: ['nuxt-auth-utils', 'nuxt-mdi', '@comark/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  mdi: {
    componentName: 'NuxtIcon',
    defaultSize: '20px'
  },
  components: [
    {
      path: '~/components/wiki',
      pathPrefix: false,
      global: true
    },
    '~/components'
  ]
})
