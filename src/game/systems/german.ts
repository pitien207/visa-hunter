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
  bumpFlag('german.lessons')
  useMinigame.getState().start(spec, (r) => gainXp(r.correct, r.total, factor))
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
  spendTime(CONFIG.german.examMinutes)
  useMinigame.getState().start({ kind: 'exam', level }, (r) => {
    const p = usePlayer.getState()
    if (r.passed) {
      p.setGerman({ level: level + 1, xp: 0 })
      p.changeMood(CONFIG.german.examPassMood)
      setFlag(certFlag(level), useTime.getState().day)
      pushToast('toast.examPassed', 'good', { level: course.name })
    } else {
      p.changeMood(CONFIG.german.examFailMood)
      p.setGerman({ level, xp: Math.round(xp * 0.6) })
      pushToast('toast.examFailed', 'bad', { level: course.name })
    }
  })
  return true
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
