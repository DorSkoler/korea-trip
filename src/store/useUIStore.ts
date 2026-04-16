import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { applyHtmlDir, type Lang } from '../i18n'

type UIState = {
  lang: Lang
  editMode: boolean
  setLang: (lang: Lang) => void
  toggleLang: () => void
  toggleEditMode: () => void
  setEditMode: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'he',
      editMode: false,
      setLang: (lang) => {
        if (lang === get().lang) return
        set({ lang })
        void i18n.changeLanguage(lang)
        applyHtmlDir(lang)
      },
      toggleLang: () => {
        const next: Lang = get().lang === 'he' ? 'en' : 'he'
        get().setLang(next)
      },
      toggleEditMode: () => set({ editMode: !get().editMode }),
      setEditMode: (v) => set({ editMode: v }),
    }),
    {
      name: 'korea:ui',
      partialize: (s) => ({ lang: s.lang, editMode: s.editMode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          void i18n.changeLanguage(state.lang)
          applyHtmlDir(state.lang)
        }
      },
    },
  ),
)
