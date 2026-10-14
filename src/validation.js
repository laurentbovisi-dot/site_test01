// Règles de validation d'une réservation.
// Ce fichier ne fait aucun affichage : il renvoie seulement la liste des erreurs,
// que le formulaire traduit ensuite dans la langue choisie.
import { horaires, typesRendezVous } from './config.js'
import { cleJour, estDimanche, dateISO, ajouterMinutes } from './dates.js'

// Champs obligatoires du formulaire (les champs patient seulement si le type le demande)
const CHAMPS_OBLIGATOIRES = ['salleId', 'date', 'debut', 'duree', 'praticienId', 'type', 'motif']
const CHAMPS_PATIENT = ['patientNom', 'patientPrenom']

// Vrai si un champ est vide (rien, ou seulement des espaces)
function estVide(valeur) {
  return valeur === null || valeur === undefined || String(valeur).trim() === ''
}

// Nom de patient « normalisé » pour comparer sans tenir compte
// des majuscules ni des espaces : « Jean  Dupont » et « jean dupont » sont identiques.
export function normaliserNom(texte) {
  return String(texte ?? '').replace(/\s+/g, '').toLocaleLowerCase('fr')
}

// Le type de rendez-vous demande-t-il un patient ? (non pour une réunion)
export function typeAvecPatient(type) {
  return typesRendezVous.find((t) => t.id === type)?.patient ?? true
}

// Vérifie une réservation avant de l'enregistrer.
//  - donnees : les champs du formulaire
//    { salleId, date (objet Date), debut ('09:00'), duree (minutes), praticienId,
//      type, patientNom, patientPrenom, motif }
//  - reservations : les réservations déjà enregistrées
//  - maintenant : la date et l'heure actuelles (pour refuser le passé)
// Renvoie { champs, regles } :
//  - champs : les champs obligatoires vides, ex. { salleId: true, motif: true }
//  - regles : les règles non respectées, ex. [{ code: 'salleOccupee', conflit: {…} }]
export function validerReservation(donnees, reservations, maintenant = new Date()) {
  const champs = {}
  const regles = []
  const avecPatient = typeAvecPatient(donnees.type)

  // 1. Tous les champs sont obligatoires (sauf le patient pour une réunion)
  const obligatoires = avecPatient ? [...CHAMPS_OBLIGATOIRES, ...CHAMPS_PATIENT] : CHAMPS_OBLIGATOIRES
  for (const champ of obligatoires) {
    if (estVide(donnees[champ])) champs[champ] = true
  }

  // Sans date, on ne peut rien vérifier d'autre
  if (!donnees.date) return { champs, regles }

  // 2. Pas de réservation le dimanche (ni un autre jour de fermeture)
  const horaire = horaires[cleJour(donnees.date)]
  if (estDimanche(donnees.date)) {
    regles.push({ code: 'dimanche' })
    return { champs, regles }
  }
  if (!horaire) {
    regles.push({ code: 'jourFerme' })
    return { champs, regles }
  }

  // Sans heure de début ou sans durée, les autres règles ne s'appliquent pas encore
  if (!donnees.debut || !donnees.duree) return { champs, regles }
  const debut = donnees.debut
  const fin = ajouterMinutes(debut, donnees.duree)

  // 3. Pas de réservation dans le passé
  const [h, m] = debut.split(':').map(Number)
  const debutComplet = new Date(donnees.date.getFullYear(), donnees.date.getMonth(), donnees.date.getDate(), h, m)
  if (debutComplet < maintenant) {
    regles.push({ code: 'passe' })
  }

  // 4. Pas de réservation hors des horaires d'ouverture
  if (debut < horaire.ouverture) {
    regles.push({ code: 'avantOuverture', heure: horaire.ouverture })
  }
  if (fin > horaire.fermeture) {
    regles.push({ code: 'apresFermeture', heure: horaire.fermeture })
  }

  // 5. Conflits : les réservations du même jour qui chevauchent la plage demandée
  const date = dateISO(donnees.date)
  const chevauchent = reservations.filter((r) => r.date === date && r.debut < fin && debut < r.fin)

  // 5a. Une salle ne peut pas avoir deux rendez-vous en même temps
  const conflitSalle = chevauchent.find((r) => r.salleId === donnees.salleId)
  if (donnees.salleId && conflitSalle) {
    regles.push({ code: 'salleOccupee', conflit: conflitSalle })
  }

  // 5b. Un praticien ne peut pas avoir deux rendez-vous en même temps
  const conflitPraticien = chevauchent.find((r) => r.praticienId === donnees.praticienId)
  if (donnees.praticienId && conflitPraticien) {
    regles.push({ code: 'praticienOccupe', conflit: conflitPraticien })
  }

  // 5c. Un patient ne peut pas avoir deux rendez-vous en même temps
  //     (même nom et prénom, sans tenir compte des majuscules ni des espaces)
  if (avecPatient && !estVide(donnees.patientNom) && !estVide(donnees.patientPrenom)) {
    const nom = normaliserNom(donnees.patientNom)
    const prenom = normaliserNom(donnees.patientPrenom)
    const conflitPatient = chevauchent.find(
      (r) => normaliserNom(r.patientNom) === nom && normaliserNom(r.patientPrenom) === prenom
    )
    if (conflitPatient) {
      regles.push({ code: 'patientOccupe', conflit: conflitPatient })
    }
  }

  return { champs, regles }
}
