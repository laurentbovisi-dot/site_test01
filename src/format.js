// Petites fonctions d'affichage partagées entre les pages.
import { praticiens } from './config.js'
import { formatLocal } from './i18n.js'

// Heure '08:30' au format local suisse de la langue choisie
export function formaterHeure(texte) {
  const [h, m] = texte.split(':').map(Number)
  const date = new Date(2000, 0, 1, h, m)
  return new Intl.DateTimeFormat(formatLocal(), { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Retrouve un praticien de la configuration par son identifiant
export function trouverPraticien(id) {
  return praticiens.find((p) => p.id === id)
}

// Nom complet avec le titre éventuel : « Dre Anne-Laure Chappuis »
export function nomComplet(p) {
  return [p.titre, p.prenom, p.nom].filter(Boolean).join(' ')
}

// Nom court : « Dre Chappuis » (ou « Sophie Cuendet » sans titre)
export function nomCourt(p) {
  return p.titre ? `${p.titre} ${p.nom}` : `${p.prenom} ${p.nom}`
}

// Nom du patient d'une réservation : « Jean Exemple » (vide pour une réunion)
export function nomPatient(r) {
  return [r.patientPrenom, r.patientNom].filter(Boolean).join(' ')
}
