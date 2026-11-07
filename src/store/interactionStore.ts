import { create } from 'zustand'
import type { ActionIconName } from '../data/tasks'
import type { ZoneXZ } from '../game/systems/playerState'
import type { I18nKey } from '../i18n'
import type { Localized } from '../i18n/localized'
import { pushToast } from './toastStore'

/** One round button in the bottom-right context menu (plan §4). */
export interface ContextAction {
  id: string
  labelKey: I18nKey
  icon: ActionIconName
  onPress: () => void
  /** Shown greyed out (pressing still calls onPress, e.g. to explain why). */
  muted?: boolean
  primary?: boolean
}

export interface InteractableDef {
  id: string
  /** Name shown above the buttons: a UI string key, or content text (NPC names). */
  nameKey?: I18nKey
  name?: Localized
  subtitle?: Localized
  /** Standing inside this box (world XZ) focuses the interactable. */
  zone: ZoneXZ
  /** Higher wins when zones overlap. */
  priority?: number
  /** 0–4 actions; empty hides the buttons (e.g. while walking into position). */
  actions: ContextAction[]
}

interface InteractionState {
  items: Record<string, InteractableDef>
  focusedId: string | null
  register: (def: InteractableDef) => void
  unregister: (id: string) => void
  setFocused: (id: string | null) => void
}

export const useInteraction = create<InteractionState>()((set) => ({
  items: {},
  focusedId: null,
  register: (def) => set((s) => ({ items: { ...s.items, [def.id]: def } })),
  unregister: (id) =>
    set((s) => {
      const items = { ...s.items }
      delete items[id]
      return { items, focusedId: s.focusedId === id ? null : s.focusedId }
    }),
  setFocused: (focusedId) => set({ focusedId }),
}))

/** Actions of the focused interactable (empty array when nothing is in reach). */
export function useFocusedActions(): { def: InteractableDef | null; actions: ContextAction[] } {
  const def = useInteraction((s) => (s.focusedId ? (s.items[s.focusedId] ?? null) : null))
  return { def, actions: def?.actions ?? [] }
}

/** Press the main action of an interactable — used by the E key and by tapping the object. */
export function triggerPrimary(id?: string) {
  const { focusedId, items } = useInteraction.getState()
  const targetId = id ?? focusedId
  if (!targetId) return
  if (targetId !== focusedId) {
    pushToast('toast.comeCloser')
    return
  }
  // Only explicit primary actions: tapping the counter mid-shift must not add an ingredient.
  items[targetId]?.actions.find((a) => a.primary)?.onPress()
}
