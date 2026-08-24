// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Authenticated app shell — client render avoids auth/layout hydration mismatches.
  ssr: false,
  spaLoadingTemplate: true,
  // Nuxt 4 with classic root pages/components layout
  future: {
    compatibilityVersion: 4,
  },
  srcDir: '.',
  dir: {
    public: 'public',
  },
  // bump: force reload after i18n path fix
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'rcp-color-mode',
  },

  runtimeConfig: {
    // Used only on server for auth cookie ↔ Strapi / Entra
    jwtCookieName: 'rcp_jwt',
    oidcClientSecret: process.env.OIDC_CLIENT_SECRET || '',
    oidcIssuer: process.env.OIDC_ISSUER || '',
    oidcCallbackUrl: process.env.OIDC_CALLBACK_URL || 'http://localhost:3000/api/auth/microsoft/callback',
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:1337',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'RCP',
      defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'pt-PT',
      authMode: process.env.NUXT_PUBLIC_AUTH_MODE || process.env.AUTH_MODE || 'local',
      oidcClientId: process.env.NUXT_PUBLIC_OIDC_CLIENT_ID || process.env.OIDC_CLIENT_ID || '',
      oidcTenantId: process.env.NUXT_PUBLIC_OIDC_TENANT_ID || process.env.OIDC_TENANT_ID || '',
    },
  },

  i18n: {
    locales: [
      { code: 'pt-PT', language: 'pt-PT', name: 'Português' },
      { code: 'en', language: 'en', name: 'English' },
    ],
    defaultLocale: 'pt-PT',
    strategy: 'no_prefix',
    vueI18n: 'i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'rcp_locale',
      fallbackLocale: 'en',
      redirectOn: 'root',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'RCP — Planeamento de capacidade de recursos',
      short_name: 'RCP',
      description: 'Planeamento empresarial de capacidade e alocação de recursos',
      theme_color: '#21262d',
      background_color: '#24292e',
      display: 'standalone',
      orientation: 'portrait-primary',
      lang: 'pt-PT',
      start_url: '/',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
    },
    client: {
      installPrompt: true,
      registerPlugin: !import.meta.dev,
    },
    devOptions: {
      enabled: false,
    },
  },

  app: {
    head: {
      title: 'RCP',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  devServer: {
    host: 'localhost',
    port: 3000,
  },

  // Keep HMR on the Nuxt port. If 3000 is taken, Nuxt used to silently
  // move to 3001 while the browser still talked to 3000/5173 (503 + WS errors).
  vite: {
    server: {
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 3000,
      },
    },
  },
})