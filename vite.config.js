import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration de Vite : https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Chemin sous lequel le site est publié sur GitHub Pages
  // (https://<utilisateur>.github.io/site_test01/)
  base: '/site_test01/',
  // Options de compilation de vue-i18n (évite des avertissements dans la console)
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false
  }
})
