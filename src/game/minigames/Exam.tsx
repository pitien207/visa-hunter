import { useState } from 'react'
import { CONFIG } from '../../data/config'
import { useT } from '../../i18n'
import { DerDieDas } from './DerDieDas'
import { SentenceBuilder } from './SentenceBuilder'
import { VocabQuiz } from './VocabQuiz'

/** The certificate exam (the "boss" mini-game): vocabulary, articles, then sentences. */
export function Exam({ level, onComplete }: { level: number; onComplete: (correct: number, total: number) => void }) {
  const t = useT()
  const name = CONFIG.german.levels[level]?.name ?? '?'
  const [phase, setPhase] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const next = (correct: number, total: number) => {
    const sum = { correct: score.correct + correct, total: score.total + total }
    setScore(sum)
    if (phase >= 2) onComplete(sum.correct, sum.total)
    else setPhase(phase + 1)
  }

  const title = `${t('mg.examTitle', { level: name })} · ${t('mg.phase', { n: phase + 1, total: 3 })}`
  if (phase === 0) return <VocabQuiz key="v" level={level} count={6} title={title} onComplete={next} />
  if (phase === 1) return <DerDieDas key="d" level={level} count={6} title={title} onComplete={next} />
  return <SentenceBuilder key="s" level={level} count={level >= 1 ? 3 : 2} title={title} onComplete={next} />
}

export const EXAM_PASS = CONFIG.german.examPassScore
