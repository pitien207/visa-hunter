import { CONFIG } from '../../data/config'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { registerActions } from './actions'
import { registerTests } from './conditions'
import { playSfx } from './audio'
import { waitFor } from './calendar'
import { goToSleep, saveNow } from './effects'
import { travelTo } from './travel'

/** Doors of Hà Nội: your home and the German centre in the lane. */

const hour = () => useTime.getState().minutes / 60

export function schoolOpen() {
  const [open, close] = CONFIG.school.hours
  return hour() >= open && hour() < close
}

function enterSchool() {
  if (!schoolOpen()) {
    const [open, close] = CONFIG.school.hours
    pushToast('toast.schoolClosed', 'info', { open, close })
    return false
  }
  playSfx('door')
  travelTo('classroom', 'default', { minutes: 2 })
  return true
}

function leaveSchool() {
  playSfx('door')
  travelTo('vietnam', 'center', { minutes: 2 })
  return true
}

function enterHome() {
  playSfx('door')
  travelTo('home', 'default', { minutes: 1 })
  return true
}

function leaveHome() {
  playSfx('door')
  travelTo('vietnam', 'home', { minutes: 1 })
  return true
}

/** A short nap: an hour passes quickly, a little energy comes back. */
function nap() {
  const ok = waitFor(CONFIG.time.napMinutes, { vi: 'Chợp mắt một lát… 💤', en: 'A quick nap… 💤', de: 'Ein kurzes Nickerchen… 💤' }, () => {
    usePlayer.getState().restoreEnergy(CONFIG.time.napEnergy)
    pushToast('toast.napDone', 'good', { energy: CONFIG.time.napEnergy })
  })
  return ok
}

registerActions({
  'school.enter': enterSchool,
  'school.leave': leaveSchool,
  'school.fromExam': () => {
    travelTo('classroom', 'default', { minutes: 5 })
    return true
  },
  'home.enter': enterHome,
  'home.leave': leaveHome,
  'home.sleep': () => {
    goToSleep()
    return true
  },
  'home.nap': nap,
  'home.save': () => {
    saveNow()
    return true
  },
})

registerTests({ 'school.open': schoolOpen })
