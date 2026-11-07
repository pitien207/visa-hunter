import { CONFIG } from '../../data/config'
import { VISA_DOCS, type DocDef, type DocStep, type VisaPath } from '../../data/visa'
import { useMinigame } from '../../store/minigameStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { pushToast } from '../../store/toastStore'
import { useUI } from '../../store/uiStore'
import { useWorld } from '../../store/worldStore'
import { registerActions } from './actions'
import { playSfx } from './audio'
import { bumpFlag, check, flagNumber, getFlag, registerTests, setFlag } from './conditions'
import { pay } from './effects'
import { spendTime } from './time'
import { travelTo } from './travel'

/**
 * The visa chapter (plan §6 chapter 2, milestone M5): choose a path, collect documents,
 * prove your finances, hunt a Termin, pass the embassy interview, fly to Germany.
 */

export const docFlag = (id: string) => `doc.${id}`
export const docReadyFlag = (id: string) => `doc.${id}.ready`

export function visaPath(): VisaPath | null {
  const p = getFlag('visa.path')
  return p === 'studium' || p === 'ausbildung' ? p : null
}

export function docsFor(path: VisaPath | null): DocDef[] {
  return VISA_DOCS.filter((d) => !d.path || d.path === path)
}

/**
 * Completed steps of a document. Auto steps count as soon as their condition holds
 * (those conditions only ever become true), so this is pure and safe during render.
 */
export function docProgress(doc: DocDef): number {
  let done = flagNumber(docFlag(doc.id))
  while (done < doc.steps.length && doc.steps[done].auto && check(doc.steps[done].auto)) done++
  return done
}

export function stepCost(step: DocStep): number {
  if (step.cost === 'finance') {
    const path = visaPath()
    return path ? CONFIG.visa.financeProof[path] : 0
  }
  return step.cost ?? 0
}

export function docsComplete(): boolean {
  const path = visaPath()
  if (!path) return false
  return docsFor(path).every((d) => docProgress(d) >= d.steps.length)
}

/** Press the next step of a document. */
export function doDocStep(id: string) {
  const doc = VISA_DOCS.find((d) => d.id === id)
  if (!doc) return false
  const done = docProgress(doc)
  const step = doc.steps[done]
  if (!step || step.auto) return false
  const player = usePlayer.getState()
  if (step.energy && player.energy < step.energy) {
    pushToast('toast.tooTired', 'bad')
    return false
  }
  const cost = stepCost(step)
  if (cost > 0 && !pay(cost)) return false
  if (step.cost === 'finance') setFlag('visa.blocked', cost)
  if (step.energy) player.spendEnergy(step.energy)
  if (step.minutes) spendTime(step.minutes)
  if (step.waitDays) setFlag(docReadyFlag(id), useTime.getState().day + step.waitDays)
  setFlag(docFlag(id), done + 1)
  playSfx('stamp')
  return true
}

export const terminDay = () => {
  const d = getFlag('visa.terminDay')
  return typeof d === 'number' ? d : null
}

export const visaReady = () => check({ dayReached: 'visa.readyDay' })

function choosePath(arg?: string) {
  if (arg !== 'studium' && arg !== 'ausbildung') return false
  setFlag('visa.path', arg)
  pushToast('toast.pathChosen', 'good')
  return true
}

function openPanel() {
  useUI.getState().openPanel({ type: 'visa' })
  return true
}

function hunt() {
  if (!visaPath()) return false
  const booked = terminDay()
  const { day } = useTime.getState()
  if (booked !== null && booked >= day) {
    pushToast('toast.terminAlready', 'info', { day: booked })
    return false
  }
  if (getFlag('visa.readyDay')) return false
  const rejected = getFlag('visa.rejectedDay')
  if (typeof rejected === 'number' && day < rejected + CONFIG.visa.rejectCooldownDays) {
    pushToast('toast.rejectCooldown', 'info')
    return false
  }
  bumpFlag('stats.terminTries')
  useMinigame.getState().start({ kind: 'termin', attempts: CONFIG.visa.terminAttempts }, (r) => {
    if (r.passed && r.value) {
      setFlag('visa.terminDay', useTime.getState().day + r.value)
      if (flagNumber('stats.terminTries') === 1) setFlag('achv.terminFirstTry', true)
      bumpFlag('stats.termins')
      pushToast('toast.terminBooked', 'good', { day: useTime.getState().day + r.value })
    } else {
      pushToast('toast.terminMissed', 'bad')
    }
  })
  return true
}

/** At the embassy, on the Termin day. */
function interview() {
  const path = visaPath()
  const day = useTime.getState().day
  if (!path || terminDay() !== day) {
    pushToast('toast.noTerminToday', 'bad')
    return false
  }
  setFlag('visa.terminDay', 0)
  if (!docsComplete()) {
    setFlag('visa.rejectedDay', day)
    usePlayer.getState().changeMood(-10)
    playSfx('fail')
    pushToast('toast.visaMissingDocs', 'bad')
    return true
  }
  useMinigame.getState().start(
    { kind: 'qa', set: path === 'studium' ? 'embassyStudium' : 'embassyAusbildung', count: 5, passScore: CONFIG.visa.interviewPassScore },
    (r) => {
      if (r.passed) {
        setFlag('visa.readyDay', useTime.getState().day + CONFIG.visa.approvalWaitDays)
        usePlayer.getState().changeMood(15)
        playSfx('stamp')
        pushToast('toast.visaApproved', 'good', { days: CONFIG.visa.approvalWaitDays })
      } else {
        setFlag('visa.rejectedDay', useTime.getState().day)
        usePlayer.getState().changeMood(-12)
        pushToast('toast.visaRejected', 'bad')
      }
    },
  )
  return true
}

function buyFlight() {
  if (!visaReady() || getFlag('visa.flight')) return false
  if (!pay(CONFIG.visa.flightCost)) return false
  setFlag('visa.flight', true)
  pushToast('toast.flightBought', 'good')
  return true
}

function rideTo(scene: 'embassy' | 'airport' | 'vietnam') {
  if (!pay(CONFIG.visa.xeOmFare)) return false
  travelTo(scene, scene === 'vietnam' ? 'xeOm' : 'default', { minutes: CONFIG.visa.xeOmMinutes })
  playSfx('honk')
  return true
}

function xeOmEmbassy() {
  const booked = terminDay()
  const { day, minutes } = useTime.getState()
  if (!booked) {
    pushToast('toast.noTermin', 'info')
    return false
  }
  if (booked > day) {
    pushToast('toast.terminLater', 'info', { day: booked })
    return false
  }
  if (booked < day) {
    setFlag('visa.terminDay', 0)
    pushToast('toast.terminExpired', 'bad')
    return false
  }
  const [open, close] = CONFIG.visa.embassyHours
  if (minutes / 60 < open || minutes / 60 >= close) {
    pushToast('toast.embassyClosed', 'info', { open, close })
    return false
  }
  return rideTo('embassy')
}

function xeOmAirport() {
  if (!visaReady()) {
    pushToast('toast.noVisaYet', 'info')
    return false
  }
  if (!getFlag('visa.flight')) {
    pushToast('toast.noFlight', 'info')
    return false
  }
  return rideTo('airport')
}

/** Board the plane: savings + blocked account become euros, next morning in Germany. */
function depart() {
  if (!getFlag('visa.flight')) return false
  const player = usePlayer.getState()
  const blocked = flagNumber('visa.blocked')
  const eur = (player.money + blocked) / CONFIG.visa.vndPerEur
  travelTo('germany', 'default', {
    long: true,
    label: { vi: 'Bay sang Đức… ✈ Frankfurt', en: 'Flying to Germany… ✈ Frankfurt', de: 'Flug nach Deutschland… ✈ Frankfurt' },
    onArrive: () => {
      usePlayer.getState().setMoney(eur, 'EUR')
      setFlag('visa.blocked', 0)
      const t = useTime.getState()
      t.setTime(t.day + 1, 9 * 60)
      setFlag('de.arrived', t.day + 1)
      usePlayer.getState().changeMood(10)
    },
  })
  return true
}

registerActions({
  'visa.choosePath': choosePath,
  'visa.openPanel': openPanel,
  'visa.termin': hunt,
  'visa.interview': interview,
  'visa.buyFlight': buyFlight,
  'xeOm.embassy': xeOmEmbassy,
  'xeOm.airport': xeOmAirport,
  'xeOm.home': () => rideTo('vietnam'),
  'flight.depart': depart,
})

registerTests({
  'visa.docsComplete': docsComplete,
  'visa.terminToday': () => terminDay() === useTime.getState().day,
  'visa.canHunt': () => !!visaPath() && !getFlag('visa.readyDay') && !(terminDay() !== null && (terminDay() ?? 0) >= useTime.getState().day),
  'visa.ready': visaReady,
})

/** For the HUD: is the visa panel relevant right now? */
export const visaChapterActive = () => !!visaPath() && useWorld.getState().scene !== 'germany' && !getFlag('de.arrived')
