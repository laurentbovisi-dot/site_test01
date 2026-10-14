<script setup>
// Formulaire de réservation d'une salle, dans une fenêtre.
// Il s'ouvre avec le bouton « Nouvelle réservation » ou en cliquant sur une case libre
// de la grille (la salle, la date et l'heure sont alors déjà remplies).
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { Flower } from 'lucide-vue-next'
import TypeIcon from './TypeIcon.vue'
import { salles, praticiens, durees, typesRendezVous } from '../config.js'
import { creneauxDuJour, ajouterMinutes, dateISO, aujourdhui } from '../dates.js'
import { ajouterReservation } from '../storage.js'
import { formaterHeure, nomComplet, trouverPraticien, nomPatient } from '../format.js'
import { validerReservation, typeAvecPatient } from '../validation.js'

const props = defineProps({
  // Valeurs de départ : { salleId, date (objet Date), debut ('09:00') }
  initial: { type: Object, default: () => ({}) },
  // Toutes les réservations existantes (pour détecter les conflits)
  reservations: { type: Array, default: () => [] }
})

// v-model:visible pour ouvrir / fermer la fenêtre
const visible = defineModel('visible', { type: Boolean, default: false })

// Émis après un enregistrement réussi, avec la nouvelle réservation
const emit = defineEmits(['reserve'])

const { t } = useI18n()

// --- Champs du formulaire ---
const salleId = ref(null)
const date = ref(null)
const debut = ref(null)
const duree = ref(durees[0])
const praticienId = ref(null)
const type = ref(typesRendezVous[0].id)
const patientNom = ref('')
const patientPrenom = ref('')
const motif = ref('')
const erreurEnregistrement = ref(false)
// Devient vrai au premier clic sur « Réserver » : on affiche alors les champs manquants
const tentative = ref(false)

// À chaque ouverture : on remet le formulaire à zéro avec les valeurs de départ
watch(visible, (ouvert) => {
  if (!ouvert) return
  salleId.value = props.initial.salleId ?? null
  date.value = props.initial.date ?? null
  debut.value = props.initial.debut ?? null
  duree.value = durees[0]
  praticienId.value = null
  type.value = typesRendezVous[0].id
  patientNom.value = ''
  patientPrenom.value = ''
  motif.value = ''
  erreurEnregistrement.value = false
  tentative.value = false
})

// --- Listes des menus déroulants ---

// Heures de début possibles pour la date choisie
const creneaux = computed(() => (date.value ? creneauxDuJour(date.value) : []))
const optionsDebut = computed(() => creneaux.value.map((h) => ({ valeur: h, texte: formaterHeure(h) })))

// Si on change de date et que l'heure choisie n'existe plus ce jour-là, on la vide
watch(creneaux, (liste) => {
  if (debut.value && !liste.includes(debut.value)) debut.value = null
})

const optionsDurees = computed(() => durees.map((n) => ({ valeur: n, texte: t('booking.minutes', { n }) })))

// Praticiens avec leur spécialité (traduite)
const optionsPraticiens = computed(() =>
  praticiens.map((p) => {
    const specialite = t('specialties.' + p.specialite)
    return { id: p.id, nom: nomComplet(p), specialite, libelle: `${nomComplet(p)} – ${specialite}` }
  })
)

const optionsTypes = computed(() => typesRendezVous.map((ty) => ({ ...ty, libelle: t('types.' + ty.id) })))

// --- Règles du formulaire (voir validation.js) ---

// Le type choisi demande-t-il un patient ? (non pour une réunion)
const avecPatient = computed(() => typeAvecPatient(type.value))

// Heure de fin calculée : début + durée
const fin = computed(() => (debut.value ? ajouterMinutes(debut.value, duree.value) : null))

// Résultat de la validation, recalculé à chaque changement d'un champ
const validation = computed(() =>
  validerReservation(
    {
      salleId: salleId.value,
      date: date.value,
      debut: debut.value,
      duree: duree.value,
      praticienId: praticienId.value,
      type: type.value,
      patientNom: patientNom.value,
      patientPrenom: patientPrenom.value,
      motif: motif.value
    },
    props.reservations,
    new Date()
  )
)

// Message d'un champ obligatoire vide (affiché seulement après un clic sur « Réserver »)
function erreurChamp(champ) {
  return tentative.value && validation.value.champs[champ] ? t('validation.required.' + champ) : ''
}

// Texte clair pour chaque règle non respectée
function texteRegle(regle) {
  const c = regle.conflit
  // Infos sur la réservation en conflit : horaire et salle
  const infos = c
    ? { start: formaterHeure(c.debut), end: formaterHeure(c.fin), room: salles.find((s) => s.id === c.salleId)?.nom }
    : {}
  switch (regle.code) {
    case 'dimanche':
      return t('validation.sunday')
    case 'jourFerme':
      return t('validation.closedDay')
    case 'passe':
      return t('validation.past')
    case 'avantOuverture':
      return t('validation.beforeOpening', { time: formaterHeure(regle.heure) })
    case 'apresFermeture':
      return t('validation.afterClosing', { time: formaterHeure(regle.heure), end: formaterHeure(fin.value) })
    case 'salleOccupee':
      return t('validation.roomTaken', infos)
    case 'praticienOccupe':
      return t('validation.practitionerBusy', { ...infos, name: nomComplet(trouverPraticien(c.praticienId)) })
    case 'patientOccupe':
      return t('validation.patientBusy', { ...infos, name: nomPatient(c) })
    default:
      return ''
  }
}

// Règles non respectées, traduites (affichées en rouge dès qu'elles apparaissent)
const messagesRegles = computed(() => validation.value.regles.map(texteRegle))

// Vrai s'il manque au moins un champ obligatoire
const champsManquants = computed(() => Object.keys(validation.value.champs).length > 0)

// La réservation peut être enregistrée s'il n'y a aucune erreur
const estValide = computed(() => !champsManquants.value && messagesRegles.value.length === 0)

// --- Validation ---
function reserver() {
  tentative.value = true // affiche les messages des champs manquants
  if (!estValide.value) return
  const reservation = ajouterReservation({
    salleId: salleId.value,
    date: dateISO(date.value),
    debut: debut.value,
    fin: fin.value,
    praticienId: praticienId.value,
    type: type.value,
    // Pour une réunion, on n'enregistre pas de patient
    patientNom: avecPatient.value ? patientNom.value.trim() : '',
    patientPrenom: avecPatient.value ? patientPrenom.value.trim() : '',
    motif: motif.value.trim()
  })
  if (!reservation) {
    erreurEnregistrement.value = true
    return
  }
  emit('reserve', reservation)
  visible.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="$t('booking.dialogTitle')"
    :style="{ width: '36rem' }"
    :breakpoints="{ '640px': '96vw' }"
  >
    <form class="formulaire" @submit.prevent="reserver">
      <!-- Salle -->
      <div class="champ">
        <label for="resa-salle">{{ $t('booking.room') }}</label>
        <Select
          v-model="salleId"
          inputId="resa-salle"
          :options="salles"
          optionLabel="nom"
          optionValue="id"
          :placeholder="$t('booking.chooseRoom')"
          :invalid="Boolean(erreurChamp('salleId'))"
          fluid
        >
          <template #option="{ option }">
            <span class="ligne-icone">
              <Flower :color="option.couleur" :size="16" aria-hidden="true" />
              {{ option.nom }}
            </span>
          </template>
        </Select>
        <small v-if="erreurChamp('salleId')" class="erreur-champ">{{ erreurChamp('salleId') }}</small>
      </div>

      <!-- Date et heure de début, côte à côte -->
      <div class="deux-colonnes">
        <div class="champ">
          <label for="resa-date">{{ $t('booking.date') }}</label>
          <DatePicker
            v-model="date"
            inputId="resa-date"
            :disabledDays="[0]"
            :minDate="aujourdhui()"
            showIcon
            iconDisplay="input"
            :manualInput="false"
            appendTo="body"
            :invalid="Boolean(erreurChamp('date'))"
            fluid
          />
          <small v-if="erreurChamp('date')" class="erreur-champ">{{ erreurChamp('date') }}</small>
        </div>
        <div class="champ">
          <label for="resa-debut">{{ $t('booking.start') }}</label>
          <Select
            v-model="debut"
            inputId="resa-debut"
            :options="optionsDebut"
            optionLabel="texte"
            optionValue="valeur"
            :placeholder="$t('booking.chooseStart')"
            :invalid="Boolean(erreurChamp('debut'))"
            fluid
          />
          <small v-if="erreurChamp('debut')" class="erreur-champ">{{ erreurChamp('debut') }}</small>
        </div>
      </div>

      <!-- Durée -->
      <div class="champ">
        <span class="etiquette" id="resa-duree">{{ $t('booking.duration') }}</span>
        <SelectButton
          v-model="duree"
          :options="optionsDurees"
          optionLabel="texte"
          optionValue="valeur"
          :allowEmpty="false"
          aria-labelledby="resa-duree"
        />
      </div>

      <!-- Praticien, avec sa spécialité -->
      <div class="champ">
        <label for="resa-praticien">{{ $t('booking.practitioner') }}</label>
        <Select
          v-model="praticienId"
          inputId="resa-praticien"
          :options="optionsPraticiens"
          optionLabel="libelle"
          optionValue="id"
          :placeholder="$t('booking.choosePractitioner')"
          :invalid="Boolean(erreurChamp('praticienId'))"
          fluid
        >
          <template #option="{ option }">
            <div>
              <div>{{ option.nom }}</div>
              <div class="specialite">{{ option.specialite }}</div>
            </div>
          </template>
        </Select>
        <small v-if="erreurChamp('praticienId')" class="erreur-champ">{{ erreurChamp('praticienId') }}</small>
      </div>

      <!-- Type de rendez-vous -->
      <div class="champ">
        <span class="etiquette" id="resa-type">{{ $t('booking.type') }}</span>
        <SelectButton
          v-model="type"
          :options="optionsTypes"
          optionLabel="libelle"
          optionValue="id"
          :allowEmpty="false"
          aria-labelledby="resa-type"
        >
          <template #option="{ option }">
            <span class="ligne-icone">
              <TypeIcon :icone="option.icone" :couleur="option.couleur" />
              {{ option.libelle }}
            </span>
          </template>
        </SelectButton>
      </div>

      <!-- Patient : masqué pour une réunion -->
      <template v-if="avecPatient">
        <div class="deux-colonnes">
          <div class="champ">
            <label for="resa-nom">{{ $t('booking.patientLastName') }}</label>
            <InputText id="resa-nom" v-model="patientNom" autocomplete="off" :invalid="Boolean(erreurChamp('patientNom'))" fluid />
            <small v-if="erreurChamp('patientNom')" class="erreur-champ">{{ erreurChamp('patientNom') }}</small>
          </div>
          <div class="champ">
            <label for="resa-prenom">{{ $t('booking.patientFirstName') }}</label>
            <InputText id="resa-prenom" v-model="patientPrenom" autocomplete="off" :invalid="Boolean(erreurChamp('patientPrenom'))" fluid />
            <small v-if="erreurChamp('patientPrenom')" class="erreur-champ">{{ erreurChamp('patientPrenom') }}</small>
          </div>
        </div>
        <p class="avertissement">
          <i class="pi pi-info-circle" aria-hidden="true"></i>
          {{ $t('booking.fictionalNotice') }}
        </p>
      </template>

      <!-- Motif -->
      <div class="champ">
        <label for="resa-motif">{{ $t('booking.reason') }}</label>
        <Textarea
          id="resa-motif"
          v-model="motif"
          rows="2"
          autoResize
          :placeholder="$t('booking.reasonPlaceholder')"
          :invalid="Boolean(erreurChamp('motif'))"
          fluid
        />
        <small v-if="erreurChamp('motif')" class="erreur-champ">{{ erreurChamp('motif') }}</small>
      </div>

      <!-- Règles non respectées (en rouge : couleur réservée aux erreurs) -->
      <Message v-for="message in messagesRegles" :key="message" severity="error" icon="pi pi-exclamation-circle">
        {{ message }}
      </Message>
      <!-- Rappel général s'il manque des champs après un clic sur « Réserver » -->
      <Message v-if="tentative && champsManquants" severity="error" icon="pi pi-exclamation-circle">
        {{ $t('validation.summary') }}
      </Message>
      <Message v-if="erreurEnregistrement" severity="error" icon="pi pi-times-circle">
        {{ $t('booking.saveError') }}
      </Message>

      <!-- Bouton caché pour valider avec la touche Entrée -->
      <button type="submit" hidden></button>
    </form>

    <template #footer>
      <Button :label="$t('booking.cancel')" severity="secondary" text @click="visible = false" />
      <Button :label="$t('booking.confirm')" icon="pi pi-check" @click="reserver" />
    </template>
  </Dialog>
</template>

<style scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.champ {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.champ label,
.etiquette {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--texte-doux);
}
/* Deux champs côte à côte, l'un sous l'autre sur petit écran */
.deux-colonnes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
@media (max-width: 520px) {
  .deux-colonnes {
    grid-template-columns: 1fr;
  }
}
/* Les boutons de choix (durée, type) passent à la ligne sur petit écran */
.champ :deep(.p-selectbutton) {
  flex-wrap: wrap;
}
.ligne-icone {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.specialite {
  font-size: 0.85rem;
  color: var(--couleur-secondaire);
}
/* Message d'erreur sous un champ (rouge : réservé aux erreurs) */
.erreur-champ {
  color: var(--p-red-600, #dc2626);
  font-size: 0.85rem;
}
.avertissement {
  margin: -0.4rem 0 0;
  font-size: 0.85rem;
  color: var(--texte-doux);
}
</style>
