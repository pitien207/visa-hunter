import { create } from 'zustand'
import { RESIDENTS, type CareActionId } from '../data/care'
import { CONFIG } from '../data/config'
import { usePlayer } from './playerStore'
import { useTime } from './timeStore'
import { pushToast } from './toastStore'
import { useFlags } from './flagsStore'

export interface ResidentState {
  need: CareActionId | null
  patience: number
  patienceMax: number
  /** Seconds before this resident can need something again. */
  cooldown: number
  /** Last reaction, shown as an emote. */
  mood: 'happy' | 'upset' | null
  moodKey: number
}

export interface CareReward {
  fraction: number
  pay: number
  xp: number
  energy: number
  minutes: number
  mood: number
}

export interface CareSession {
  phase: 'working' | 'finished'
  elapsed: number
  timeLeft: number
  meter: number
  helped: number
  missed: number
  wrong: number
  nextNeedIn: number
  residents: ResidentState[]
}

interface CareState {
  session: CareSession | null
  reward: CareReward | null
  start: () => void
  tick: (dt: number) => void
  act: (resident: number, action: CareActionId) => void
  quit: () => void
  claim: () => void
}

const cfg = CONFIG.care
const clamp = (v: number) => Math.max(0, Math.min(100, v))
const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a)
let moodKey = 1

function reward(s: CareSession): CareReward {
  const fraction = Math.max(0, Math.min(1, s.elapsed / cfg.durationSec))
  const mult = CONFIG.work.payMultiplier.min + ((CONFIG.work.payMultiplier.max - CONFIG.work.payMultiplier.min) * s.meter) / 100
  return {
    fraction,
    pay: Math.round(cfg.pay * fraction * mult * 100) / 100,
    xp: Math.round(cfg.xp * fraction),
    energy: Math.round(cfg.energyCost * fraction),
    minutes: Math.round(cfg.hours * 60 * fraction),
    mood: Math.round((s.meter - 50) * CONFIG.needs.workMoodFactor * fraction),
  }
}

/** A care-home workday (M7). Rules are simple enough to live with the state. */
export const useCare = create<CareState>()((set, get) => ({
  session: null,
  reward: null,

  start: () =>
    set({
      reward: null,
      session: {
        phase: 'working',
        elapsed: 0,
        timeLeft: cfg.durationSec,
        meter: cfg.meter.start,
        helped: 0,
        missed: 0,
        wrong: 0,
        nextNeedIn: 1.5,
        residents: RESIDENTS.map(() => ({ need: null, patience: 0, patienceMax: 0, cooldown: 0, mood: null, moodKey: 0 })),
      },
    }),

  tick: (dt) => {
    const s = get().session
    if (!s || s.phase !== 'working') return
    const elapsed = s.elapsed + dt
    const timeLeft = Math.max(0, s.timeLeft - dt)
    let { meter, missed, nextNeedIn } = s
    const residents = s.residents.map((r) => {
      const next = { ...r, cooldown: Math.max(0, r.cooldown - dt) }
      if (next.need) {
        next.patience -= dt
        if (next.patience <= 0) {
          next.need = null
          next.cooldown = 3
          next.mood = 'upset'
          next.moodKey = moodKey++
          meter = clamp(meter - cfg.meter.missed)
          missed++
        }
      }
      return next
    })
    if (missed > s.missed) pushToast('care.missed', 'bad')

    // A new need appears now and then.
    nextNeedIn -= dt
    const active = residents.filter((r) => r.need).length
    if (nextNeedIn <= 0 && active < cfg.maxNeeds) {
      const free = residents.map((r, i) => ({ r, i })).filter(({ r }) => !r.need && r.cooldown <= 0)
      if (free.length) {
        const { i } = free[Math.floor(Math.random() * free.length)]
        const options = RESIDENTS[i].actions
        residents[i].need = options[Math.floor(Math.random() * options.length)]
        residents[i].patience = residents[i].patienceMax = cfg.patienceSec
      }
      nextNeedIn = rand(cfg.needGapSec)
    }

    const session: CareSession = { ...s, elapsed, timeLeft, meter, missed, nextNeedIn, residents }
    if (timeLeft <= 0) {
      session.phase = 'finished'
      set({ session, reward: reward(session) })
    } else {
      set({ session })
    }
  },

  act: (index, action) => {
    const s = get().session
    if (!s || s.phase !== 'working') return
    const r = s.residents[index]
    if (!r) return
    const residents = [...s.residents]
    if (r.need === action) {
      residents[index] = { ...r, need: null, cooldown: 4, mood: 'happy', moodKey: moodKey++ }
      pushToast('care.helped', 'good')
      set({ session: { ...s, residents, meter: clamp(s.meter + cfg.meter.helped), helped: s.helped + 1 } })
    } else {
      residents[index] = { ...r, mood: 'upset', moodKey: moodKey++ }
      pushToast(r.need ? 'care.wrong' : 'care.notNow', 'bad')
      set({ session: { ...s, residents, meter: clamp(s.meter - cfg.meter.wrong), wrong: s.wrong + 1 } })
    }
  },

  quit: () => {
    const s = get().session
    if (!s || s.phase !== 'working') return
    const session = { ...s, phase: 'finished' as const }
    set({ session, reward: reward(session) })
  },

  claim: () => {
    const { reward: r, session } = get()
    if (r && session) {
      const p = usePlayer.getState()
      p.addMoney(r.pay)
      p.spendEnergy(r.energy)
      p.addSkillXp('pflege', r.xp)
      p.changeMood(r.mood)
      useTime.getState().advance(r.minutes)
      const flags = useFlags.getState()
      flags.setFlag('stats.careShifts', ((flags.flags['stats.careShifts'] as number) ?? 0) + 1)
      flags.setFlag('care.lastShiftDay', useTime.getState().day)
      if (session.meter >= 100 && r.fraction >= 0.99) flags.setFlag('achv.perfectCare', true)
    }
    set({ session: null, reward: null })
  },
}))
