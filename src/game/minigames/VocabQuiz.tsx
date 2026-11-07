import { useMemo, useState } from 'react'
import { vocabPool, type VocabWord } from '../../data/vocab'
import { useT } from '../../i18n'
import { useSettings } from '../../store/settingsStore'
import { playSfx } from '../systems/audio'
import { AnswerButton, ARTICLE_STYLE, MinigameFrame, sample, shuffle, useCountdown } from './common'

const SECONDS = 9
const FEEDBACK_MS = 700

export interface SubGameProps {
  level: number
  count: number
  title: string
  onComplete: (correct: number, total: number) => void
}

/** Vocabulary quiz: a German word, four meanings, pick the right one. */
export function VocabQuiz({ level, count, title, onComplete }: SubGameProps) {
  const t = useT()
  const language = useSettings((s) => s.language)
  const meaningOf = (w: VocabWord) => (language === 'vi' ? w.meaning.vi : w.meaning.en)

  const questions = useMemo(() => {
    const pool = vocabPool(level)
    return sample(pool, count, (w) => w.de).map((word) => {
      const others = sample(
        pool.filter((o) => o.de !== word.de),
        3,
        (o) => o.meaning.vi,
      )
      return { word, options: shuffle([word, ...others]) }
    })
  }, [level, count])

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const current = questions[index]

  const answer = (i: number) => {
    if (picked !== null || !current) return
    setPicked(i)
    const right = i >= 0 && current.options[i].de === current.word.de
    playSfx(right ? 'right' : 'wrong')
    const total = correct + (right ? 1 : 0)
    if (right) setCorrect(total)
    window.setTimeout(() => {
      if (index + 1 >= questions.length) onComplete(total, questions.length)
      else {
        setIndex(index + 1)
        setPicked(null)
      }
    }, FEEDBACK_MS)
  }

  const timer = useCountdown(SECONDS, index, picked === null, () => answer(-1))
  if (!current) return null
  const { word } = current

  return (
    <MinigameFrame title={title} step={index} total={questions.length} timer={timer}>
      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          {word.article && <span className={`rounded-lg px-2 py-0.5 text-sm font-black ${ARTICLE_STYLE[word.article]}`}>{word.article}</span>}
          <span className="font-display text-4xl font-extrabold">{word.de}</span>
        </div>
        <p className="text-sm font-bold text-ink/60">{picked === -1 ? t('mg.timeUp') : t('mg.whatMeans')}</p>
      </div>
      <div className="flex flex-col gap-2">
        {current.options.map((o, i) => {
          const isAnswer = o.de === word.de
          const state = picked === null ? 'idle' : isAnswer ? 'right' : picked === i ? 'wrong' : 'dim'
          return (
            <AnswerButton key={o.de} state={state} disabled={picked !== null} onClick={() => answer(i)}>
              {meaningOf(o)}
            </AnswerButton>
          )
        })}
      </div>
    </MinigameFrame>
  )
}
