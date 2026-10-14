// Petites fonctions utiles pour manipuler les dates et les créneaux.
import { horaires, dureeCreneau } from './config.js'

// Clés des jours dans l'ordre de Date.getDay() (0 = dimanche)
const CLES_JOURS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Clé du jour de la semaine d'une date : 'monday', 'tuesday', etc.
export function cleJour(date) {
  return CLES_JOURS[date.getDay()]
}

// Vrai si la date tombe un dimanche
export function estDimanche(date) {
  return date.getDay() === 0
}

// Date au format AAAA-MM-JJ (heure locale), utilisée dans le localStorage
export function dateISO(date) {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

// Date du jour, à minuit
export function aujourdhui() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Avance (sens = 1) ou recule (sens = -1) d'un jour, en sautant le dimanche
export function jourOuvrableVoisin(date, sens) {
  const resultat = new Date(date.getFullYear(), date.getMonth(), date.getDate() + sens)
  if (estDimanche(resultat)) {
    resultat.setDate(resultat.getDate() + sens)
  }
  return resultat
}

// Date en toutes lettres : « samedi 17 octobre 2026 ».
// Intl ajoute parfois une virgule après le jour (« samedi, 17 … ») : on la remplace par un espace.
export function dateEnToutesLettres(date, formatLocal) {
  const morceaux = new Intl.DateTimeFormat(formatLocal, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).formatToParts(date)
  return morceaux
    .map((m, i) => (m.type === 'literal' && morceaux[i - 1]?.type === 'weekday' ? ' ' : m.value))
    .join('')
}

// Liste des créneaux d'une date, selon les horaires d'ouverture de ce jour-là.
// Exemple pour un samedi : ['08:00', '08:30', …, '11:30']. Liste vide si fermé.
export function creneauxDuJour(date) {
  const horaire = horaires[cleJour(date)]
  if (!horaire) return []

  const creneaux = []
  let minutes = enMinutes(horaire.ouverture)
  const fin = enMinutes(horaire.fermeture)
  while (minutes + dureeCreneau <= fin) {
    creneaux.push(enTexte(minutes))
    minutes += dureeCreneau
  }
  return creneaux
}

// Ajoute des minutes à une heure : ajouterMinutes('09:00', 90) → '10:30'
export function ajouterMinutes(heure, minutes) {
  return enTexte(enMinutes(heure) + minutes)
}

// '08:30' → 510 minutes depuis minuit
function enMinutes(texte) {
  const [h, m] = texte.split(':').map(Number)
  return h * 60 + m
}

// 510 → '08:30'
function enTexte(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}
