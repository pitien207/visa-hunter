import { CONFIG } from '../../data/config'
import { usePlayer } from '../../store/playerStore'
import { pushToast } from '../../store/toastStore'
import { registerActions } from './actions'
import { playSfx } from './audio'
import { bumpFlag, flagNumber, setFlag } from './conditions'

/** Pfand (plan §6 side hustles, milestone M8): collect bottles, return them for 25 cents each. */

export const carried = () => flagNumber('pfand.carried')

export function pickUpBottle() {
  bumpFlag('pfand.carried')
  playSfx('pickup')
  pushToast('toast.bottlePicked', 'info', { n: carried() })
}

function returnBottles() {
  const n = carried()
  if (n === 0) {
    pushToast('toast.noBottles', 'info')
    return false
  }
  const money = Math.round(n * CONFIG.pfand.perBottle * 100) / 100
  usePlayer.getState().addMoney(money)
  setFlag('pfand.carried', 0)
  bumpFlag('stats.bottles', n)
  playSfx('coin')
  pushToast('toast.pfandReturned', 'good', { n, money: money.toFixed(2).replace('.', ',') })
  return true
}

registerActions({ 'de.pfandReturn': returnBottles })
