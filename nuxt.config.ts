// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    baseURL: process.env.NUXT_BASE_URL ?? 'http://localhost:3001',
    jiraAuth: process.env.JIRA_AUTH ?? '',
    basicAuth: process.env.NUXT_BASIC_AUTH ?? '',
    public: {
      jiraBaseUrl: process.env.NUXT_PUBLIC_JIRA_BASE_URL ?? '',
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://google-fonts.nuxtjs.org/
    '@nuxtjs/google-fonts',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
  ],

  http: {
    credentials: 'same-origin',
  },

  tailwindcss: {
    configPath: './tailwind.config.js',
    // ? https://tailwindcss.nuxtjs.org/tailwind/config/#referencing-in-the-application
    exposeConfig: true,
    viewer: true,
    cssPath: '~/assets/css/tailwind.css',
  },

  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800],
    },
    overwriting: true,
  },

  css: ['~/assets/css/tailwind.css'],
})
