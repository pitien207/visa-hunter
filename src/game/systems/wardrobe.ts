import { getClothing, type ClothingSlot } from '../../data/clothes'
import { PLAYER_OUTFIT, type Outfit } from '../../data/npcs'
import { usePlayer } from '../../store/playerStore'
import { pushToast } from '../../store/toastStore'
import { currentLanguage, localize } from '../../i18n/localized'
import { playSfx } from './audio'
import { bumpFlag } from './conditions'
import { pay } from './effects'
import { registerActions } from './actions'
import { useUI } from '../../store/uiStore'

/** Which outfit fields each slot controls (to reset a slot to the default look). */
const SLOT_FIELDS: Record<ClothingSlot, (keyof Outfit)[]> = {
  shirt: ['shirt'],
  shorts: ['shorts'],
  shoe: ['shoe'],
  hat: ['accessory', 'accent'],
  hair: ['hairStyle', 'hair'],
  bag: ['bag'],
}

export function isWearing(id: string): boolean {
  const item = getClothing(id)
  if (!item) return false
  const outfit = usePlayer.getState().outfit
  return Object.entries(item.apply).every(([k, v]) => outfit[k as keyof Outfit] === v)
}

/** Buy a clothing item (or haircut) and put it on straight away. */
export function buyClothing(id: string) {
  const item = getClothing(id)
  const p = usePlayer.getState()
  if (!item || p.wardrobe.includes(id)) return false
  if (item.currency !== p.currency) return false
  if (!pay(item.price)) return false
  p.addClothing(id)
  bumpFlag('stats.clothes')
  wear(id)
  playSfx('success')
  pushToast('toast.boughtClothes', 'good', { item: localize(item.name, currentLanguage()) })
  return true
}

export function wear(id: string) {
  const item = getClothing(id)
  const p = usePlayer.getState()
  if (!item || !p.wardrobe.includes(id)) return
  p.setOutfit({ ...p.outfit, ...item.apply })
}

/** Back to the default look for that slot. */
export function takeOff(slot: ClothingSlot) {
  const p = usePlayer.getState()
  const next = { ...p.outfit }
  for (const field of SLOT_FIELDS[slot]) (next as Record<string, unknown>)[field] = PLAYER_OUTFIT[field]
  p.setOutfit(next)
}

registerActions({
  'clothes.open': (shopId?: string) => {
    if (!shopId) return false
    useUI.getState().openPanel({ type: 'clothes', shopId })
    return true
  },
})
