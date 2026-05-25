import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'فليكسورا — لوحة تحكم الصالة الرياضية',
        short_name: 'فليكسورا جيم',
        description: 'إدارة الصالة الرياضية — أعضاء، حضور، مالية، موظفين',
        theme_color: '#E50914',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['business', 'sports', 'productivity'],
        icons: [
          {
            src: 'https://i.ibb.co/gFwNY6cd/fav-Icon-2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'https://i.ibb.co/gFwNY6cd/fav-Icon-2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'تسجيل الحضور',
            url: '/attendance',
            description: 'سجل حضور الأعضاء بالـ QR',
          },
          {
            name: 'إدارة الأعضاء',
            url: '/members',
            description: 'عرض وإدارة الأعضاء',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})

