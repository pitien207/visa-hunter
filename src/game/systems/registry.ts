import type { PointXZ } from './playerState'

/** Places the player can sit (registered by scene components, used by effects). */
export interface Seat extends PointXZ {
  yaw: number
  /** Height of the seat surface. */
  seatY: number
  /** Waypoints to reach the seat from where the player stands (last = the seat). */
  approach?: (from: PointXZ) => PointXZ[]
}

const seats = new Map<string, Seat>()

export function registerSeat(id: string, seat: Seat) {
  seats.set(id, seat)
  return () => {
    if (seats.get(id) === seat) seats.delete(id)
  }
}

export const getSeat = (id: string) => seats.get(id)

/** Live NPC positions (written by NPCs every frame), e.g. so the player can face whoever they talk to. */
export const npcPositions = new Map<string, PointXZ>()
