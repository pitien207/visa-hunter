import type { TranslateVars } from '../i18n'
import type { Localized } from '../i18n/localized'
import type { Condition } from './conditions'
import type { ItemId } from './items'
import type { ShopId } from './shops'

/**
 * Conversations with interactive NPCs. A node shows text (one line, or a random pick
 * from several) and then either moves to `next`, offers choices, or ends.
 * Text may contain {placeholders} filled by the dialogue's `vars()`.
 */

export type DialogueEffect =
  /** Pay for an item and eat/drink it now (`use`) or put it in the bag. */
  | { type: 'buy'; itemId: ItemId; use: boolean }
  /** Pay for an item, walk to a seat, sit down and enjoy it. */
  | { type: 'sitAndConsume'; itemId: ItemId; seatId: string }
  | { type: 'openShop'; shopId: ShopId }
  | { type: 'mood'; amount: number }
  | { type: 'setFlag'; key: string; value: number | boolean | string }
  /** Any named game action (game/systems/actions.ts), e.g. "german.lesson". */
  | { type: 'action'; id: string; arg?: string }

export interface DialogueChoice {
  text: Localized
  /** Node to go to after the effect; omit to end the conversation. */
  next?: string
  effect?: DialogueEffect
  /** Only offered when this holds. */
  if?: Condition
  /** Price shown on the button (the effect does the paying). */
  cost?: number
}

export interface DialogueNode {
  text: Localized | Localized[]
  next?: string
  choices?: DialogueChoice[]
}

export interface DialogueDef {
  /** First node, or the first entry whose condition holds. */
  start: string | { if?: Condition; node: string }[]
  nodes: Record<string, DialogueNode>
  /** Values for {placeholders} in this dialogue's text. */
  vars?: () => TranslateVars
}
