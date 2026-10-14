<script setup>
// Page Agenda : pour l'instant, une page d'attente avec la date du jour.
// Le planning des réservations (créneaux de 30 minutes) viendra ici.
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Message from 'primevue/message'
import { formatLocal } from '../i18n.js'

const { locale } = useI18n()

// Date du jour au format local suisse, recalculée quand la langue change
const dateTexte = computed(() => {
  locale.value // dépendance : on recalcule si la langue change
  return new Intl.DateTimeFormat(formatLocal(), { dateStyle: 'full' }).format(new Date())
})
</script>

<template>
  <section class="section">
    <div class="conteneur">
      <h1 class="titre-section">{{ $t('agenda.title') }}</h1>
      <p>{{ $t('agenda.today', { date: dateTexte }) }}</p>
      <Message severity="info" icon="pi pi-info-circle">{{ $t('agenda.comingSoon') }}</Message>
    </div>
  </section>
</template>
