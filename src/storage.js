// Lecture et écriture des réservations dans le localStorage du navigateur.
// Une réservation ressemble à :
//   { id, salleId: 'lavande', date: '2026-10-14', debut: '09:00', fin: '09:30', praticienId: 'rochat' }

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

// Enregistre la liste complète des réservations.
// Renvoie true si l'enregistrement a réussi, false sinon.
export function ecrireReservations(reservations) {
  try {
    localStorage.setItem(CLE_RESERVATIONS, JSON.stringify(reservations))
    return true
  } catch {
    // localStorage indisponible (navigation privée, stockage plein, etc.)
    return false
  }
}

// Ajoute une réservation et l'enregistre.
// Renvoie la réservation créée (avec son identifiant), ou null en cas d'échec.
export function ajouterReservation(reservation) {
  const nouvelle = {
    // Identifiant unique : l'heure actuelle + un peu de hasard
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...reservation
  }
  const ok = ecrireReservations([...lireReservations(), nouvelle])
  return ok ? nouvelle : null
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
