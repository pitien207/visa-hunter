import type { I18nKey } from '../i18n'
import type { ActionIconName } from './tasks'

/**
 * Care-home workday (plan §6 chapter 4B "Pflege"): residents develop needs; walk to them
 * and pick the matching action. Same idea as the café, but several people at once.
 */

export type CareActionId = 'feed' | 'wipe' | 'chat' | 'comfort' | 'wheel'

export interface CareAction {
  id: CareActionId
  labelKey: I18nKey
  icon: ActionIconName
}

export const CARE_ACTIONS: Record<CareActionId, CareAction> = {
  feed: { id: 'feed', labelKey: 'care.feed', icon: 'feed' },
  wipe: { id: 'wipe', labelKey: 'care.wipe', icon: 'wipe' },
  chat: { id: 'chat', labelKey: 'care.chat', icon: 'talk' },
  comfort: { id: 'comfort', labelKey: 'care.comfort', icon: 'comfort' },
  wheel: { id: 'wheel', labelKey: 'care.wheel', icon: 'wheel' },
}

export interface ResidentDef {
  /** NPC id (looks + name). */
  npc: string
  /** Seat in the common room (care-home local coordinates). */
  at: { x: number; z: number }
  yaw: number
  wheelchair?: boolean
  /** The four buttons offered at this resident; needs are drawn from these. */
  actions: CareActionId[]
}

export const RESIDENTS: ResidentDef[] = [
  { npc: 'frauSchmidt', at: { x: -2.6, z: -1.2 }, yaw: 0.5, actions: ['feed', 'wipe', 'chat', 'comfort'] },
  { npc: 'herrWeber', at: { x: 2.7, z: -1.4 }, yaw: -0.5, wheelchair: true, actions: ['feed', 'chat', 'comfort', 'wheel'] },
  { npc: 'frauHoffmann', at: { x: -2.8, z: 1.6 }, yaw: 1.2, actions: ['feed', 'wipe', 'chat', 'comfort'] },
  { npc: 'herrKrause', at: { x: 2.8, z: 1.5 }, yaw: -1.2, actions: ['feed', 'wipe', 'chat', 'comfort'] },
]
