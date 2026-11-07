import { useCallback } from 'react'
import { useSettings, type Language } from '../store/settingsStore'

/**
 * Game content (dialogue, item names, NPC names) lives in data/ with its translations
 * inline. UI strings stay in the JSON dictionaries. German falls back to English.
 */
export interface Localized {
  vi: string
  en: string
  de?: string
}

export function localize(text: Localized, language: Language): string {
  return text[language] ?? text.en ?? text.vi
}

export function useLocalize() {
  const language = useSettings((s) => s.language)
  return useCallback((text: Localized) => localize(text, language), [language])
}

/** Current language outside React (for toasts built in game logic). */
export function currentLanguage(): Language {
  return useSettings.getState().language
}
