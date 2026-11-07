import { useCallback } from 'react'
import vi from './vi.json'
import en from './en.json'
import de from './de.json'
import { useSettings, type Language } from '../store/settingsStore'

/** Vietnamese is the source of truth: every key must exist in vi.json. */
export type I18nKey = keyof typeof vi
type Dictionary = Record<I18nKey, string>

// Typed as Dictionary so a missing key in en/de is a compile error.
const dictionaries: Record<Language, Dictionary> = { vi, en, de }

export const LANGUAGE_NAMES: Record<Language, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  de: 'Deutsch',
}

export type TranslateVars = Record<string, string | number>

export function translate(language: Language, key: I18nKey, vars?: TranslateVars): string {
  const template = dictionaries[language][key] ?? dictionaries.vi[key] ?? key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/** React hook: returns a `t(key, vars?)` bound to the current language. */
export function useT() {
  const language = useSettings((s) => s.language)
  return useCallback(
    (key: I18nKey, vars?: TranslateVars) => translate(language, key, vars),
    [language],
  )
}
