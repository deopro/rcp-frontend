import en from '../locales/en.json'
import ptPT from '../locales/pt-PT.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'pt-PT',
  fallbackLocale: 'en',
  messages: {
    'pt-PT': ptPT,
    en,
  },
}))
