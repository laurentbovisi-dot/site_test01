<script setup>
// Fenêtre de réservation d'un créneau.
// Elle s'ouvre quand on clique sur une case libre de la grille de l'agenda.
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { Flower } from 'lucide-vue-next'
import { praticiens } from '../config.js'
import { ajouterReservation } from '../storage.js'

const props = defineProps({
  // La salle choisie (objet de la configuration)
  salle: { type: Object, default: null },
  // La date au format AAAA-MM-JJ
  date: { type: String, default: '' },
  // La date en toutes lettres, pour l'affichage (ex. « Samedi 17 octobre 2026 »)
  dateTexte: { type: String, default: '' },
  // Le créneau cliqué, ex. '09:00'
  debut: { type: String, default: '' },
  // Heures de fin possibles, ex. ['09:30', '10:00', …] (calculées par l'agenda)
  finsPossibles: { type: Array, default: () => [] },
  // Fonction qui met une heure '09:00' au format local suisse
  formaterHeure: { type: Function, required: true }
})

// v-model:visible pour ouvrir / fermer la fenêtre
const visible = defineModel('visible', { type: Boolean, default: false })

// Émis après un enregistrement réussi, avec la nouvelle réservation
const emit = defineEmits(['reserve'])

// Champs du formulaire
const fin = ref('')
const praticienId = ref(null)
const erreur = ref(false)

// À chaque ouverture : on remet le formulaire à zéro (fin par défaut = 30 minutes)
watch(visible, (ouvert) => {
  if (ouvert) {
    fin.value = props.finsPossibles[0] ?? ''
    praticienId.value = null
    erreur.value = false
  }
})

// Liste des praticiens pour le menu déroulant
const optionsPraticiens = praticiens.map((p) => ({
  id: p.id,
  nom: [p.titre, p.prenom, p.nom].filter(Boolean).join(' ')
}))

// Liste des heures de fin pour le menu déroulant
const optionsFins = computed(() =>
  props.finsPossibles.map((h) => ({ valeur: h, texte: props.formaterHeure(h) }))
)

// Le bouton « Réserver » n'est actif que si tout est rempli
const formulaireComplet = computed(() => Boolean(fin.value && praticienId.value))

function reserver() {
  const reservation = ajouterReservation({
    salleId: props.salle.id,
    date: props.date,
    debut: props.debut,
    fin: fin.value,
    praticienId: praticienId.value
  })
  if (!reservation) {
    erreur.value = true // affiche le message d'erreur (en rouge)
    return
  }
  emit('reserve', reservation)
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="$t('booking.dialogTitle')" :style="{ width: '28rem' }" :breakpoints="{ '575px': '94vw' }">
    <div v-if="salle" class="formulaire">
      <!-- Récapitulatif : salle, date, heure de début -->
      <div class="recap">
        <div>
          <span class="etiquette">{{ $t('booking.room') }}</span>
          <span class="valeur">
            <Flower :color="salle.couleur" :size="18" aria-hidden="true" />
            {{ salle.nom }}
          </span>
        </div>
        <div>
          <span class="etiquette">{{ $t('booking.date') }}</span>
          <span class="valeur">{{ dateTexte }}</span>
        </div>
        <div>
          <span class="etiquette">{{ $t('booking.start') }}</span>
          <span class="valeur">{{ formaterHeure(debut) }}</span>
        </div>
      </div>

      <!-- Heure de fin -->
      <label for="reservation-fin" class="etiquette">{{ $t('booking.end') }}</label>
      <Select v-model="fin" inputId="reservation-fin" :options="optionsFins" optionLabel="texte" optionValue="valeur" fluid />

      <!-- Praticien -->
      <label for="reservation-praticien" class="etiquette">{{ $t('booking.practitioner') }}</label>
      <Select
        v-model="praticienId"
        inputId="reservation-praticien"
        :options="optionsPraticiens"
        optionLabel="nom"
        optionValue="id"
        :placeholder="$t('booking.choosePractitioner')"
        fluid
      />

      <Message v-if="erreur" severity="error" icon="pi pi-times-circle">{{ $t('booking.saveError') }}</Message>
    </div>

    <template #footer>
      <Button :label="$t('booking.cancel')" severity="secondary" text @click="visible = false" />
      <Button :label="$t('booking.confirm')" icon="pi pi-check" :disabled="!formulaireComplet" @click="reserver" />
    </template>
  </Dialog>
</template>

<style scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.recap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f4f7f4;
  border-radius: 6px;
}
.recap > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.etiquette {
  font-size: 0.9rem;
  color: var(--texte-doux);
}
.valeur {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  color: var(--couleur-principale);
}
</style>
