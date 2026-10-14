// Lecture et écriture des réservations dans le localStorage du navigateur.
// Une réservation ressemble à :
//   { id, salleId: 'lavande', date: '2026-10-14', debut: '09:00', fin: '09:30' }

import { dateISO } from './dates.js'

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

// Nombre de réservations d'une salle pour une date donnée
export function compterReservations(salleId, date) {
  return lireReservations().filter((r) => r.salleId === salleId && r.date === date).length
}

// Date du jour au format AAAA-MM-JJ
export function dateDuJour() {
  return dateISO(new Date())
}

// Réservation d'une salle qui occupe un créneau donné (ou undefined si libre).
// Un créneau '09:00' est occupé par une réservation 09:00–10:00, par exemple.
export function reservationDuCreneau(reservations, salleId, date, creneau) {
  return reservations.find(
    (r) => r.salleId === salleId && r.date === date && r.debut <= creneau && creneau < r.fin
  )
}
