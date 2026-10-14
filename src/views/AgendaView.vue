<script setup>
// Page Agenda : grille quotidienne des salles.
// Une colonne par salle, une ligne par créneau de 30 minutes,
// selon les horaires d'ouverture du jour affiché.
// Un clic sur une case libre ouvre la fenêtre de réservation.
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import { Flower } from 'lucide-vue-next'
import ReservationDialog from '../components/ReservationDialog.vue'
import { salles, praticiens, horaires } from '../config.js'
import { formatLocal } from '../i18n.js'
import {
  aujourdhui,
  estDimanche,
  jourOuvrableVoisin,
  dateEnToutesLettres,
  creneauxDuJour,
  dateISO,
  cleJour
} from '../dates.js'
import { lireReservations, reservationDuCreneau } from '../storage.js'

const { locale } = useI18n()

// Jour affiché (au départ : aujourd'hui)
const jourAffiche = ref(aujourdhui())

// Boutons de navigation
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

// Date en toutes lettres, recalculée quand la langue ou le jour changent
const titreJour = computed(() => {
  locale.value // dépendance : on recalcule si la langue change
  return dateEnToutesLettres(jourAffiche.value, formatLocal())
})

// Créneaux du jour affiché (liste vide si le centre est fermé)
const creneaux = computed(() => creneauxDuJour(jourAffiche.value))

// Heure d'un créneau au format local suisse ('08:30' → « 08:30 »)
function formaterHeure(creneau) {
  locale.value // dépendance : on recalcule si la langue change
  const [h, m] = creneau.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  return new Intl.DateTimeFormat(formatLocal(), { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Réservations enregistrées dans le navigateur.
// ref() : la grille se met à jour toute seule quand on en ajoute une.
const reservations = ref(lireReservations())

// Réservation qui occupe une case de la grille (ou undefined si la case est libre)
function reservation(salle, creneau) {
  return reservationDuCreneau(reservations.value, salle.id, dateISO(jourAffiche.value), creneau)
}

// Nom court du praticien d'une réservation : « Dre Chappuis », « Sophie Cuendet »
function nomPraticien(r) {
  const p = praticiens.find((p) => p.id === r.praticienId)
  if (!p) return ''
  return p.titre ? `${p.titre} ${p.nom}` : `${p.prenom} ${p.nom}`
}

// --- Réservation d'un créneau ---

// Ce qui a été cliqué : la salle et le créneau de début
const fenetreOuverte = ref(false)
const salleChoisie = ref(null)
const debutChoisi = ref('')

// Clic sur une case libre : on ouvre la fenêtre de réservation
function ouvrirReservation(salle, creneau) {
  salleChoisie.value = salle
  debutChoisi.value = creneau
  fenetreOuverte.value = true
}

// Heures de fin possibles : de 30 minutes après le début
// jusqu'à la prochaine réservation de la salle ou jusqu'à la fermeture.
const finsPossibles = computed(() => {
  if (!salleChoisie.value) return []
  const liste = creneaux.value
  const fermeture = horaires[cleJour(jourAffiche.value)]?.fermeture
  const fins = []
  for (let i = liste.indexOf(debutChoisi.value); i >= 0 && i < liste.length; i++) {
    if (reservation(salleChoisie.value, liste[i])) break // créneau déjà pris : on s'arrête
    fins.push(liste[i + 1] ?? fermeture) // fin = début du créneau suivant (ou fermeture)
  }
  return fins
})

// Après l'enregistrement : on ajoute la réservation à la grille
function reservationAjoutee(nouvelle) {
  reservations.value = [...reservations.value, nouvelle]
}

// Date en toutes lettres avec une majuscule, pour la fenêtre de réservation
const titreJourMajuscule = computed(() => titreJour.value.charAt(0).toUpperCase() + titreJour.value.slice(1))
</script>

<template>
  <section class="section">
    <div class="conteneur">
      <h1 class="titre-section">{{ $t('agenda.title') }}</h1>

      <!-- Barre d'outils : navigation entre les jours et choix de la date -->
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
          :disabled="estAujourdhui"
          @click="allerAujourdhui"
        />
      </div>

      <!-- Date affichée en toutes lettres -->
      <h2 class="titre-jour">{{ titreJour }}</h2>

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
            <tr v-for="creneau in creneaux" :key="creneau">
              <th class="col-heure" scope="row">{{ formaterHeure(creneau) }}</th>
              <td v-for="salle in salles" :key="salle.id" :class="{ reservee: reservation(salle, creneau) }">
                <!-- Case réservée : nom du praticien sur la première case de la réservation -->
                <span v-if="reservation(salle, creneau)" :title="$t('agenda.booked')">
                  <template v-if="reservation(salle, creneau).debut === creneau">
                    {{ nomPraticien(reservation(salle, creneau)) || $t('agenda.booked') }}
                  </template>
                </span>
                <!-- Case libre : un bouton qui ouvre la fenêtre de réservation -->
                <button
                  v-else
                  type="button"
                  class="case-libre"
                  :aria-label="$t('booking.bookSlot', { room: salle.nom, time: formaterHeure(creneau) })"
                  @click="ouvrirReservation(salle, creneau)"
                >
                  <i class="pi pi-plus" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Fenêtre de réservation (ouverte au clic sur une case libre) -->
    <ReservationDialog
      v-model:visible="fenetreOuverte"
      :salle="salleChoisie"
      :date="dateISO(jourAffiche)"
      :dateTexte="titreJourMajuscule"
      :debut="debutChoisi"
      :finsPossibles="finsPossibles"
      :formaterHeure="formaterHeure"
      @reserve="reservationAjoutee"
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
.titre-jour {
  color: var(--couleur-principale);
  font-size: 1.3rem;
  margin: 1.25rem 0 1rem;
}
/* Première lettre en majuscule (« samedi » → « Samedi ») */
.titre-jour::first-letter {
  text-transform: uppercase;
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
  min-width: 560px;
  border-collapse: collapse;
  table-layout: fixed;
}
.grille th,
.grille td {
  border-bottom: 1px solid var(--bordure);
  border-left: 1px solid var(--bordure);
  padding: 0.35rem 0.5rem;
  height: 2.4rem;
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
}
/* Ligne de l'heure pleine plus marquée que la demi-heure */
.grille tbody tr:nth-child(odd) th,
.grille tbody tr:nth-child(odd) td {
  border-top: 1px solid #cfd8cf;
}
.grille tbody tr:hover td {
  background: #f4f7f4;
}
/* Case réservée */
.reservee {
  background: #eef3f8 !important;
  color: var(--couleur-principale);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
/* Case libre : le bouton remplit toute la case, le « + » apparaît au survol */
.grille td:not(.reservee) {
  padding: 0;
}
.case-libre {
  width: 100%;
  height: 100%;
  min-height: 2.4rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: transparent;
}
.case-libre:hover,
.case-libre:focus-visible {
  background: #eef3f8;
  color: var(--couleur-principale);
}
.case-libre:focus-visible {
  outline: 2px solid var(--couleur-principale);
  outline-offset: -2px;
}
</style>
