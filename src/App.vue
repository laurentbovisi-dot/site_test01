<script setup>
// Mise en page commune à toutes les pages :
// barre de navigation en haut, page courante au milieu, pied de page en bas.
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrimeVue } from 'primevue/config'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
import { localePrimeVue } from './i18n.js'

// Quand la langue change, on traduit aussi les composants PrimeVue (calendrier…)
const { locale } = useI18n()
const primevue = usePrimeVue()
watch(
  locale,
  () => Object.assign(primevue.config.locale, localePrimeVue()),
  { immediate: true }
)
</script>

<template>
  <div class="mise-en-page">
    <NavBar />
    <main class="contenu">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* Le pied de page reste en bas même si la page est courte */
.mise-en-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.contenu {
  flex: 1;
}
</style>
