import { CONFIG } from '../../data/config'
import { DIALOGUES, type DialogueChoice, type DialogueNode } from '../../data/dialogues'
import { getNpc } from '../../data/npcs'
import { localize, type Localized } from '../../i18n/localized'
import type { Language } from '../../store/settingsStore'
import { useDialogue } from '../../store/dialogueStore'
import { useFlags } from '../../store/flagsStore'
import { useTime } from '../../store/timeStore'
import { useUI } from '../../store/uiStore'
import { cameraState, resetCameraFocus } from './cameraState'
import { check } from './conditions'
import { applyEffect } from './effects'
import { playerState, releasePlayer } from './playerState'
import { npcPositions } from './registry'
import { spendTime } from './time'

/** Running conversations: open, step through nodes, pick choices, close. */

export const talkedFlag = (npcId: string) => `talked.${npcId}`

export function currentNode(): DialogueNode | null {
  const { dialogueId, nodeId } = useDialogue.getState()
  if (!dialogueId || !nodeId) return null
  return DIALOGUES[dialogueId]?.nodes[nodeId] ?? null
}

export function nodeText(node: DialogueNode, variant: number): Localized {
  return Array.isArray(node.text) ? node.text[variant % node.text.length] : node.text
}

/** Fill {placeholders} from the open dialogue's vars. */
export function fillDialogueVars(text: string): string {
  const { dialogueId } = useDialogue.getState()
  const vars = dialogueId ? DIALOGUES[dialogueId]?.vars?.() : undefined
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m))
}

/** The node's line in the given language, with {placeholders} filled in. */
export function dialogueLine(node: DialogueNode, variant: number, language: Language): string {
  return fillDialogueVars(localize(nodeText(node, variant), language))
}

/** Choices whose condition currently holds. */
export function visibleChoices(node: DialogueNode): DialogueChoice[] {
  return (node.choices ?? []).filter((c) => check(c.if))
}

function goTo(nodeId: string) {
  const { dialogueId, step } = useDialogue.getState()
  const node = dialogueId ? DIALOGUES[dialogueId]?.nodes[nodeId] : undefined
  if (!node) {
    closeDialogue()
    return
  }
  const variant = Array.isArray(node.text) ? Math.floor(Math.random() * node.text.length) : 0
  useDialogue.getState().set({ nodeId, variant, step: step + 1 })
}

export function openDialogue(npcId: string) {
  const npc = getNpc(npcId)
  const def = npc?.dialogueId ? DIALOGUES[npc.dialogueId] : undefined
  if (!npc || !def || useDialogue.getState().npcId) return
  // Not while sitting down or being walked somewhere — that sequence owns the player.
  if (playerState.pose || playerState.path.length > 0) return

  // Stop the player and turn toward the NPC.
  playerState.locked = true
  playerState.path = []
  useUI.getState().setMovementLocked(true)
  const at = npcPositions.get(npcId)
  if (at) playerState.faceYaw = Math.atan2(at.x - playerState.position.x, at.z - playerState.position.z)
  cameraState.zoom = 0.82

  useFlags.getState().setFlag(talkedFlag(npcId), useTime.getState().day)
  useDialogue.getState().set({ npcId, dialogueId: npc.dialogueId })
  const start = typeof def.start === 'string' ? def.start : (def.start.find((s) => check(s.if))?.node ?? def.start[def.start.length - 1].node)
  goTo(start)
}

export function closeDialogue() {
  if (!useDialogue.getState().npcId) return
  useDialogue.getState().set({ npcId: null, dialogueId: null, nodeId: null })
  releasePlayer()
  resetCameraFocus()
  spendTime(CONFIG.time.talkMinutes)
}

/** Tap on the text: go to `next`, or close if the node has nothing else. */
export function advanceDialogue() {
  const node = currentNode()
  if (!node || visibleChoices(node).length) return
  if (node.next) goTo(node.next)
  else closeDialogue()
}

export function chooseOption(index: number) {
  const node = currentNode()
  const choice = node ? visibleChoices(node)[index] : undefined
  if (!choice) return
  if (choice.next) {
    // Stay in the conversation: run the effect first, continue only if it worked.
    if (choice.effect && !applyEffect(choice.effect)) return
    goTo(choice.next)
  } else {
    // Leave the conversation first so effects like walking to a seat can take over.
    closeDialogue()
    if (choice.effect) applyEffect(choice.effect)
  }
}
