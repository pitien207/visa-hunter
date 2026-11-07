import { CONFIG } from '../../data/config'
import type { DialogueEffect } from '../../data/dialogues'
import { getItem, type ItemDef } from '../../data/items'
import { currentLanguage, localize } from '../../i18n/localized'
import { translate } from '../../i18n'
import { useInventory } from '../../store/inventoryStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { useUI } from '../../store/uiStore'
import { runAction } from './actions'
import { bumpFlag, setFlag } from './conditions'
import { cameraState } from './cameraState'
import { playerState, releasePlayer, teleportPlayer, walkTo } from './playerState'
import { getSeat } from './registry'
import { saveGame } from './save'
import { canSleep, spendTime, weekdayIndex } from './time'

/**
 * Things that change the player's state: buying, eating, sitting down for a drink,
 * sleeping. Shared by dialogues, shops, the bag and interactables.
 */

const signed = (n: number) => (n > 0 ? `+${Math.round(n)}` : n < 0 ? `−${Math.abs(Math.round(n))}` : '±0')

/** Take money if there is enough; otherwise say so. */
export function pay(amount: number) {
  const player = usePlayer.getState()
  if (player.money < amount) {
    pushToast('toast.notEnoughMoney', 'bad')
    return false
  }
  player.addMoney(-amount)
  return true
}

/** Eat or drink an item: energy, mood and a bit of time. */
export function consumeItem(item: ItemDef) {
  const player = usePlayer.getState()
  player.restoreEnergy(item.energy)
  player.changeMood(item.mood)
  spendTime(item.minutes)
  pushToast('toast.consumed', 'good', {
    item: localize(item.name, currentLanguage()),
    energy: signed(item.energy),
    mood: signed(item.mood),
  })
}

export function buyItem(itemId: string, use: boolean) {
  const item = getItem(itemId)
  if (!item || !pay(item.price)) return false
  if (use) {
    consumeItem(item)
  } else {
    useInventory.getState().add(item.id)
    pushToast('toast.bought', 'good', { item: localize(item.name, currentLanguage()) })
  }
  return true
}

export function eatFromBag(itemId: string) {
  const item = getItem(itemId)
  if (!item || !useInventory.getState().remove(itemId)) return false
  consumeItem(item)
  return true
}

const SIP_SECONDS = 3.5

/** Pay, walk to a seat, sit, sip for a few seconds, then enjoy the effects and stand up. */
export function sitAndConsume(itemId: string, seatId: string) {
  const item = getItem(itemId)
  const seat = getSeat(seatId)
  if (!item || !seat || !pay(item.price)) return false
  const from = { x: playerState.position.x, z: playerState.position.z }
  walkTo(seat.approach ? seat.approach(from) : [seat], () => {
    playerState.faceYaw = seat.yaw
    playerState.pose = { sitY: seat.seatY, held: 'glass', sipping: true }
    window.setTimeout(() => {
      consumeItem(item)
      if (item.id === 'traDa') bumpFlag('stats.traDa')
      playerState.pose = null
      window.setTimeout(releasePlayer, 350)
    }, SIP_SECONDS * 1000)
  })
  return true
}

/** Start a new day at the wake-up hour. */
function wakeUp(energy: number, mood: number) {
  const time = useTime.getState()
  const { wakeHour } = CONFIG.time
  // Before midnight the morning is tomorrow; after midnight it's later today.
  const day = time.minutes >= wakeHour * 60 ? time.day + 1 : time.day
  time.setTime(day, wakeHour * 60)
  const player = usePlayer.getState()
  player.restoreEnergy(energy)
  player.changeMood(mood)
  saveGame()
  pushToast('toast.newDay', 'good', {
    weekday: translate(currentLanguage(), `weekday.${weekdayIndex(day)}` as 'weekday.0'),
    day,
  })
}

const SLEEP_MS = 2200

/** Sleep at home: full energy, better mood, next morning, autosave. */
export function goToSleep() {
  if (!canSleep()) {
    pushToast('toast.notSleepy', 'info')
    return
  }
  const ui = useUI.getState()
  ui.setSleeping(true)
  window.setTimeout(() => {
    const player = usePlayer.getState()
    wakeUp(player.maxEnergy, CONFIG.needs.sleepMood)
    useUI.getState().setSleeping(false)
  }, SLEEP_MS)
}

/** Stayed up too late: wake up at home, tired and grumpy. */
export function passOut() {
  const ui = useUI.getState()
  if (ui.sleeping) return
  ui.setSleeping(true)
  bumpFlag('stats.passedOut')
  pushToast('toast.passedOut', 'bad')
  window.setTimeout(() => {
    const player = usePlayer.getState()
    const missing = Math.max(0, CONFIG.needs.passOutEnergy - player.energy)
    const [x, , z] = CONFIG.player.spawn
    teleportPlayer(x, z)
    cameraState.yaw = CONFIG.camera.initialYaw
    wakeUp(missing, CONFIG.needs.passOutMood)
    useUI.getState().setSleeping(false)
  }, SLEEP_MS)
}

export function saveNow() {
  saveGame()
  pushToast('toast.saved', 'good')
}

/** Run a dialogue effect. Returns false if it couldn't happen (e.g. not enough money). */
export function applyEffect(effect: DialogueEffect): boolean {
  switch (effect.type) {
    case 'buy':
      return buyItem(effect.itemId, effect.use)
    case 'sitAndConsume':
      return sitAndConsume(effect.itemId, effect.seatId)
    case 'openShop':
      useUI.getState().openPanel({ type: 'shop', shopId: effect.shopId })
      return true
    case 'mood':
      usePlayer.getState().changeMood(effect.amount)
      return true
    case 'setFlag':
      setFlag(effect.key, effect.value)
      return true
    case 'action':
      return runAction(effect.id, effect.arg)
  }
}

/** Price shown next to a dialogue choice, if it costs money. */
export function effectCost(effect: DialogueEffect | undefined): number {
  if (!effect) return 0
  if (effect.type === 'buy' || effect.type === 'sitAndConsume') return getItem(effect.itemId)?.price ?? 0
  return 0
}
