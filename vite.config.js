import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration de Vite : https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Chemin relatif : le site fonctionne aussi bien à la racine d'un domaine
  // (Vercel : https://site-test01.vercel.app/) que dans un sous-dossier
  // (GitHub Pages : https://<utilisateur>.github.io/site_test01/).
  // Possible car le routeur est en mode hash : l'adresse de la page ne change jamais.
  base: './',
  // Options de compilation de vue-i18n (évite des avertissements dans la console)
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false
  }
})
