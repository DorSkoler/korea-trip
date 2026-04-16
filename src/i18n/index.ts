import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import he from './he.json'

export const SUPPORTED_LANGS = ['he', 'en'] as const
export type Lang = (typeof SUPPORTED_LANGS)[number]

void i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng: 'he',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export function applyHtmlDir(lang: Lang) {
  const root = document.documentElement
  root.lang = lang
  root.dir = lang === 'he' ? 'rtl' : 'ltr'
}

export default i18n
