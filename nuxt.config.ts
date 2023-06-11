// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  typescript: {
    shim: false
  },
  css: [
    '~/assets/css/play.css'
  ],
  sourcemap: true,
  debug: true
})
