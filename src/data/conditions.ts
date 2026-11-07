import type { SceneId } from '../store/worldStore'

/**
 * A tiny condition language so quests, dialogue choices and achievements can be
 * written as data. Evaluated by game/systems/conditions.ts.
 */
export type Condition =
  /** Flag is set (truthy), or equals `is`, or is a number ≥ `atLeast`. */
  | { flag: string; is?: number | boolean | string; atLeast?: number }
  | { noFlag: string }
  /** Flag holds a day number and that day has come. */
  | { dayReached: string }
  /** German certificates passed ≥ n (1 = A1, 2 = A2, 3 = B1). */
  | { germanLevel: number }
  | { germanXpReady: true }
  | { money: number }
  | { scene: SceneId }
  | { country: 'vn' | 'de' }
  | { hourBetween: [number, number] }
  /** A named check registered by a feature module (e.g. "visa.docsComplete"). */
  | { test: string }
  | { not: Condition }
  | { all: Condition[] }
  | { any: Condition[] }
