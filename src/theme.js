// Thème PrimeVue : Aura, avec le bleu marine du logo comme couleur principale.
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const ThemeJardins = definePreset(Aura, {
  semantic: {
    // Nuances du bleu marine du logo (#173855 = 800)
    primary: {
      50: '#eef3f8',
      100: '#d5e0eb',
      200: '#aec3d7',
      300: '#7f9fbf',
      400: '#527ba2',
      500: '#2f5a83',
      600: '#224a6e',
      700: '#1b3f5f',
      800: '#173855',
      900: '#12293f',
      950: '#0b1a29'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.800}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.900}',
          activeColor: '{primary.950}'
        }
      }
    }
  }
})
