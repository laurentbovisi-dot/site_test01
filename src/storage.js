// Lecture et écriture des réservations dans le localStorage du navigateur.
// Une réservation ressemble à :
//   {
//     id, salleId: 'lavande', date: '2026-10-14', debut: '09:00', fin: '10:00',
//     praticienId: 'rochat', type: 'consultation',
//     patientNom: 'Exemple', patientPrenom: 'Jean', motif: 'Contrôle annuel'
//   }
// Pour une réunion, patientNom et patientPrenom sont vides.

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

// Supprime une réservation par son identifiant.
// Renvoie true si l'enregistrement a réussi, false sinon.
export function supprimerReservation(id) {
  return ecrireReservations(lireReservations().filter((r) => r.id !== id))
}

// Nombre de réservations d'une salle pour une date donnée
export function compterReservations(salleId, date) {
  return lireReservations().filter((r) => r.salleId === salleId && r.date === date).length
}

// Date du jour au format AAAA-MM-JJ
export function dateDuJour() {
  return dateISO(new Date())
}
