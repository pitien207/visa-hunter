import { CONFIG } from '../../data/config'
import { SHOPS, type ShopId } from '../../data/shops'
import { useMinigame } from '../../store/minigameStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { useUI } from '../../store/uiStore'
import { useCare } from '../../store/careStore'
import { registerActions } from './actions'
import { playSfx } from './audio'
import { bumpFlag, flagNumber, getFlag, registerTests, setFlag } from './conditions'
import { goToSleep, pay } from './effects'
import { canSleep, spendTime, weekdayIndex } from './time'
import { travelTo } from './travel'

/**
 * Living in Germany (plan §6 chapter 3, milestone M6): WG, Bürgeramt, bank, insurance,
 * tickets, rent — and the start of the Ausbildung (chapter 4B, milestone M7).
 */

const g = CONFIG.germany
const today = () => useTime.getState().day
const hour = () => useTime.getState().minutes / 60
const isSunday = () => weekdayIndex(today()) === 6
const isWeekend = () => weekdayIndex(today()) >= 5

function officeOpen() {
  const [open, close] = g.officeHours
  return !isWeekend() && hour() >= open && hour() < close
}

// --- Housing -------------------------------------------------------------------

function hostel() {
  if (!canSleep()) {
    pushToast('toast.notSleepy', 'info')
    return false
  }
  if (!pay(g.hostelPerNight)) return false
  goToSleep()
  return true
}

function viewWg() {
  travelTo('wg', 'default', { minutes: 5 })
  playSfx('door')
  return true
}

function wgCasting() {
  if (getFlag('de.wg')) return false
  if (getFlag('de.castingDay') === today()) {
    pushToast('toast.castingTomorrow', 'info')
    return false
  }
  setFlag('de.castingDay', today())
  useMinigame.getState().start({ kind: 'qa', set: 'wgCasting', count: 5, passScore: g.wgCastingPassScore }, (r) => {
    if (r.passed) {
      setFlag('de.wg', today())
      usePlayer.getState().changeMood(12)
      pushToast('toast.wgAccepted', 'good', { rent: g.rentPerWeek })
    } else {
      usePlayer.getState().changeMood(-6)
      pushToast('toast.wgRejected', 'bad')
    }
  })
  return true
}

function leaveWg() {
  travelTo('germany', 'wg', { minutes: 5 })
  playSfx('door')
  return true
}

/** Weekly rent, charged on Monday mornings once you live in the WG. */
export function chargeRent() {
  const movedIn = getFlag('de.wg')
  if (typeof movedIn !== 'number' || today() <= movedIn || weekdayIndex(today()) !== 0) return
  if (getFlag('de.rentPaidDay') === today()) return
  setFlag('de.rentPaidDay', today())
  const p = usePlayer.getState()
  if (p.money >= g.rentPerWeek) {
    p.addMoney(-g.rentPerWeek)
    bumpFlag('stats.rentPaid')
    pushToast('toast.rentPaid', 'info', { rent: g.rentPerWeek })
  } else {
    bumpFlag('de.rentDebt', g.rentPerWeek)
    p.changeMood(-10)
    pushToast('toast.rentMissing', 'bad', { rent: g.rentPerWeek })
  }
}

// --- Bürgeramt -----------------------------------------------------------------

function enterBuergeramt() {
  if (!officeOpen()) {
    pushToast('toast.officeClosed', 'info', { open: g.officeHours[0], close: g.officeHours[1] })
    return false
  }
  travelTo('buergeramt', 'default', { minutes: 5 })
  playSfx('door')
  return true
}

function leaveBuergeramt() {
  travelTo('germany', 'buergeramt', { minutes: 5 })
  playSfx('door')
  return true
}

/** "Ohne Termin geht nichts" — the Termin hunt, again. */
function buergeramtTermin() {
  const booked = getFlag('de.anmeldungTermin')
  if (typeof booked === 'number' && booked >= today()) {
    pushToast('toast.terminAlready', 'info', { day: booked })
    return false
  }
  bumpFlag('stats.terminTries')
  useMinigame.getState().start({ kind: 'termin', attempts: 4 }, (r) => {
    if (r.passed && r.value) {
      setFlag('de.anmeldungTermin', today() + r.value)
      bumpFlag('stats.termins')
      pushToast('toast.terminBooked', 'good', { day: today() + r.value })
    } else {
      pushToast('toast.terminMissed', 'bad')
    }
  })
  return true
}

function takeNumber() {
  if (getFlag('de.anmeldungTermin') !== today()) {
    pushToast('toast.noTerminToday', 'bad')
    return false
  }
  if (getFlag('de.numberDay') === today()) {
    pushToast('toast.numberCalled', 'info', { number: String(getFlag('de.number') ?? '') })
    return true
  }
  const number = `A-${300 + Math.floor(Math.random() * 600)}`
  setFlag('de.number', number)
  pushToast('toast.numberTaken', 'info', { number })
  spendTime(g.waitMinutes)
  setFlag('de.numberDay', today())
  window.setTimeout(() => {
    playSfx('coin')
    pushToast('toast.numberCalled', 'good', { number })
  }, 900)
  return true
}

function anmeldung() {
  if (getFlag('de.anmeldung')) return false
  if (getFlag('de.numberDay') !== today()) {
    pushToast('toast.takeNumberFirst', 'info')
    return false
  }
  if (!getFlag('de.wg')) {
    pushToast('toast.needWohnungsgeber', 'bad')
    return false
  }
  useMinigame.getState().start({ kind: 'qa', set: 'anmeldung', count: 4, passScore: 0.6 }, (r) => {
    if (r.passed) {
      setFlag('de.anmeldung', today())
      playSfx('stamp')
      pushToast('toast.anmeldungDone', 'good')
    } else {
      setFlag('de.numberDay', 0)
      pushToast('toast.formWrong', 'bad')
    }
  })
  return true
}

// --- Bank, insurance, tickets -----------------------------------------------------

function openBank() {
  if (getFlag('de.bank')) return false
  if (!getFlag('de.anmeldung')) {
    pushToast('toast.needAnmeldung', 'bad')
    return false
  }
  spendTime(45)
  setFlag('de.bank', today())
  playSfx('stamp')
  pushToast('toast.bankDone', 'good')
  return true
}

function insurance() {
  if (getFlag('de.insurance')) return false
  spendTime(40)
  setFlag('de.insurance', today())
  playSfx('stamp')
  pushToast('toast.insuranceDone', 'good')
  return true
}

const ticketValid = () => flagNumber('de.ticketUntil') >= today()

function buyTicket() {
  if (ticketValid()) {
    pushToast('toast.ticketStillValid', 'info', { day: flagNumber('de.ticketUntil') })
    return false
  }
  if (!pay(g.ticketPerWeek)) return false
  setFlag('de.ticketUntil', today() + 6)
  playSfx('coin')
  pushToast('toast.ticketBought', 'good', { day: today() + 6 })
  return true
}

/** Ride the tram. No valid ticket? A ticket inspector may be on board… */
function tram(arg?: string) {
  const dest = arg === 'careHome' ? 'careHome' : 'germany'
  if (!ticketValid()) {
    bumpFlag('stats.schwarzfahren')
    if (Math.random() < g.fareCheckChance) {
      usePlayer.getState().addMoney(-Math.min(usePlayer.getState().money, g.fareDodgeFine))
      usePlayer.getState().changeMood(-8)
      pushToast('toast.fareFine', 'bad', { fine: g.fareDodgeFine })
    }
  }
  travelTo(dest, dest === 'germany' ? 'tram' : 'default', {
    minutes: g.tramMinutes,
    label: dest === 'careHome' ? undefined : { vi: 'Về Lindenstraße', en: 'Back to Lindenstraße', de: 'Zurück zur Lindenstraße' },
  })
  playSfx('door')
  return true
}

// --- Shops ---------------------------------------------------------------------

export function shopOpen(id: ShopId): boolean {
  const shop = SHOPS[id] as { hours?: [number, number]; closedSunday?: boolean }
  if (shop.closedSunday && isSunday()) return false
  if (shop.hours && (hour() < shop.hours[0] || hour() >= shop.hours[1])) return false
  return true
}

function openShop(arg?: string) {
  const id = arg as ShopId
  if (!SHOPS[id]) return false
  if (!shopOpen(id)) {
    pushToast(isSunday() && (SHOPS[id] as { closedSunday?: boolean }).closedSunday ? 'toast.sundayClosed' : 'toast.shopClosed', 'info')
    return false
  }
  useUI.getState().openPanel({ type: 'shop', shopId: id })
  return true
}

// --- Care home (M7) ---------------------------------------------------------------

export const paperworkDone = () => !!getFlag('de.anmeldung') && !!getFlag('de.bank') && !!getFlag('de.insurance')

function startShift() {
  if (!paperworkDone()) {
    pushToast('toast.paperworkFirst', 'bad')
    return false
  }
  if (getFlag('care.lastShiftDay') === today()) {
    pushToast('toast.shiftDoneToday', 'info')
    return false
  }
  const [from, to] = CONFIG.care.startHours
  if (hour() < from || hour() >= to) {
    pushToast('toast.shiftHours', 'info', { from, to })
    return false
  }
  if (usePlayer.getState().energy < CONFIG.care.energyCost) {
    pushToast('toast.tooTired', 'bad')
    return false
  }
  useCare.getState().start()
  pushToast('toast.shiftStarted', 'good')
  return true
}

function berufsschule() {
  if (getFlag('care.schoolDay') === today()) {
    pushToast('toast.schoolDoneToday', 'info')
    return false
  }
  setFlag('care.schoolDay', today())
  spendTime(90)
  useMinigame.getState().start({ kind: 'vocab', level: 3, count: 6 }, (r) => {
    usePlayer.getState().addSkillXp('pflege', r.correct * 2)
    bumpFlag('stats.berufsschule')
    pushToast('toast.schoolXp', 'good', { xp: r.correct * 2 })
  })
  return true
}

registerTests({
  'de.officeOpen': officeOpen,
  'de.ticketValid': ticketValid,
  'de.paperworkDone': paperworkDone,
  'de.canTakeNumber': () => getFlag('de.anmeldungTermin') === today() && getFlag('de.numberDay') !== today(),
  'de.numberCalled': () => getFlag('de.numberDay') === today(),
})

/** Video call home from the WG laptop: once a day, a big mood boost. */
function callHome() {
  if (getFlag('de.callDay') === today()) {
    pushToast('toast.calledToday', 'info')
    return false
  }
  setFlag('de.callDay', today())
  spendTime(30)
  usePlayer.getState().changeMood(12)
  pushToast('toast.calledHome', 'good')
  return true
}

registerActions({
  'de.sleep': () => {
    goToSleep()
    return true
  },
  'de.callHome': callHome,
  'de.hostel': hostel,
  'de.viewWg': viewWg,
  'de.wgCasting': wgCasting,
  'de.leaveWg': leaveWg,
  'de.enterBuergeramt': enterBuergeramt,
  'de.leaveBuergeramt': leaveBuergeramt,
  'de.buergeramtTermin': buergeramtTermin,
  'de.takeNumber': takeNumber,
  'de.anmeldung': anmeldung,
  'de.openBank': openBank,
  'de.insurance': insurance,
  'de.buyTicket': buyTicket,
  'de.tram': tram,
  'de.openShop': openShop,
  'care.startShift': startShift,
  'care.berufsschule': berufsschule,
})
