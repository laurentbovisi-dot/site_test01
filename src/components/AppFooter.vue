<script setup>
// Pied de page : adresse, téléphone et mention « données fictives ».
import { etablissement } from '../config.js'

// Numéro au format international pour le lien « tel: » (021 → +4121)
const lienTelephone = 'tel:+41' + etablissement.telephone.replace(/\s/g, '').slice(1)
</script>

<template>
  <footer class="pied">
    <div class="conteneur pied-interieur">
      <div>
        <strong>{{ etablissement.nom }}</strong><br />
        <i class="pi pi-map-marker" aria-hidden="true"></i> {{ etablissement.adresse }}<br />
        <i class="pi pi-phone" aria-hidden="true"></i>
        {{ $t('footer.phone') }} <a :href="lienTelephone">{{ etablissement.telephone }}</a>
      </div>
      <p class="mention">{{ $t('footer.demo') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.pied {
  background: var(--couleur-principale);
  color: #ffffff;
  padding: 1.5rem 0;
  font-size: 0.95rem;
}
.pied-interieur {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}
.pied a {
  color: #ffffff;
}
.mention {
  margin: 0;
  font-style: italic;
  opacity: 0.85;
}
</style>
