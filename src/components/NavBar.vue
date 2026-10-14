<script setup>
// Barre de navigation : emblème, nom de l'établissement, liens et choix de la langue.
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { etablissement } from '../config.js'
import { langues, changerLangue } from '../i18n.js'

const { locale } = useI18n()

// Chemin de l'emblème (tient compte du chemin base de Vite)
const embleme = import.meta.env.BASE_URL + 'logo-embleme.png'
</script>

<template>
  <header class="barre">
    <div class="conteneur barre-interieur">
      <RouterLink to="/" class="marque">
        <img :src="embleme" alt="" class="embleme" />
        <span class="nom">{{ etablissement.nom }}</span>
      </RouterLink>

      <nav class="liens">
        <RouterLink to="/" class="lien">
          <i class="pi pi-home" aria-hidden="true"></i>
          {{ $t('nav.home') }}
        </RouterLink>
        <RouterLink to="/agenda" class="lien">
          <i class="pi pi-calendar" aria-hidden="true"></i>
          {{ $t('nav.agenda') }}
        </RouterLink>

        <!-- Sélecteur de langue : le choix est mémorisé dans le localStorage -->
        <Select
          :modelValue="locale"
          :options="langues"
          optionLabel="nom"
          optionValue="code"
          :aria-label="$t('nav.language')"
          size="small"
          @update:modelValue="changerLangue"
        />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.barre {
  background: #ffffff; /* le logo doit rester sur fond blanc */
  border-bottom: 1px solid var(--bordure);
  position: sticky;
  top: 0;
  z-index: 10;
}
.barre-interieur {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.marque {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--couleur-principale);
  font-weight: 600;
}
.embleme {
  width: 44px;
  height: 44px;
}
.liens {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.lien {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--texte);
}
.lien:hover {
  background: #eef3f8;
}
/* Lien de la page affichée */
.lien.router-link-exact-active {
  color: var(--couleur-principale);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--couleur-secondaire);
}
</style>
