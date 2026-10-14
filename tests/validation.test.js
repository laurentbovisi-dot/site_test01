// Tests des règles de validation (src/validation.js).
// Lancer avec : npm test   (utilise le testeur intégré à Node.js, sans dépendance)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validerReservation } from '../src/validation.js'

// « Maintenant » fixé au mercredi 14 octobre 2026 à 10h15
const maintenant = new Date(2026, 9, 14, 10, 15)
const mercredi = new Date(2026, 9, 14)
const jeudi = new Date(2026, 9, 15)
const samedi = new Date(2026, 9, 17)
const dimanche = new Date(2026, 9, 18)

// Une réservation valide, que chaque test modifie
const base = {
  salleId: 'lavande',
  date: jeudi,
  debut: '09:00',
  duree: 60,
  praticienId: 'rochat',
  type: 'consultation',
  patientNom: 'Exemple',
  patientPrenom: 'Jean',
  motif: 'Contrôle'
}

// Une réservation déjà enregistrée : Bleuet, jeudi 09:30–10:30, Dre Dubuis, patient « jean exemple »
const existantes = [
  {
    id: 'a', salleId: 'bleuet', date: '2026-10-15', debut: '09:30', fin: '10:30',
    praticienId: 'dubuis', type: 'consultation', patientNom: ' exemple ', patientPrenom: 'JEAN', motif: 'x'
  }
]

// Codes des règles non respectées
const regles = (modif, reservations = existantes) =>
  validerReservation({ ...base, ...modif }, reservations, maintenant).regles.map((r) => r.code)

// Champs obligatoires vides
const champs = (modif) => Object.keys(validerReservation({ ...base, ...modif }, [], maintenant).champs)

test('une réservation correcte est acceptée', () => {
  assert.deepEqual(regles({}, []), [])
})

test('une salle ne peut pas avoir deux rendez-vous en même temps', () => {
  assert.deepEqual(regles({ salleId: 'bleuet', patientNom: 'Autre' }), ['salleOccupee'])
})

test('un praticien ne peut pas avoir deux rendez-vous en même temps', () => {
  assert.deepEqual(regles({ praticienId: 'dubuis', patientNom: 'Autre' }), ['praticienOccupe'])
})

test('un patient ne peut pas avoir deux rendez-vous en même temps (majuscules et espaces ignorés)', () => {
  assert.deepEqual(regles({}), ['patientOccupe'])
  assert.deepEqual(regles({ patientNom: 'EXEMPLE', patientPrenom: 'Je an' }), ['patientOccupe'])
  assert.deepEqual(regles({ patientNom: 'Autre' }), [])
})

test('pas de contrôle patient pour une réunion', () => {
  assert.deepEqual(regles({ type: 'meeting', patientNom: '', patientPrenom: '' }), [])
})

test('deux rendez-vous bout à bout ne se chevauchent pas', () => {
  assert.deepEqual(regles({ salleId: 'bleuet', debut: '10:30', patientNom: 'X' }), [])
  assert.deepEqual(regles({ salleId: 'bleuet', debut: '08:30', patientNom: 'X' }), [])
})

test('pas de réservation le dimanche', () => {
  assert.deepEqual(regles({ date: dimanche }), ['dimanche'])
})

test('pas de réservation dans le passé', () => {
  assert.deepEqual(regles({ date: new Date(2026, 9, 13) }, []), ['passe'])
  assert.deepEqual(regles({ date: mercredi, debut: '10:00' }, []), ['passe'])
  assert.deepEqual(regles({ date: mercredi, debut: '10:30' }, []), [])
})

test('pas de réservation hors des horaires d’ouverture', () => {
  assert.deepEqual(regles({ debut: '07:30' }, []), ['avantOuverture'])
  assert.deepEqual(regles({ debut: '17:30' }, []), ['apresFermeture'])
  assert.deepEqual(regles({ date: samedi, debut: '11:30', duree: 90 }, []), ['apresFermeture'])
  assert.deepEqual(regles({ date: samedi, debut: '11:00' }, []), [])
})

test('tous les champs sont obligatoires', () => {
  assert.deepEqual(
    champs({ salleId: null, debut: null, praticienId: '', motif: '  ', patientNom: '', patientPrenom: ' ' }),
    ['salleId', 'debut', 'praticienId', 'motif', 'patientNom', 'patientPrenom']
  )
  assert.deepEqual(champs({ date: null }), ['date'])
})

test('pour une réunion, seuls les champs patient sont facultatifs', () => {
  assert.deepEqual(champs({ type: 'meeting', patientNom: '', patientPrenom: '' }), [])
  assert.deepEqual(champs({ type: 'meeting', motif: '' }), ['motif'])
})
