<script setup>
// Icône Lucide d'un type de rendez-vous (consultation, examen, réunion).
// Le nom de l'icône vient de la configuration (typesRendezVous).
import { Stethoscope, Microscope, Users, CalendarCheck } from 'lucide-vue-next'

defineProps({
  icone: { type: String, default: '' },
  couleur: { type: String, default: 'currentColor' },
  taille: { type: Number, default: 16 }
})

// Correspondance entre le nom donné dans la configuration et le composant Lucide
const icones = {
  stethoscope: Stethoscope,
  microscope: Microscope,
  users: Users
}
</script>

<template>
  <component :is="icones[icone] ?? CalendarCheck" :color="couleur" :size="taille" aria-hidden="true" />
</template>
