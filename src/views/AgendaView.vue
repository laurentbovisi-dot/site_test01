<script setup>
// Page Agenda : grille quotidienne des salles.
// Une colonne par salle, une ligne par créneau de 30 minutes,
// selon les horaires d'ouverture du jour affiché.
// - Clic sur une case libre (ou bouton « Nouvelle réservation ») : formulaire de réservation.
// - Clic sur un rendez-vous : détail, avec un bouton pour le supprimer.
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import { Flower } from 'lucide-vue-next'
import ReservationForm from '../components/ReservationForm.vue'
import ReservationDetails from '../components/ReservationDetails.vue'
import TypeIcon from '../components/TypeIcon.vue'
import { salles, typesRendezVous } from '../config.js'
import { formatLocal } from '../i18n.js'
import { aujourdhui, jourOuvrableVoisin, dateEnToutesLettres, creneauxDuJour, dateISO } from '../dates.js'
import { lireReservations } from '../storage.js'
import { formaterHeure, trouverPraticien, nomCourt, nomPatient } from '../format.js'

// --- Jour affiché et navigation ---

// Jour affiché (au départ : aujourd'hui)
const jourAffiche = ref(aujourdhui())

function jourPrecedent() {
  jourAffiche.value = jourOuvrableVoisin(jourAffiche.value, -1)
}
function jourSuivant() {
  jourAffiche.value = jourOuvrableVoisin(jourAffiche.value, 1)
}
function allerAujourdhui() {
  jourAffiche.value = aujourdhui()
}

// Sélecteur de date : on ignore un champ vidé (null) pour garder une date affichée
function choisirDate(date) {
  if (date) jourAffiche.value = date
}

// Vrai si le jour affiché est aujourd'hui (pour désactiver le bouton « Aujourd'hui »)
const estAujourdhui = computed(() => dateISO(jourAffiche.value) === dateISO(aujourdhui()))

// Date en toutes lettres avec une majuscule : « Samedi 17 octobre 2026 ».
// formatLocal() lit la langue choisie : le texte change avec la langue.
const titreJour = computed(() => {
  const texte = dateEnToutesLettres(jourAffiche.value, formatLocal())
  return texte.charAt(0).toUpperCase() + texte.slice(1)
})

// Créneaux du jour affiché (liste vide si le centre est fermé)
const creneaux = computed(() => creneauxDuJour(jourAffiche.value))

// --- Réservations ---

// Réservations enregistrées dans le navigateur.
// ref() : la grille se met à jour toute seule quand on en ajoute ou en supprime une.
const reservations = ref(lireReservations())

// Contenu de la grille : pour chaque créneau, une case par salle.
// Une case peut être :
//  - 'libre'   : personne n'a réservé la salle à cette heure ;
//  - 'debut'   : un rendez-vous commence ici (il s'étend sur « hauteur » lignes) ;
//  - 'couverte': la case est cachée sous un rendez-vous commencé plus haut.
const lignes = computed(() => {
  const date = dateISO(jourAffiche.value)
  const duJour = reservations.value.filter((r) => r.date === date)
  const liste = creneaux.value

  return liste.map((creneau, index) => ({
    creneau,
    cases: salles.map((salle) => {
      const r = duJour.find((r) => r.salleId === salle.id && r.debut <= creneau && creneau < r.fin)
      if (!r) return { salle, etat: 'libre' }
      // Le bloc commence au début du rendez-vous (ou à la première ligne s'il commence avant)
      if (r.debut !== creneau && index > 0) return { salle, etat: 'couverte' }
      const hauteur = liste.filter((c) => c >= creneau && c < r.fin).length
      return { salle, etat: 'debut', reservation: r, hauteur }
    })
  }))
})

// Type d'un rendez-vous (couleur, icône) ; les anciennes réservations sans type restent neutres
function typeDe(r) {
  return typesRendezVous.find((ty) => ty.id === r.type)
}

// Texte affiché dans un bloc : praticien, puis patient (ou motif pour une réunion)
function lignePraticien(r) {
  const p = trouverPraticien(r.praticienId)
  return p ? nomCourt(p) : ''
}
function ligneDetail(r) {
  return nomPatient(r) || r.motif || ''
}

// --- Formulaire de réservation ---
const formulaireOuvert = ref(false)
const valeursDepart = ref({})

// Bouton « Nouvelle réservation » : seule la date affichée est pré-remplie
function nouvelleReservation() {
  valeursDepart.value = { date: jourAffiche.value }
  formulaireOuvert.value = true
}

// Clic sur une case libre : salle, date et heure pré-remplies
function reserverCase(salle, creneau) {
  valeursDepart.value = { salleId: salle.id, date: jourAffiche.value, debut: creneau }
  formulaireOuvert.value = true
}

// Après l'enregistrement : on ajoute la réservation et on affiche son jour
function reservationAjoutee(nouvelle) {
  reservations.value = [...reservations.value, nouvelle]
  const [a, m, j] = nouvelle.date.split('-').map(Number)
  jourAffiche.value = new Date(a, m - 1, j)
}

// --- Détail et suppression ---
const detailOuvert = ref(false)
const reservationChoisie = ref(null)

function ouvrirDetail(r) {
  reservationChoisie.value = r
  detailOuvert.value = true
}

function reservationSupprimee(id) {
  reservations.value = reservations.value.filter((r) => r.id !== id)
}
</script>

<template>
  <section class="section">
    <div class="conteneur">
      <h1 class="titre-section">{{ $t('agenda.title') }}</h1>

      <!-- Barre d'outils : navigation entre les jours, choix de la date, nouvelle réservation -->
      <div class="outils">
        <Button
          icon="pi pi-chevron-left"
          severity="secondary"
          outlined
          :aria-label="$t('agenda.previousDay')"
          v-tooltip.bottom="$t('agenda.previousDay')"
          @click="jourPrecedent"
        />
        <DatePicker
          :modelValue="jourAffiche"
          :disabledDays="[0]"
          showIcon
          iconDisplay="input"
          :manualInput="false"
          :aria-label="$t('agenda.chooseDate')"
          class="selecteur-date"
          @update:modelValue="choisirDate"
        />
        <Button
          icon="pi pi-chevron-right"
          severity="secondary"
          outlined
          :aria-label="$t('agenda.nextDay')"
          v-tooltip.bottom="$t('agenda.nextDay')"
          @click="jourSuivant"
        />
        <Button
          :label="$t('agenda.today')"
          icon="pi pi-calendar"
          severity="secondary"
          outlined
          :disabled="estAujourdhui"
          @click="allerAujourdhui"
        />
        <Button :label="$t('booking.newBooking')" icon="pi pi-plus" class="bouton-nouveau" @click="nouvelleReservation" />
      </div>

      <!-- Date affichée en toutes lettres -->
      <h2 class="titre-jour">{{ titreJour }}</h2>

      <!-- Légende des types de rendez-vous -->
      <ul class="legende">
        <li v-for="ty in typesRendezVous" :key="ty.id">
          <TypeIcon :icone="ty.icone" :couleur="ty.couleur" />
          {{ $t('types.' + ty.id) }}
        </li>
      </ul>

      <!-- Jour de fermeture (ex. « Aujourd'hui » un dimanche) -->
      <Message v-if="creneaux.length === 0" severity="secondary" icon="pi pi-lock">
        {{ $t('agenda.closed') }}
      </Message>

      <!-- La grille : défile horizontalement sur petit écran -->
      <div v-else class="grille-defilement">
        <table class="grille">
          <thead>
            <tr>
              <th class="col-heure" scope="col">{{ $t('agenda.time') }}</th>
              <th
                v-for="salle in salles"
                :key="salle.id"
                scope="col"
                class="col-salle"
                :style="{ borderTopColor: salle.couleur }"
              >
                <Flower :color="salle.couleur" :size="18" aria-hidden="true" />
                {{ salle.nom }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ligne in lignes" :key="ligne.creneau">
              <th class="col-heure" scope="row">{{ formaterHeure(ligne.creneau) }}</th>

              <template v-for="c in ligne.cases" :key="c.salle.id">
                <!-- Case libre : un bouton qui ouvre le formulaire -->
                <td v-if="c.etat === 'libre'" class="case-libre">
                  <button
                    type="button"
                    class="bouton-case"
                    :aria-label="$t('booking.bookSlot', { room: c.salle.nom, time: formaterHeure(ligne.creneau) })"
                    @click="reserverCase(c.salle, ligne.creneau)"
                  >
                    <i class="pi pi-plus" aria-hidden="true"></i>
                  </button>
                </td>

                <!-- Rendez-vous : un bloc sur toute sa durée (rowspan) -->
                <td v-else-if="c.etat === 'debut'" :rowspan="c.hauteur" class="case-rdv">
                  <button
                    type="button"
                    class="rdv"
                    :style="{ '--couleur-type': typeDe(c.reservation)?.couleur ?? '#8a96a0' }"
                    :aria-label="
                      $t('booking.openBooking', {
                        details: [
                          `${formaterHeure(c.reservation.debut)}–${formaterHeure(c.reservation.fin)}`,
                          lignePraticien(c.reservation),
                          ligneDetail(c.reservation)
                        ].filter(Boolean).join(', ')
                      })
                    "
                    @click="ouvrirDetail(c.reservation)"
                  >
                    <span class="rdv-ligne rdv-praticien">
                      <TypeIcon
                        v-if="typeDe(c.reservation)"
                        :icone="typeDe(c.reservation).icone"
                        :couleur="typeDe(c.reservation).couleur"
                        :taille="14"
                      />
                      {{ lignePraticien(c.reservation) || $t('agenda.booked') }}
                    </span>
                    <span v-if="ligneDetail(c.reservation)" class="rdv-ligne rdv-detail">
                      {{ ligneDetail(c.reservation) }}
                    </span>
                  </button>
                </td>
                <!-- 'couverte' : rien à afficher, le bloc du dessus occupe la place -->
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Formulaire de réservation -->
    <ReservationForm
      v-model:visible="formulaireOuvert"
      :initial="valeursDepart"
      :reservations="reservations"
      @reserve="reservationAjoutee"
    />

    <!-- Détail d'un rendez-vous, avec suppression -->
    <ReservationDetails
      v-model:visible="detailOuvert"
      :reservation="reservationChoisie"
      :dateTexte="titreJour"
      @supprime="reservationSupprimee"
    />
  </section>
</template>

<style scoped>
.outils {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.selecteur-date {
  width: 11rem;
}
/* Le bouton « Nouvelle réservation » est poussé à droite */
.bouton-nouveau {
  margin-left: auto;
}
.titre-jour {
  color: var(--couleur-principale);
  font-size: 1.3rem;
  margin: 1.25rem 0 0.5rem;
}
.legende {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--texte-doux);
}
.legende li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* Conteneur qui permet de faire défiler la grille sur mobile */
.grille-defilement {
  overflow-x: auto;
  background: #ffffff;
  border: 1px solid var(--bordure);
  border-radius: 8px;
}
.grille {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
}
.grille th,
.grille td {
  border-bottom: 1px solid var(--bordure);
  border-left: 1px solid var(--bordure);
  height: 2.6rem;
}
.grille th {
  padding: 0.35rem 0.5rem;
}
.grille thead th {
  background: #ffffff;
  font-weight: 600;
  color: var(--couleur-principale);
}
/* En-tête de salle : bordure du haut à la couleur de la fleur (accent discret) */
.col-salle {
  border-top: 4px solid;
  text-align: center;
}
.col-salle svg {
  vertical-align: -3px;
  margin-right: 0.25rem;
}
.col-heure {
  width: 5rem;
  border-left: none !important;
  color: var(--texte-doux);
  font-weight: 500;
  text-align: right;
  font-variant-numeric: tabular-nums;
  vertical-align: top;
}
/* Ligne de l'heure pleine plus marquée que la demi-heure */
.grille tbody tr:nth-child(odd) > * {
  border-top: 1px solid #cfd8cf;
}

/* Case libre : le bouton remplit toute la case, le « + » apparaît au survol */
.case-libre {
  padding: 0;
}
.bouton-case {
  width: 100%;
  height: 100%;
  min-height: 2.6rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: transparent;
}
.bouton-case:hover,
.bouton-case:focus-visible {
  background: #eef3f8;
  color: var(--couleur-principale);
}
.bouton-case:focus-visible {
  outline: 2px solid var(--couleur-principale);
  outline-offset: -2px;
}

/* Rendez-vous : bloc teinté de la couleur de son type, avec une bordure à gauche */
.case-rdv {
  padding: 2px;
  vertical-align: top;
}
.rdv {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1px;
  width: 100%;
  height: 100%;
  min-height: calc(2.6rem - 4px);
  padding: 0.2rem 0.4rem;
  border: none;
  border-left: 4px solid var(--couleur-type);
  border-radius: 4px;
  /* Fond très clair : la couleur du type mélangée à du blanc */
  background: color-mix(in srgb, var(--couleur-type) 14%, #ffffff);
  color: var(--texte);
  text-align: left;
  font: inherit;
  cursor: pointer;
  overflow: hidden;
}
.rdv:hover {
  background: color-mix(in srgb, var(--couleur-type) 24%, #ffffff);
}
.rdv:focus-visible {
  outline: 2px solid var(--couleur-principale);
  outline-offset: 1px;
}
/* Une ligne de texte, coupée avec « … » si elle est trop longue */
.rdv-ligne {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.78rem;
  line-height: 1.2;
}
.rdv-praticien {
  font-weight: 600;
  color: var(--couleur-principale);
}
.rdv-praticien svg {
  vertical-align: -2px;
  margin-right: 0.15rem;
}
.rdv-detail {
  color: var(--texte-doux);
}
</style>
