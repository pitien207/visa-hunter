import { CONFIG } from '../../data/config'
import { usePlayer } from '../../store/playerStore'
import { useMinigame, type MinigameSpec } from '../../store/minigameStore'
import { pushToast } from '../../store/toastStore'
import { registerActions } from './actions'
import { bumpFlag, flagNumber, germanXpNeeded, getFlag, registerTests, setFlag } from './conditions'
import { pay } from './effects'
import { spendTime } from './time'
import { useTime } from '../../store/timeStore'
import { formatMoney } from '../../i18n/format'
import { useUI } from '../../store/uiStore'
import { useWorld } from '../../store/worldStore'
import type { Localized } from '../../i18n/localized'
import { CLASSROOM, EXAM_HALL, HOME_ROOM, type Seat } from '../scenes/interiors'
import { playSfx } from './audio'
import { sitAt, standUp } from './seat'
import { travelTo } from './travel'

/**
 * Learning German (plan §6 chapter 1, milestone M4): enrol in a course, practise with
 * mini-games to earn XP, then pass the certificate exam to reach the next level.
 * Level index = certificates passed so far (0 → working toward A1).
 */

export const courseFlag = (level: number) => `course.${level}`
export const certFlag = (level: number) => `cert.${level}`
export const levelName = (level: number) => CONFIG.german.levels[level]?.name ?? 'B1+'

/** Which practice game a lesson uses, rotating for variety. */
function lessonSpec(level: number): MinigameSpec {
  const n = flagNumber('german.lessons') % 3
  if (n === 0) return { kind: 'vocab', level, count: 6 }
  if (n === 1) return { kind: 'derdiedas', level, count: 8 }
  return { kind: 'sentence', level, count: 3 }
}

function gainXp(correct: number, total: number, factor: number) {
  const g = CONFIG.german
  const xp = Math.round((correct * g.xpPerCorrect + (correct === total ? g.perfectBonus : 0)) * factor)
  usePlayer.getState().addGermanXp(xp)
  bumpFlag('log.germanXp', xp)
  const { german } = usePlayer.getState()
  const need = germanXpNeeded(german.level)
  pushToast('toast.germanXp', 'good', { xp, have: Math.min(german.xp, need), need })
  if (correct === total) bumpFlag('stats.perfectLessons')
}

function enroll() {
  const { level } = usePlayer.getState().german
  const course = CONFIG.german.levels[level]
  if (!course) return false
  if (getFlag(courseFlag(level))) return true
  if (!pay(course.courseFee)) return false
  setFlag(courseFlag(level), useTime.getState().day)
  pushToast('toast.enrolled', 'good', { level: course.name })
  return true
}

const L = (vi: string, en: string, de: string): Localized => ({ vi, en, de })

/** Where you sit for a lesson in the current scene (none in the WG: the laptop is enough). */
function studySeat(): { seat: Seat; intro: { icon: string; label: Localized; tone: 'chalk' | 'paper' } } | null {
  const scene = useWorld.getState().scene
  const lessonNo = flagNumber('german.lessons') + 1
  if (scene === 'classroom') {
    return {
      seat: CLASSROOM.seat,
      intro: { icon: '🔔', label: L(`Vào tiết · Bài ${lessonNo}`, `Class begins · Lesson ${lessonNo}`, `Unterricht · Lektion ${lessonNo}`), tone: 'chalk' },
    }
  }
  if (scene === 'home') {
    return { seat: HOME_ROOM.deskSeat, intro: { icon: '📖', label: L('Tự học bên bàn học', 'Studying at your desk', 'Lernen am Schreibtisch'), tone: 'paper' } }
  }
  return null
}

/** Ring the bell (or open the notebook), sit down, then start the mini-game. */
function startLesson(spec: MinigameSpec, onDone: (correct: number, total: number) => void) {
  const place = studySeat()
  const run = () =>
    useMinigame.getState().start(spec, (r) => {
      onDone(r.correct, r.total)
      if (place) standUp()
    })
  if (!place) {
    run()
    return
  }
  const ui = useUI.getState()
  ui.setTransition({ label: place.intro.label, long: false, icon: place.intro.icon, tone: place.intro.tone })
  playSfx(place.intro.icon === '🔔' ? 'bell' : 'click')
  window.setTimeout(() => {
    sitAt(place.seat)
    window.setTimeout(() => {
      useUI.getState().setTransition(null)
      run()
    }, 350)
  }, 900)
}

function practise(factor: number, minutes: number, energy: number) {
  const player = usePlayer.getState()
  const { level } = player.german
  if (level >= CONFIG.german.levels.length) {
    pushToast('toast.germanMaxed', 'info')
    return false
  }
  if (player.energy < energy) {
    pushToast('toast.tooTired', 'bad')
    return false
  }
  player.spendEnergy(energy)
  spendTime(minutes)
  const spec = lessonSpec(level)
  startLesson(spec, (correct, total) => gainXp(correct, total, factor))
  bumpFlag('german.lessons')
  return true
}

/** A lesson in class: needs the current course. */
function lesson() {
  const { level } = usePlayer.getState().german
  if (!getFlag(courseFlag(level))) {
    pushToast('toast.notEnrolled', 'info')
    return false
  }
  const g = CONFIG.german
  return practise(1, g.lessonMinutes, g.lessonEnergy)
}

/** Studying alone at home: free, but half the XP. */
function selfStudy() {
  const g = CONFIG.german
  return practise(g.selfStudyXpFactor, g.selfStudyMinutes, g.selfStudyEnergy)
}

function exam() {
  const player = usePlayer.getState()
  const { level, xp } = player.german
  const course = CONFIG.german.levels[level]
  if (!course) return false
  if (xp < course.xpToExam) {
    pushToast('toast.notReadyForExam', 'info', { have: xp, need: course.xpToExam })
    return false
  }
  if (!pay(course.examFee)) return false
  // Off to the exam room: sit at your numbered desk, then the paper is handed out.
  travelTo('examHall', 'default', {
    icon: '📝',
    label: L(`Kỳ thi tiếng Đức ${course.name}`, `German exam ${course.name}`, `Deutschprüfung ${course.name}`),
    subtitle: L('Phòng thi · Giữ trật tự', 'Exam room · Quiet please', 'Prüfungsraum · Bitte Ruhe'),
    tone: 'paper',
    onDone: () => {
      sitAt(EXAM_HALL.seat, 0, 0.7)
      window.setTimeout(() => useMinigame.getState().start({ kind: 'exam', level }, (r) => finishExam(r.passed, level, xp)), 500)
    },
  })
  return true
}

function finishExam(passed: boolean, level: number, xpBefore: number) {
  const course = CONFIG.german.levels[level]
  const p = usePlayer.getState()
  spendTime(CONFIG.german.examMinutes)
  if (passed) {
    p.setGerman({ level: level + 1, xp: 0 })
    p.changeMood(CONFIG.german.examPassMood)
    setFlag(certFlag(level), useTime.getState().day)
    pushToast('toast.examPassed', 'good', { level: course.name })
  } else {
    p.changeMood(CONFIG.german.examFailMood)
    p.setGerman({ level, xp: Math.round(xpBefore * 0.6) })
    pushToast('toast.examFailed', 'bad', { level: course.name })
  }
  standUp()
  // Back to class, where Thầy Minh is waiting for the news.
  travelTo('classroom', 'default', {
    icon: passed ? '🎉' : '💪',
    label: passed ? L(`Đậu ${course.name}!`, `Passed ${course.name}!`, `${course.name} bestanden!`) : L('Lần sau sẽ đậu!', 'Next time!', 'Nächstes Mal!'),
    subtitle: L('Về lớp Thầy Minh', 'Back to Teacher Minh’s class', 'Zurück in den Kurs'),
    tone: passed ? 'paper' : 'night',
  })
}

const enrolled = () => !!getFlag(courseFlag(usePlayer.getState().german.level))
const maxed = () => usePlayer.getState().german.level >= CONFIG.german.levels.length

registerTests({
  'german.enrolled': () => !maxed() && enrolled(),
  'german.notEnrolled': () => !maxed() && !enrolled(),
  'german.examReady': () => {
    const g = usePlayer.getState().german
    return !maxed() && enrolled() && g.xp >= germanXpNeeded(g.level)
  },
  'german.maxed': maxed,
})

/** Values for {placeholders} in the teacher's dialogue. */
export function germanVars() {
  const g = usePlayer.getState().german
  const course = CONFIG.german.levels[g.level]
  return {
    levelNow: g.level === 0 ? '—' : levelName(g.level - 1),
    target: levelName(g.level),
    xp: Math.min(g.xp, course?.xpToExam ?? g.xp),
    need: course?.xpToExam ?? 0,
    courseFee: course ? formatMoney(course.courseFee) : '',
    examFee: course ? formatMoney(course.examFee) : '',
  }
}

registerActions({
  'german.enroll': enroll,
  'german.lesson': lesson,
  'german.selfStudy': selfStudy,
  'german.exam': exam,
})
