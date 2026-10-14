// Navigation entre les pages.
// Mode hash (#/agenda) : indispensable sur GitHub Pages, qui ne sait pas
// rediriger les adresses inconnues vers index.html.
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AgendaView from './views/AgendaView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'accueil', component: HomeView },
    { path: '/agenda', name: 'agenda', component: AgendaView },
    // Toute autre adresse renvoie à l'accueil
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  // Revenir en haut de la page à chaque changement de page
  scrollBehavior: () => ({ top: 0 })
})
