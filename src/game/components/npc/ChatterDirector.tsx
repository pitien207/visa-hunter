import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONVERSATIONS, SOLO_LINES, type ChatLine } from '../../../data/chatter'
import { CONFIG } from '../../../data/config'
import { useBubbles } from '../../../store/bubbleStore'
import { useDialogue } from '../../../store/dialogueStore'
import { playerState } from '../../systems/playerState'
import { npcPositions } from '../../systems/registry'

const rand = ([min, max]: [number, number]) => min + Math.random() * (max - min)

/** Only chat where the player can see it, and never over an open conversation. */
function canSpeak(id: string) {
  if (useDialogue.getState().npcId === id) return false
  const at = npcPositions.get(id)
  if (!at) return false
  const p = playerState.position
  return Math.hypot(at.x - p.x, at.z - p.z) < CONFIG.npc.bubbleRange
}

interface Props {
  /** Conversation groups from data/chatter.ts (e.g. "traDa"). */
  groups: string[]
  /** NPC ids that say one-liners from SOLO_LINES[id]. */
  solos: string[]
}

/** Makes the street talk: trà đá gossip line by line, plus the odd one-liner. */
export function ChatterDirector({ groups, solos }: Props) {
  const timers = useRef(new Map<string, number>())
  const queues = useRef(new Map<string, { lines: ChatLine[]; wait: number }>())

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const t = timers.current
    const say = useBubbles.getState().say

    for (const group of groups) {
      const queue = queues.current.get(group)
      if (queue) {
        queue.wait -= dt
        if (queue.wait > 0) continue
        const line = queue.lines.shift()
        if (line && canSpeak(line.speaker)) say(line.speaker, line.text)
        if (queue.lines.length === 0) queues.current.delete(group)
        else queue.wait = CONFIG.npc.bubbleSec * 0.9
        continue
      }
      const left = (t.get(group) ?? rand([2, 5])) - dt
      t.set(group, left)
      if (left > 0) continue
      t.set(group, rand(CONFIG.npc.chatIntervalSec))
      const options = CONVERSATIONS[group] ?? []
      const pick = options[Math.floor(Math.random() * options.length)]
      if (pick && canSpeak(pick[0].speaker)) queues.current.set(group, { lines: [...pick], wait: 0 })
    }

    for (const entry of solos) {
      // "npcId" or "npcId:linesKey" (same person, other country's lines)
      const [id, key = id] = entry.split(':')
      const left = (t.get(entry) ?? rand([3, 10])) - dt
      t.set(entry, left)
      if (left > 0) continue
      t.set(entry, rand(CONFIG.npc.soloIntervalSec))
      const lines = SOLO_LINES[key] ?? []
      if (lines.length && canSpeak(id)) say(id, lines[Math.floor(Math.random() * lines.length)])
    }
  })

  return null
}
