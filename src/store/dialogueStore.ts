import { create } from 'zustand'

interface DialogueState {
  npcId: string | null
  dialogueId: string | null
  nodeId: string | null
  /** Which of the node's text variants was picked. */
  variant: number
  /** Bumps on every node change so the UI can restart its typewriter. */
  step: number
  set: (patch: Partial<Omit<DialogueState, 'set'>>) => void
}

/** The open conversation, if any. Logic lives in game/systems/dialogue.ts. */
export const useDialogue = create<DialogueState>()((set) => ({
  npcId: null,
  dialogueId: null,
  nodeId: null,
  variant: 0,
  step: 0,
  set: (patch) => set(patch),
}))
