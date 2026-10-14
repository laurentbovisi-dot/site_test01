<script setup>
// Fenêtre de détail d'une réservation, avec un bouton pour la supprimer.
// Elle s'ouvre quand on clique sur un rendez-vous dans la grille.
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { Flower } from 'lucide-vue-next'
import TypeIcon from './TypeIcon.vue'
import { salles, typesRendezVous } from '../config.js'
import { supprimerReservation } from '../storage.js'
import { formaterHeure, trouverPraticien, nomComplet, nomPatient } from '../format.js'

const props = defineProps({
  reservation: { type: Object, default: null },
  // La date en toutes lettres, pour l'affichage
  dateTexte: { type: String, default: '' }
})

const visible = defineModel('visible', { type: Boolean, default: false })

// Émis après une suppression réussie, avec l'identifiant de la réservation
const emit = defineEmits(['supprime'])

const erreur = ref(false)
watch(visible, (ouvert) => {
  if (ouvert) erreur.value = false
})

// Informations à afficher, retrouvées dans la configuration
const salle = computed(() => salles.find((s) => s.id === props.reservation?.salleId))
const praticien = computed(() => trouverPraticien(props.reservation?.praticienId))
const typeRdv = computed(() => typesRendezVous.find((ty) => ty.id === props.reservation?.type))

function supprimer() {
  if (!supprimerReservation(props.reservation.id)) {
    erreur.value = true
    return
  }
  emit('supprime', props.reservation.id)
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="$t('booking.detailsTitle')" :style="{ width: '28rem' }" :breakpoints="{ '575px': '94vw' }">
    <dl v-if="reservation" class="details">
      <template v-if="typeRdv">
        <dt>{{ $t('booking.type') }}</dt>
        <dd class="ligne-icone">
          <TypeIcon :icone="typeRdv.icone" :couleur="typeRdv.couleur" />
          {{ $t('types.' + typeRdv.id) }}
        </dd>
      </template>

      <dt>{{ $t('booking.room') }}</dt>
      <dd class="ligne-icone">
        <Flower v-if="salle" :color="salle.couleur" :size="16" aria-hidden="true" />
        {{ salle?.nom }}
      </dd>

      <dt>{{ $t('booking.date') }}</dt>
      <dd>{{ dateTexte }}</dd>

      <dt>{{ $t('booking.time') }}</dt>
      <dd>{{ formaterHeure(reservation.debut) }} – {{ formaterHeure(reservation.fin) }}</dd>

      <template v-if="praticien">
        <dt>{{ $t('booking.practitioner') }}</dt>
        <dd>
          {{ nomComplet(praticien) }}
          <span class="specialite">{{ $t('specialties.' + praticien.specialite) }}</span>
        </dd>
      </template>

      <template v-if="nomPatient(reservation)">
        <dt>{{ $t('booking.patient') }}</dt>
        <dd>{{ nomPatient(reservation) }}</dd>
      </template>

      <template v-if="reservation.motif">
        <dt>{{ $t('booking.reason') }}</dt>
        <dd>{{ reservation.motif }}</dd>
      </template>
    </dl>

    <Message v-if="erreur" severity="error" icon="pi pi-times-circle">{{ $t('booking.deleteError') }}</Message>

    <template #footer>
      <Button :label="$t('booking.close')" severity="secondary" text @click="visible = false" />
      <!-- Pas de rouge : il est réservé aux erreurs -->
      <Button :label="$t('booking.delete')" icon="pi pi-trash" severity="secondary" outlined @click="supprimer" />
    </template>
  </Dialog>
</template>

<style scoped>
.details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}
dt {
  font-size: 0.9rem;
  color: var(--texte-doux);
}
dd {
  margin: 0;
  font-weight: 600;
  color: var(--couleur-principale);
}
.ligne-icone {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.specialite {
  display: block;
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--couleur-secondaire);
}
</style>
