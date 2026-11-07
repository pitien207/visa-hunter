import { create } from 'zustand'
import { CONFIG } from '../data/config'
import { PLAYER_OUTFIT, type Outfit } from '../data/npcs'
import type { SkillId } from '../data/skills'
import type { Currency } from '../i18n/format'

export interface PlayerStats {
  /** In the current currency (VND in Vietnam, EUR in Germany). */
  money: number
  currency: Currency
  /** Kept as a float so slow drains add up; shown rounded. */
  energy: number
  maxEnergy: number
  mood: number
  /** XP per profession skill. */
  skills: Partial<Record<SkillId, number>>
  /** German: number of certificates passed (0 = none, 1 = A1 …) and XP toward the next. */
  german: { level: number; xp: number }
  /** What the character wears (plan §5.6). */
  outfit: Outfit
  /** Ids of clothing items owned (data/clothes.ts). */
  wardrobe: string[]
}

interface PlayerState extends PlayerStats {
  addMoney: (amount: number) => void
  spendEnergy: (amount: number) => void
  restoreEnergy: (amount: number) => void
  changeMood: (amount: number) => void
  addSkillXp: (skill: SkillId, xp: number) => void
  addGermanXp: (xp: number) => void
  setGerman: (german: PlayerStats['german']) => void
  /** Switch currency (moving countries); `money` is the converted amount. */
  setMoney: (money: number, currency: Currency) => void
  setOutfit: (outfit: Outfit) => void
  addClothing: (id: string) => void
  /** Replace all stats (loading a save / starting over). */
  hydrate: (stats: PlayerStats) => void
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v))
const roundMoney = (v: number, currency: Currency) => (currency === 'EUR' ? Math.round(v * 100) / 100 : Math.round(v))

export function initialStats(): PlayerStats {
  return {
    money: CONFIG.startingStats.money,
    currency: 'VND',
    energy: CONFIG.startingStats.energy,
    maxEnergy: CONFIG.startingStats.maxEnergy,
    mood: CONFIG.startingStats.mood,
    skills: {},
    german: { level: 0, xp: 0 },
    outfit: PLAYER_OUTFIT,
    wardrobe: [],
  }
}

/** Player stats (plan §5.1). Saved by game/systems/save.ts. */
export const usePlayer = create<PlayerState>()((set) => ({
  ...initialStats(),
  addMoney: (amount) => set((s) => ({ money: Math.max(0, roundMoney(s.money + amount, s.currency)) })),
  spendEnergy: (amount) => set((s) => ({ energy: clamp(s.energy - amount, s.maxEnergy) })),
  restoreEnergy: (amount) => set((s) => ({ energy: clamp(s.energy + amount, s.maxEnergy) })),
  changeMood: (amount) => set((s) => ({ mood: clamp(s.mood + amount, 100) })),
  addSkillXp: (skill, xp) => set((s) => ({ skills: { ...s.skills, [skill]: (s.skills[skill] ?? 0) + xp } })),
  addGermanXp: (xp) => set((s) => ({ german: { ...s.german, xp: s.german.xp + xp } })),
  setGerman: (german) => set({ german }),
  setMoney: (money, currency) => set({ money: roundMoney(money, currency), currency }),
  setOutfit: (outfit) => set({ outfit }),
  addClothing: (id) => set((s) => (s.wardrobe.includes(id) ? s : { wardrobe: [...s.wardrobe, id] })),
  hydrate: (stats) => set({ ...stats }),
}))
