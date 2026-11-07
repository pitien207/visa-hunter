/**
 * Named game actions that data (dialogue choices, interactables) can trigger by id,
 * e.g. { type: 'action', id: 'german.lesson' }. Feature modules register theirs at
 * import time (see game/systems/gameplay.ts). Return false if the action couldn't run.
 */
export type GameAction = (arg?: string) => boolean | void

const actions = new Map<string, GameAction>()

export function registerActions(map: Record<string, GameAction>) {
  for (const [id, fn] of Object.entries(map)) actions.set(id, fn)
}

export function runAction(id: string, arg?: string): boolean {
  const fn = actions.get(id)
  if (!fn) {
    console.warn(`Unknown game action: ${id}`)
    return false
  }
  return fn(arg) !== false
}
