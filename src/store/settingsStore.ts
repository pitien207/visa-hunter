import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QualityLevel } from '../data/config'

export type Language = 'vi' | 'en' | 'de'

interface SettingsState {
  musicOn: boolean
  sfxOn: boolean
  quality: QualityLevel
  language: Language
  toggleMusic: () => void
  toggleSfx: () => void
  setQuality: (quality: QualityLevel) => void
  setLanguage: (language: Language) => void
}

/** Player preferences. Persisted to localStorage. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      musicOn: true,
      sfxOn: true,
      quality: 'high',
      language: 'vi',
      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      toggleSfx: () => set((s) => ({ sfxOn: !s.sfxOn })),
      setQuality: (quality) => set({ quality }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'visa-hunter-settings',
      version: 1,
      partialize: ({ musicOn, sfxOn, quality, language }) => ({ musicOn, sfxOn, quality, language }),
    },
  ),
)
