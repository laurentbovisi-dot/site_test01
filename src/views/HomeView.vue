<script setup>
// Page d'accueil : bandeau, horaires, équipe, salles.
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import { Flower } from 'lucide-vue-next'
import { etablissement, salles, horaires, praticiens } from '../config.js'
import { formatLocal } from '../i18n.js'
import { compterReservations, dateDuJour } from '../storage.js'

const { t, locale } = useI18n()

// Chemin du logo complet (tient compte du chemin base de Vite)
const logo = import.meta.env.BASE_URL + 'logo.png'

// Transforme '08:00' en heure au format local suisse de la langue choisie
function formaterHeure(texte) {
  const [heures, minutes] = texte.split(':').map(Number)
  const date = new Date(2000, 0, 1, heures, minutes)
  return new Intl.DateTimeFormat(formatLocal(), { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Liste des jours avec leur horaire, recalculée quand la langue change
const listeHoraires = computed(() => {
  locale.value // dépendance : on recalcule si la langue change
  return Object.entries(horaires).map(([jour, horaire]) => ({
    jour,
    texte: horaire
      ? `${formaterHeure(horaire.ouverture)} – ${formaterHeure(horaire.fermeture)}`
      : t('home.closed'),
    ferme: !horaire
  }))
})

// Initiales pour l'avatar : « Anne-Laure Chappuis » → « AC »
function initiales(p) {
  return (p.prenom[0] + p.nom[0]).toUpperCase()
}

// Nom complet avec le titre éventuel : « Dre Anne-Laure Chappuis »
function nomComplet(p) {
  return [p.titre, p.prenom, p.nom].filter(Boolean).join(' ')
}

// Nombre de réservations du jour pour chaque salle (lu dans le localStorage)
const aujourdhui = dateDuJour()
const sallesAvecReservations = salles.map((salle) => ({
  ...salle,
  reservations: compterReservations(salle.id, aujourdhui)
}))
</script>

<template>
  <!-- Bandeau : logo complet, présentation et bouton de réservation -->
  <section class="bandeau">
    <div class="conteneur bandeau-interieur">
      <img :src="logo" :alt="$t('home.logoAlt') + ' ' + etablissement.nom" class="logo" />
      <div class="bandeau-texte">
        <h1>{{ etablissement.nom }}</h1>
        <p>{{ $t('home.presentation') }}</p>
        <Button as="router-link" to="/agenda" :label="$t('home.bookRoom')" icon="pi pi-calendar-plus" size="large" />
      </div>
    </div>
  </section>

  <!-- Horaires d'ouverture -->
  <section class="section">
    <div class="conteneur">
      <h2 class="titre-section">{{ $t('home.hoursTitle') }}</h2>
      <Card class="horaires">
        <template #content>
          <ul class="liste-horaires">
            <li v-for="ligne in listeHoraires" :key="ligne.jour" :class="{ ferme: ligne.ferme }">
              <span>{{ $t('days.' + ligne.jour) }}</span>
              <span>{{ ligne.texte }}</span>
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </section>

  <!-- L'équipe : une carte par praticien -->
  <section class="section section-claire">
    <div class="conteneur">
      <h2 class="titre-section">{{ $t('home.teamTitle') }}</h2>
      <div class="grille">
        <Card v-for="p in praticiens" :key="p.id" class="carte-praticien">
          <template #content>
            <div class="praticien-entete">
              <Avatar :label="initiales(p)" shape="circle" size="large" class="avatar" />
              <div>
                <h3>{{ nomComplet(p) }}</h3>
                <p class="specialite">{{ $t('specialties.' + p.specialite) }}</p>
              </div>
            </div>
            <p class="cv">{{ $t('practitioners.' + p.id + '.cv') }}</p>
            <div class="langues">
              <span class="langues-titre">{{ $t('home.languages') }} :</span>
              <Tag v-for="code in p.langues" :key="code" :value="$t('languages.' + code)" severity="secondary" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </section>

  <!-- Les 4 salles, avec le nombre de réservations du jour -->
  <section class="section">
    <div class="conteneur">
      <h2 class="titre-section">{{ $t('home.roomsTitle') }}</h2>
      <div class="grille grille-salles">
        <Card
          v-for="salle in sallesAvecReservations"
          :key="salle.id"
          class="carte-salle"
          :style="{ borderTopColor: salle.couleur }"
        >
          <template #content>
            <Flower :color="salle.couleur" :size="36" aria-hidden="true" />
            <h3>{{ salle.nom }}</h3>
            <p class="reservations">{{ $t('home.bookingsToday', salle.reservations) }}</p>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Bandeau sur fond très clair : le logo doit rester lisible */
.bandeau {
  background: #ffffff;
  border-bottom: 1px solid var(--bordure);
  padding: 2rem 0;
}
.bandeau-interieur {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.logo {
  width: 260px;
  max-width: 100%;
  height: auto;
}
.bandeau-texte {
  flex: 1;
  min-width: 260px;
}
.bandeau-texte h1 {
  color: var(--couleur-principale);
  margin: 0 0 0.75rem;
  font-size: 1.9rem;
}
.bandeau-texte :deep(a.p-button) {
  text-decoration: none; /* le bouton est un lien : on retire le soulignement */
}
.bandeau-texte p {
  color: var(--texte-doux);
  font-size: 1.1rem;
  margin: 0 0 1.5rem;
}

/* Horaires */
.horaires {
  max-width: 420px;
}
.liste-horaires {
  list-style: none;
  margin: 0;
  padding: 0;
}
.liste-horaires li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--bordure);
}
.liste-horaires li:last-child {
  border-bottom: none;
}
.liste-horaires li.ferme {
  color: var(--texte-doux);
}

/* Fond alterné pour séparer les sections */
.section-claire {
  background: #eef2ee;
}

/* Grille de cartes qui s'adapte à la largeur de l'écran */
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.grille-salles {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* Cartes des praticiens */
.praticien-entete {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.avatar {
  background: var(--couleur-secondaire);
  color: #ffffff;
  font-weight: 600;
  flex-shrink: 0;
}
.praticien-entete h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--couleur-principale);
}
.specialite {
  margin: 0.1rem 0 0;
  color: var(--couleur-secondaire);
  font-weight: 600;
}
.cv {
  color: var(--texte-doux);
  margin: 0.9rem 0;
}
.langues {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}
.langues-titre {
  font-size: 0.9rem;
  color: var(--texte-doux);
}

/* Cartes des salles : bordure du haut à la couleur de la fleur */
.carte-salle {
  border-top: 4px solid;
  text-align: center;
}
.carte-salle h3 {
  margin: 0.5rem 0 0.25rem;
  color: var(--couleur-principale);
}
.reservations {
  margin: 0;
  color: var(--texte-doux);
}
</style>
