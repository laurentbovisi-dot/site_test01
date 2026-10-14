// Configuration de l'établissement (données fictives).
// Tout ce qui décrit le centre est défini ici, une seule fois.

export const etablissement = {
  nom: 'Centre de Soins Les Jardins du Bugnon',
  adresse: 'Rue du Bugnon 88, 1011 Lausanne',
  telephone: '021 000 00 00'
}

// Les 4 salles, dans l'ordre d'affichage.
// La couleur reprend celle de la fleur dans le logo.
export const salles = [
  { id: 'lavande', nom: 'Lavande', couleur: '#7263a4' },
  { id: 'tournesol', nom: 'Tournesol', couleur: '#f5a539' },
  { id: 'bleuet', nom: 'Bleuet', couleur: '#467cc6' },
  { id: 'camelia', nom: 'Camélia', couleur: '#f07988' }
]

// Horaires d'ouverture : null = fermé ce jour-là.
// Les clés des jours correspondent aux traductions (days.monday, etc.).
export const horaires = {
  monday: { ouverture: '08:00', fermeture: '18:00' },
  tuesday: { ouverture: '08:00', fermeture: '18:00' },
  wednesday: { ouverture: '08:00', fermeture: '18:00' },
  thursday: { ouverture: '08:00', fermeture: '18:00' },
  friday: { ouverture: '08:00', fermeture: '18:00' },
  saturday: { ouverture: '08:00', fermeture: '12:00' },
  sunday: null
}

// Durée d'un créneau de réservation, en minutes
export const dureeCreneau = 30

// Les praticiens (fictifs).
// - specialite : clé de traduction (specialties.xxx)
// - langues : codes de langue, traduits via languages.xxx
// - le CV est traduit dans les fichiers de langue (practitioners.<id>.cv)
export const praticiens = [
  { id: 'chappuis', titre: 'Dre', prenom: 'Anne-Laure', nom: 'Chappuis', specialite: 'generalMedicine', langues: ['fr', 'de'] },
  { id: 'rochat', titre: 'Dr', prenom: 'Pierre-Alain', nom: 'Rochat', specialite: 'cardiology', langues: ['fr', 'de', 'en'] },
  { id: 'dubuis', titre: 'Dre', prenom: 'Valérie', nom: 'Dubuis', specialite: 'pediatrics', langues: ['fr', 'it'] },
  { id: 'pasche', titre: 'Dr', prenom: 'Jean-Daniel', nom: 'Pasche', specialite: 'dermatology', langues: ['fr', 'de'] },
  { id: 'cuendet', titre: '', prenom: 'Sophie', nom: 'Cuendet', specialite: 'physiotherapy', langues: ['fr', 'en'] },
  { id: 'favre', titre: '', prenom: 'Nicolas', nom: 'Favre', specialite: 'nursing', langues: ['fr', 'rm'] }
]
