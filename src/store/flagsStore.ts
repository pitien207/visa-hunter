import { create } from 'zustand'

type FlagValue = number | boolean | string

interface FlagsState {
  /** Small persistent facts, e.g. "talked.baSau" = day number of the last chat. */
  flags: Record<string, FlagValue>
  setFlag: (key: string, value: FlagValue) => void
  hydrate: (flags: Record<string, FlagValue>) => void
}

/** Story/world flags. Saved by game/systems/save.ts. Quests (later) will build on this. */
export const useFlags = create<FlagsState>()((set) => ({
  flags: {},
  setFlag: (key, value) => set((s) => ({ flags: { ...s.flags, [key]: value } })),
  hydrate: (flags) => set({ flags: { ...flags } }),
}))
