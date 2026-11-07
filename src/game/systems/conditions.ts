import { CONFIG } from '../../data/config'
import type { Condition } from '../../data/conditions'
import { useFlags } from '../../store/flagsStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { useWorld } from '../../store/worldStore'
import { SCENES } from '../scenes/registry'

const tests = new Map<string, () => boolean>()

/** Feature modules register computed checks usable as { test: id } in data. */
export function registerTests(map: Record<string, () => boolean>) {
  for (const [id, fn] of Object.entries(map)) tests.set(id, fn)
}

export function getFlag(key: string) {
  return useFlags.getState().flags[key]
}

export function flagNumber(key: string): number {
  const v = getFlag(key)
  return typeof v === 'number' ? v : v ? 1 : 0
}

export function setFlag(key: string, value: number | boolean | string) {
  useFlags.getState().setFlag(key, value)
}

/** Add to a counter flag (e.g. "stats.traDa"). */
export function bumpFlag(key: string, by = 1) {
  setFlag(key, flagNumber(key) + by)
}

/** XP needed for the next German exam, or Infinity when all levels are done. */
export function germanXpNeeded(level: number) {
  return CONFIG.german.levels[level]?.xpToExam ?? Number.POSITIVE_INFINITY
}

export function check(c: Condition | undefined): boolean {
  if (!c) return true
  if ('all' in c) return c.all.every(check)
  if ('any' in c) return c.any.some(check)
  if ('not' in c) return !check(c.not)
  if ('flag' in c) {
    const v = getFlag(c.flag)
    if (c.is !== undefined) return v === c.is
    if (c.atLeast !== undefined) return typeof v === 'number' && v >= c.atLeast
    return !!v
  }
  if ('noFlag' in c) return !getFlag(c.noFlag)
  if ('dayReached' in c) {
    const v = getFlag(c.dayReached)
    return typeof v === 'number' && useTime.getState().day >= v
  }
  if ('germanLevel' in c) return usePlayer.getState().german.level >= c.germanLevel
  if ('germanXpReady' in c) {
    const g = usePlayer.getState().german
    return g.xp >= germanXpNeeded(g.level)
  }
  if ('money' in c) return usePlayer.getState().money >= c.money
  if ('scene' in c) return useWorld.getState().scene === c.scene
  if ('country' in c) return SCENES[useWorld.getState().scene].country === c.country
  if ('test' in c) return tests.get(c.test)?.() ?? false
  if ('hourBetween' in c) {
    const h = useTime.getState().minutes / 60
    return h >= c.hourBetween[0] && h < c.hourBetween[1]
  }
  return false
}
