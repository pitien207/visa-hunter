import { create } from 'zustand'

import type { Localized } from '../i18n/localized'

export type Panel =
  | { type: 'shop'; shopId: string }
  | { type: 'clothes'; shopId: string }
  | { type: 'bag' }
  | { type: 'quests' }
  | { type: 'visa' }

/** Full-screen fade between scenes, with an optional caption ("✈ Bay sang Đức…"). */
export interface Transition {
  label: Localized | null
  long: boolean
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
  setSettingsOpen: (open: boolean) => void
  markSceneReady: () => void
  setMovementLocked: (locked: boolean) => void
  openPanel: (panel: Panel) => void
  closePanel: () => void
  setSleeping: (sleeping: boolean) => void
  setTransition: (transition: Transition | null) => void
}

export const useUI = create<UIState>()((set) => ({
  settingsOpen: false,
  sceneReady: false,
  movementLocked: false,
  panel: null,
  sleeping: false,
  transition: null,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  markSceneReady: () => set({ sceneReady: true }),
  setMovementLocked: (movementLocked) => set({ movementLocked }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  setSleeping: (sleeping) => set({ sleeping }),
  setTransition: (transition) => set({ transition }),
}))
