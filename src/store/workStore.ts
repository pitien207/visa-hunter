import { create } from 'zustand'
import type { TaskDef } from '../data/tasks'
import {
  applyAction,
  computeReward,
  createSession,
  finishSession,
  tickSession,
  type WorkEvent,
  type WorkReward,
  type WorkSession,
} from '../game/systems/work'
import { formatMoney } from '../i18n/format'
import { usePlayer } from './playerStore'
import { useTime } from './timeStore'
import { useFlags } from './flagsStore'
import { pushToast } from './toastStore'

interface WorkState {
  task: TaskDef | null
  session: WorkSession | null
  /** Set when the shift ends; cleared when the pay is collected. */
  reward: WorkReward | null
  start: (task: TaskDef) => void
  act: (actionId: string) => void
  tick: (dt: number) => void
  quit: () => void
  claim: () => void
}

function announce(event: WorkEvent | undefined) {
  if (!event) return
  switch (event.type) {
    case 'served':
      if (event.tip > 0) pushToast('work.servedFast', 'good', { tip: formatMoney(event.tip) })
      else pushToast('work.served', 'good')
      break
    case 'wrong':
      pushToast('work.wrong', 'bad')
      break
    case 'timeout':
      pushToast('work.timeout', 'bad')
      break
    case 'noOrder':
      pushToast('work.noOrder', 'info')
      break
  }
}

/** The active WorkStation shift. Game rules live in game/systems/work.ts. */
export const useWork = create<WorkState>()((set, get) => {
  const finish = (session: WorkSession) => {
    const task = get().task
    set({ session, reward: task ? computeReward(session, task) : null })
  }

  return {
    task: null,
    session: null,
    reward: null,

    start: (task) => {
      if (get().session) return
      set({ task, session: createSession(task), reward: null })
    },

    act: (actionId) => {
      const { session, task } = get()
      if (!session || !task) return
      const { session: next, event } = applyAction(session, task, actionId)
      set({ session: next })
      announce(event)
    },

    tick: (dt) => {
      const { session, task } = get()
      if (!session || !task || session.phase !== 'working') return
      const { session: next, event } = tickSession(session, task, dt)
      if (next.phase === 'finished') finish(next)
      else set({ session: next })
      announce(event)
    },

    quit: () => {
      const { session } = get()
      if (session && session.phase === 'working') finish(finishSession(session))
    },

    claim: () => {
      const { reward, task } = get()
      if (reward && task) {
        const player = usePlayer.getState()
        player.addMoney(reward.total)
        player.spendEnergy(reward.energy)
        player.addSkillXp(task.skill, reward.xp)
        player.changeMood(reward.mood)
        useTime.getState().advance(reward.minutes)
        const flags = useFlags.getState()
        const n = (key: string) => (typeof flags.flags[key] === 'number' ? (flags.flags[key] as number) : 0)
        flags.setFlag('stats.shifts', n('stats.shifts') + 1)
        flags.setFlag('stats.served', n('stats.served') + (get().session?.served ?? 0))
      }
      set({ session: null, reward: null, task: null })
    },
  }
})
