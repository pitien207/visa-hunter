import { useMemo, useState } from 'react'
import { SENTENCES } from '../../data/vocab'
import { useT } from '../../i18n'
import { useSettings } from '../../store/settingsStore'
import { playSfx } from '../systems/audio'
import { MinigameFrame, sample, shuffle } from './common'
import type { SubGameProps } from './VocabQuiz'

/** Tap the words in the right order to build the German sentence. */
export function SentenceBuilder({ level, count, title, onComplete }: SubGameProps) {
  const t = useT()
  const language = useSettings((s) => s.language)
  const rounds = useMemo(
    () =>
      sample(
        SENTENCES.filter((s) => s.level <= Math.min(level, 2)),
        count,
        (s) => s.de,
      ).map((s) => {
        const tokens = s.de.split(' ')
        // Shuffle until the order actually changes.
        let chips = shuffle(tokens.map((text, i) => ({ text, i })))
        for (let n = 0; n < 5 && chips.every((c, k) => c.i === k); n++) chips = shuffle(chips)
        return { sentence: s, tokens, chips }
      }),
    [level, count],
  )
  const [index, setIndex] = useState(0)
  const [built, setBuilt] = useState<number[]>([])
  const [checked, setChecked] = useState<null | boolean>(null)
  const [correct, setCorrect] = useState(0)
  const round = rounds[index]
  if (!round) return null

  const add = (chipIdx: number) => {
    if (checked !== null || built.includes(chipIdx)) return
    setBuilt([...built, chipIdx])
  }
  const remove = (pos: number) => {
    if (checked !== null) return
    setBuilt(built.filter((_, p) => p !== pos))
  }
  const check = () => {
    const attempt = built.map((c) => round.chips[c].text).join(' ')
    const right = attempt === round.tokens.join(' ')
    playSfx(right ? 'right' : 'wrong')
    setChecked(right)
    const total = correct + (right ? 1 : 0)
    if (right) setCorrect(total)
    window.setTimeout(
      () => {
        if (index + 1 >= rounds.length) onComplete(total, rounds.length)
        else {
          setIndex(index + 1)
          setBuilt([])
          setChecked(null)
        }
      },
      right ? 800 : 2200,
    )
  }

  const meaning = language === 'vi' ? round.sentence.meaning.vi : round.sentence.meaning.en
  return (
    <MinigameFrame title={title} step={index} total={rounds.length}>
      <p className="mb-1 text-center text-sm font-bold text-ink/60">{t('mg.buildSentence')}</p>
      <p className="mb-3 text-center font-display text-xl font-extrabold">“{meaning}”</p>
      <div
        className={`mb-3 flex min-h-14 flex-wrap items-center gap-1.5 rounded-2xl p-2 ${
          checked === null ? 'bg-white/80 shadow-[inset_0_0_0_2px_#f1dcb6]' : checked ? 'bg-mint' : 'bg-rose/60'
        }`}
      >
        {built.map((c, pos) => (
          <button key={pos} type="button" onClick={() => remove(pos)} className="rounded-xl bg-paper px-2.5 py-1.5 text-[15px] font-extrabold shadow-[0_2px_0_rgba(91,70,54,0.2)]">
            {round.chips[c].text}
          </button>
        ))}
      </div>
      {checked === false && <p className="mb-2 text-center text-sm font-bold text-lacquer">{t('mg.answerWas', { answer: round.tokens.join(' ') })}</p>}
      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {round.chips.map((chip, ci) => (
          <button
            key={ci}
            type="button"
            disabled={built.includes(ci) || checked !== null}
            onClick={() => add(ci)}
            className={`rounded-xl px-3 py-2 text-[15px] font-extrabold transition ${
              built.includes(ci) ? 'bg-ink/10 text-transparent' : 'btn-jade active:translate-y-0.5'
            }`}
          >
            {chip.text}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={built.length !== round.chips.length || checked !== null}
        onClick={check}
        className="w-full rounded-2xl btn-lacquer py-3 font-display text-lg font-extrabold disabled:opacity-40"
      >
        {t('mg.check')}
      </button>
    </MinigameFrame>
  )
}
