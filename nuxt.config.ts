// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", '@nuxt/fonts', '@nuxt/icon', '@nuxt/image'],
  css: ["~/assets/css/main.css"],
  typescript: { strict: true },
  runtimeConfig: {
    mytApiBaseUrl: process.env.NUXT_MYT_API_BASE_URL,
    sessionSecret: process.env.NUXT_SESSION_SECRET,
  }
})