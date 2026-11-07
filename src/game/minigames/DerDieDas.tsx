import { useEffect, useMemo, useState } from 'react'
import { vocabPool, type Article } from '../../data/vocab'
import { useT } from '../../i18n'
import { useSettings } from '../../store/settingsStore'
import { playSfx } from '../systems/audio'
import { ARTICLE_STYLE, MinigameFrame, sample, useCountdown } from './common'
import type { SubGameProps } from './VocabQuiz'

const SECONDS = 5
const FEEDBACK_MS = 600
const ARTICLES: Article[] = ['der', 'die', 'das']

/** Sort nouns by article: tap DER, DIE or DAS before the timer runs out (keys 1–3 too). */
export function DerDieDas({ level, count, title, onComplete }: SubGameProps) {
  const t = useT()
  const language = useSettings((s) => s.language)
  const words = useMemo(() => sample(vocabPool(level, true), count, (w) => w.de), [level, count])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<Article | 'timeout' | null>(null)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const word = words[index]

  const answer = (a: Article | 'timeout') => {
    if (picked !== null || !word) return
    setPicked(a)
    const right = a === word.article
    playSfx(right ? 'right' : 'wrong')
    const total = correct + (right ? 1 : 0)
    if (right) setCorrect(total)
    setStreak(right ? streak + 1 : 0)
    window.setTimeout(() => {
      if (index + 1 >= words.length) onComplete(total, words.length)
      else {
        setIndex(index + 1)
        setPicked(null)
      }
    }, FEEDBACK_MS)
  }

  const timer = useCountdown(SECONDS, index, picked === null, () => answer('timeout'))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code)
      if (i >= 0) answer(ARTICLES[i])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!word) return null
  const meaning = language === 'vi' ? word.meaning.vi : word.meaning.en

  return (
    <MinigameFrame title={title} step={index} total={words.length} timer={timer}>
      <div className="mb-5 flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-bold text-ink/60">{t('mg.pickArticle')}</p>
        <div className="flex items-center gap-2">
          <span
            className={`min-w-14 rounded-lg px-2 py-1 text-center text-lg font-black transition ${
              picked ? ARTICLE_STYLE[word.article ?? 'der'] : 'bg-ink/10 text-ink/40'
            }`}
          >
            {picked ? word.article : '___'}
          </span>
          <span className="font-display text-4xl font-extrabold">{word.de}</span>
        </div>
        <p className="text-sm font-bold text-ink/70">{meaning}</p>
        {streak >= 2 && <p className="animate-pop text-sm font-black text-lacquer">🔥 ×{streak}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ARTICLES.map((a, i) => {
          const isRight = picked !== null && a === word.article
          const isWrongPick = picked === a && a !== word.article
          return (
            <button
              key={a}
              type="button"
              disabled={picked !== null}
              onClick={() => answer(a)}
              className={`rounded-2xl py-5 font-display text-2xl font-extrabold uppercase transition active:translate-y-1 active:shadow-none ${ARTICLE_STYLE[a]} ${
                picked !== null && !isRight ? 'opacity-40' : ''
              } ${isWrongPick ? 'animate-pulse' : ''}`}
            >
              {a}
              <span className="block text-[10px] font-bold opacity-70">{i + 1}</span>
            </button>
          )
        })}
      </div>
      {picked === 'timeout' && <p className="mt-3 text-center text-sm font-black text-lacquer">{t('mg.timeUp')}</p>}
    </MinigameFrame>
  )
}
