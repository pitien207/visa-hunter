import { create } from 'zustand'

export interface Bottle {
  id: number
  x: number
  z: number
  /** 0 = green glass, 1 = brown glass, 2 = plastic. */
  kind: number
}

interface PfandState {
  bottles: Bottle[]
  setBottles: (bottles: Bottle[]) => void
}

/** Bottles currently lying around the German street (transient; carried count is a saved flag). */
export const usePfand = create<PfandState>()((set) => ({
  bottles: [],
  setBottles: (bottles) => set({ bottles }),
}))
