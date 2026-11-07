import { create } from 'zustand'
import { CONFIG } from '../data/config'
import type { I18nKey, TranslateVars } from '../i18n'

export type ToastTone = 'info' | 'good' | 'bad'

export interface Toast {
  id: number
  key: I18nKey
  vars?: TranslateVars
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  push: (key: I18nKey, tone?: ToastTone, vars?: TranslateVars) => void
  dismiss: (id: number) => void
}

let nextId = 1
const MAX_TOASTS = 3

/** Short feedback messages ("Delicious!", "Get a bit closer!"). Text is translated in the UI. */
export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (key, tone = 'info', vars) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, key, vars, tone }].slice(-MAX_TOASTS) }))
    window.setTimeout(() => get().dismiss(id), CONFIG.ui.toastMs)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const pushToast = (key: I18nKey, tone?: ToastTone, vars?: TranslateVars) =>
  useToasts.getState().push(key, tone, vars)
