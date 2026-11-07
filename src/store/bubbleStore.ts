import { create } from 'zustand'
import { CONFIG } from '../data/config'
import type { Localized } from '../i18n/localized'

export interface Bubble {
  text: Localized
  key: number
}

interface BubbleState {
  /** Speaker id → current speech bubble. */
  bubbles: Record<string, Bubble>
  say: (speaker: string, text: Localized, ms?: number) => void
}

let nextKey = 1

/** Ambient speech bubbles above NPCs. */
export const useBubbles = create<BubbleState>()((set, get) => ({
  bubbles: {},
  say: (speaker, text, ms = CONFIG.npc.bubbleSec * 1000) => {
    const key = nextKey++
    set((s) => ({ bubbles: { ...s.bubbles, [speaker]: { text, key } } }))
    window.setTimeout(() => {
      if (get().bubbles[speaker]?.key !== key) return
      set((s) => {
        const bubbles = { ...s.bubbles }
        delete bubbles[speaker]
        return { bubbles }
      })
    }, ms)
  },
}))
