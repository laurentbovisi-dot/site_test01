// Lecture et écriture des réservations dans le localStorage du navigateur.
// Une réservation ressemble à :
//   { id, salleId: 'lavande', date: '2026-10-14', debut: '09:00', fin: '09:30' }

const CLE_RESERVATIONS = 'agenda-salles.reservations'

// Renvoie la liste de toutes les réservations enregistrées
export function lireReservations() {
  try {
    const texte = localStorage.getItem(CLE_RESERVATIONS)
    return texte ? JSON.parse(texte) : []
  } catch {
    // localStorage indisponible ou contenu illisible : on repart de zéro
    return []
  }
}

// Enregistre la liste complète des réservations
export function ecrireReservations(reservations) {
  try {
    localStorage.setItem(CLE_RESERVATIONS, JSON.stringify(reservations))
  } catch {
    // localStorage indisponible (navigation privée, etc.) : on ignore
  }
}

// Date du jour au format AAAA-MM-JJ (heure locale)
export function dateDuJour() {
  const d = new Date()
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

// Nombre de réservations d'une salle pour une date donnée
export function compterReservations(salleId, date) {
  return lireReservations().filter((r) => r.salleId === salleId && r.date === date).length
}
