import { create } from 'zustand'
import { CONFIG } from '../data/config'

export const MINUTES_PER_DAY = 24 * 60

interface TimeState {
  /** Day counter, starting at 1 (a Monday). */
  day: number
  /** Minutes since midnight, 0–1439. */
  minutes: number
  /** Move the clock forward; rolls over into the next day. */
  advance: (minutes: number) => void
  setTime: (day: number, minutes: number) => void
}

/** In-game calendar (plan §5.2). The TimeSystem component ticks it; actions advance it. */
export const useTime = create<TimeState>()((set) => ({
  day: 1,
  minutes: CONFIG.time.startMinutes,
  advance: (amount) =>
    set((s) => {
      let minutes = s.minutes + amount
      let day = s.day
      while (minutes >= MINUTES_PER_DAY) {
        minutes -= MINUTES_PER_DAY
        day += 1
      }
      return { day, minutes }
    }),
  setTime: (day, minutes) => set({ day, minutes }),
}))
