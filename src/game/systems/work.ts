import { CONFIG } from '../../data/config'
import type { TaskDef, TaskRequest } from '../../data/tasks'

/**
 * Pure WorkStation session logic (no React, no three.js).
 * Every function returns a new session object, so it plugs straight into Zustand.
 */

export type OrderStatus = 'waiting' | 'served' | 'failed'

export interface Order {
  seq: number
  requestId: string
  /** Action ids added so far, in the order they were pressed. */
  added: string[]
  /** Seconds until the customer reaches the counter (patience doesn't run yet). */
  arriveLeft: number
  patienceLeft: number
  patienceMax: number
  status: OrderStatus
  /** Session time when the order was served/failed; -1 while waiting. */
  resolvedAt: number
}

export type WorkEvent =
  | { type: 'step'; actionId: string }
  | { type: 'served'; fast: boolean; tip: number }
  | { type: 'wrong' }
  | { type: 'timeout' }
  | { type: 'noOrder' }

export interface WorkSession {
  taskId: string
  phase: 'working' | 'finished'
  elapsed: number
  timeLeft: number
  meter: number
  served: number
  failed: number
  tips: number
  order: Order | null
  nextOrderIn: number
  seq: number
  /** Previous request, so the same drink isn't ordered twice in a row. */
  lastRequestId: string | null
}

export interface WorkReward {
  /** Share of the full shift actually worked (0–1). */
  fraction: number
  wage: number
  tips: number
  total: number
  xp: number
  energy: number
  /** In-game minutes the shift took. */
  minutes: number
  /** Mood change: a good shift feels good, a bad one doesn't. */
  mood: number
}

export interface StepResult {
  session: WorkSession
  event?: WorkEvent
}

const clampMeter = (v: number) => Math.max(0, Math.min(100, v))

export function findRequest(task: TaskDef, id: string): TaskRequest | undefined {
  return task.requests.find((r) => r.id === id)
}

function countOf(list: string[], id: string) {
  let n = 0
  for (const x of list) if (x === id) n++
  return n
}

/** True when `added` contains every needed action (with multiplicity). */
export function isComplete(needs: string[], added: string[]) {
  return needs.every((id) => countOf(added, id) >= countOf(needs, id))
}

/** For UI: which slots of `needs` are already filled by `added`. */
export function filledSlots(needs: string[], added: string[]): boolean[] {
  const used = new Map<string, number>()
  return needs.map((id) => {
    const n = (used.get(id) ?? 0) + 1
    used.set(id, n)
    return countOf(added, id) >= n
  })
}

function pickRequest(task: TaskDef, previousId: string | null, rng: () => number): TaskRequest {
  const pool = task.requests.length > 1 ? task.requests.filter((r) => r.id !== previousId) : task.requests
  const total = pool.reduce((sum, r) => sum + (r.weight ?? 1), 0)
  let roll = rng() * total
  for (const r of pool) {
    roll -= r.weight ?? 1
    if (roll <= 0) return r
  }
  return pool[pool.length - 1]
}

export function createSession(task: TaskDef): WorkSession {
  return {
    taskId: task.id,
    phase: 'working',
    elapsed: 0,
    timeLeft: task.durationSec,
    meter: CONFIG.work.meter.start,
    served: 0,
    failed: 0,
    tips: 0,
    order: null,
    nextOrderIn: 0.4,
    seq: 0,
    lastRequestId: null,
  }
}

export function tickSession(s: WorkSession, task: TaskDef, dt: number, rng: () => number = Math.random): StepResult {
  if (s.phase !== 'working') return { session: s }
  const elapsed = s.elapsed + dt
  const timeLeft = Math.max(0, s.timeLeft - dt)
  if (timeLeft <= 0) return { session: { ...s, elapsed, timeLeft, phase: 'finished' } }

  let next: WorkSession = { ...s, elapsed, timeLeft }
  let event: WorkEvent | undefined
  const order = s.order

  if (!order) {
    const nextOrderIn = s.nextOrderIn - dt
    if (nextOrderIn > 0) return { session: { ...next, nextOrderIn } }
    const request = pickRequest(task, s.lastRequestId, rng)
    const patience = task.patienceBaseSec + request.needs.length * task.patiencePerStepSec
    next = {
      ...next,
      nextOrderIn: 0,
      seq: s.seq + 1,
      lastRequestId: request.id,
      order: {
        seq: s.seq + 1,
        requestId: request.id,
        added: [],
        arriveLeft: task.arriveSec,
        patienceLeft: patience,
        patienceMax: patience,
        status: 'waiting',
        resolvedAt: -1,
      },
    }
  } else if (order.status === 'waiting') {
    if (order.arriveLeft > 0) {
      next.order = { ...order, arriveLeft: Math.max(0, order.arriveLeft - dt) }
    } else {
      const patienceLeft = order.patienceLeft - dt
      if (patienceLeft <= 0) {
        next = {
          ...next,
          meter: clampMeter(s.meter - CONFIG.work.meter.timeout),
          failed: s.failed + 1,
          order: { ...order, patienceLeft: 0, status: 'failed', resolvedAt: elapsed },
        }
        event = { type: 'timeout' }
      } else {
        next.order = { ...order, patienceLeft }
      }
    }
  } else if (elapsed - order.resolvedAt >= CONFIG.work.leaveDelaySec) {
    // Customer has left: schedule the next one.
    next = { ...next, order: null, nextOrderIn: task.customerGapSec }
  }

  return { session: next, event }
}

export function applyAction(s: WorkSession, task: TaskDef, actionId: string): StepResult {
  const order = s.order
  if (s.phase !== 'working' || !order || order.status !== 'waiting') {
    return { session: s, event: { type: 'noOrder' } }
  }
  const request = findRequest(task, order.requestId)
  if (!request) return { session: s }

  const have = countOf(order.added, actionId)
  const need = countOf(request.needs, actionId)
  if (have >= need) {
    // Wrong or extra ingredient: the drink is spilled and has to be restarted.
    return {
      session: { ...s, meter: clampMeter(s.meter - CONFIG.work.meter.wrong), order: { ...order, added: [] } },
      event: { type: 'wrong' },
    }
  }

  const added = [...order.added, actionId]
  if (!isComplete(request.needs, added)) {
    return { session: { ...s, order: { ...order, added } }, event: { type: 'step', actionId } }
  }

  const fast = order.patienceLeft / order.patienceMax >= CONFIG.work.fastThreshold
  const tip = fast ? task.tipPerFastOrder : 0
  const gain = CONFIG.work.meter.served + (fast ? CONFIG.work.meter.fastBonus : 0)
  return {
    session: {
      ...s,
      meter: clampMeter(s.meter + gain),
      served: s.served + 1,
      tips: s.tips + tip,
      order: { ...order, added, status: 'served', resolvedAt: s.elapsed },
    },
    event: { type: 'served', fast, tip },
  }
}

/** End the shift early (the player pressed "End shift"). */
export function finishSession(s: WorkSession): WorkSession {
  return s.phase === 'finished' ? s : { ...s, phase: 'finished' }
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step

export function computeReward(s: WorkSession, task: TaskDef): WorkReward {
  const fraction = Math.max(0, Math.min(1, s.elapsed / task.durationSec))
  const { min, max } = CONFIG.work.payMultiplier
  const multiplier = min + ((max - min) * s.meter) / 100
  const wage = roundTo(task.pay * fraction * multiplier, 1000)
  return {
    fraction,
    wage,
    tips: s.tips,
    total: wage + s.tips,
    xp: Math.round(task.xp * fraction),
    energy: Math.round(task.energyCost * fraction),
    minutes: Math.round(task.hours * 60 * fraction),
    mood: Math.round((s.meter - 50) * CONFIG.needs.workMoodFactor * fraction),
  }
}
