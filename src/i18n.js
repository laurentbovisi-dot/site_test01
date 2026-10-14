// Traductions de l'interface avec vue-i18n : un fichier par langue.
import { createI18n } from 'vue-i18n'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import rm from './locales/rm.json'

// Les 4 langues nationales suisses, avec leur nom affiché dans le sélecteur
// et le format local suisse utilisé pour les dates et les heures.
export const langues = [
  { code: 'fr', nom: 'Français', formatLocal: 'fr-CH' },
  { code: 'de', nom: 'Deutsch', formatLocal: 'de-CH' },
  { code: 'it', nom: 'Italiano', formatLocal: 'it-CH' },
  { code: 'rm', nom: 'Rumantsch', formatLocal: 'rm-CH' }
]

const CLE_LANGUE = 'agenda-salles.langue'

// Langue mémorisée dans le localStorage, sinon le français
function langueMemorisee() {
  try {
    const code = localStorage.getItem(CLE_LANGUE)
    if (langues.some((l) => l.code === code)) return code
  } catch {
    // localStorage indisponible : on garde la langue par défaut
  }
  return 'fr'
}

export const i18n = createI18n({
  legacy: false, // API Composition (useI18n)
  locale: langueMemorisee(),
  fallbackLocale: 'fr',
  messages: { fr, de, it, rm }
})

// Change la langue de l'interface et la mémorise
export function changerLangue(code) {
  i18n.global.locale.value = code
  document.documentElement.lang = code
  try {
    localStorage.setItem(CLE_LANGUE, code)
  } catch {
    // localStorage indisponible : le choix ne sera pas mémorisé
  }
}

// Format local suisse de la langue courante (ex. 'fr-CH')
export function formatLocal() {
  const code = i18n.global.locale.value
  return langues.find((l) => l.code === code)?.formatLocal ?? 'fr-CH'
}
