// Point d'entrée de l'application
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import 'primeicons/primeicons.css'

import App from './App.vue'
import { router } from './router.js'
import { i18n } from './i18n.js'
import { ThemeJardins } from './theme.js'
import './style.css'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: ThemeJardins,
    options: {
      // Mode clair uniquement : cette classe n'est jamais ajoutée à la page,
      // donc le mode sombre ne s'active jamais (le logo n'y serait pas lisible).
      darkModeSelector: '.mode-sombre-desactive'
    }
  }
})
// Infobulles (v-tooltip) sur les boutons à icône seule
app.directive('tooltip', Tooltip)
app.use(router)
app.use(i18n)

// Langue de la page (utile pour l'accessibilité)
document.documentElement.lang = i18n.global.locale.value

app.mount('#app')
