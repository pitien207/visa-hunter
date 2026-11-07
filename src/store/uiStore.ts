import { create } from 'zustand'

import type { Localized } from '../i18n/localized'

export type Panel =
  | { type: 'shop'; shopId: string }
  | { type: 'clothes'; shopId: string }
  | { type: 'bag' }
  | { type: 'quests' }
  | { type: 'visa' }
  | { type: 'clock' }

/** Full-screen fade between scenes, with an optional caption ("✈ Bay sang Đức…"). */
export interface Transition {
  label: Localized | null
  long: boolean
  /** Big emoji above the caption (🔔 class bell, 📝 exam…). */
  icon?: string
  subtitle?: Localized | null
  /** Card colours: night sky (travel), school chalkboard, exam paper. */
  tone?: 'night' | 'chalk' | 'paper'
}

/** Waiting: the clock runs fast until `remaining` game minutes have passed. */
export interface FastForward {
  remaining: number
  total: number
  label: Localized | null
  onDone?: () => void
}

/** What happened yesterday, shown on the "new day" card after waking up. */
export interface DaySummary {
  /** The day that just started. */
  day: number
  money: number
  currency: 'VND' | 'EUR'
  germanXp: number
  steps: number
  passedOut: boolean
}

interface UIState {
  settingsOpen: boolean
  /** True once the 3D scene (physics + first frames) is up. */
  sceneReady: boolean
  /** True while the game moves the player (auto-walk, working, talking). */
  movementLocked: boolean
  /** Shop / bag sheet. */
  panel: Panel | null
  /** Full-screen "Zzz…" while sleeping. */
  sleeping: boolean
  transition: Transition | null
  fastForward: FastForward | null
  /** Summary waiting to be shown (set at midnight / on waking). */
  daySummary: DaySummary | null
  /** The new-day card is on screen. */
  newDayOpen: boolean
  setSettingsOpen: (open: boolean) => void
  markSceneReady: () => void
  setMovementLocked: (locked: boolean) => void
  openPanel: (panel: Panel) => void
  closePanel: () => void
  setSleeping: (sleeping: boolean) => void
  setTransition: (transition: Transition | null) => void
  setFastForward: (fastForward: FastForward | null) => void
  setDaySummary: (summary: DaySummary | null) => void
  setNewDayOpen: (open: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  settingsOpen: false,
  sceneReady: false,
  movementLocked: false,
  panel: null,
  sleeping: false,
  transition: null,
  fastForward: null,
  daySummary: null,
  newDayOpen: false,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  markSceneReady: () => set({ sceneReady: true }),
  setMovementLocked: (movementLocked) => set({ movementLocked }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  setSleeping: (sleeping) => set({ sleeping }),
  setTransition: (transition) => set({ transition }),
  setFastForward: (fastForward) => set({ fastForward }),
  setDaySummary: (daySummary) => set({ daySummary }),
  setNewDayOpen: (newDayOpen) => set({ newDayOpen }),
}))
