import { create } from 'zustand'

export type SceneId = 'vietnam' | 'embassy' | 'airport' | 'germany' | 'buergeramt' | 'wg' | 'careHome'

interface WorldState {
  scene: SceneId
  setScene: (scene: SceneId) => void
}

/** Which scene (location) the player is in. Saved by game/systems/save.ts. */
export const useWorld = create<WorldState>()((set) => ({
  scene: 'vietnam',
  setScene: (scene) => set({ scene }),
}))
