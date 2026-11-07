import { useMemo, useState } from 'react'
import { getNpc } from '../../data/npcs'
import { QA_SETS, type QaSetId } from '../../data/interviews'
import { useT } from '../../i18n'
import { useLocalize } from '../../i18n/localized'
import { Portrait } from '../../ui/Portrait'
import { playSfx } from '../systems/audio'
import { AnswerButton, MinigameFrame, sample, shuffle } from './common'

const REACTION_MS = 1500

/**
 * Interview-style mini-game (embassy interview, WG casting, Anmeldung form):
 * questions with answers worth 0–2 points; the impression meter shows how it's going.
 */
export function QaGame({ set, count, onComplete }: { set: QaSetId; count: number; onComplete: (points: number, max: number) => void }) {
  const t = useT()
  const localize = useLocalize()
  const def = QA_SETS[set]
  const questions = useMemo(
    () => sample(def.questions, count, (q) => q.q.vi).map((q) => ({ ...q, answers: shuffle(q.answers) })),
    [def, count],
  )
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [points, setPoints] = useState(0)
  const asker = getNpc(def.asker)
  const current = questions[index]
  if (!current) return null

  const max = questions.length * 2
  const impression = Math.round(((points + (questions.length - index) * 1) / max) * 100)

  const answer = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const gained = current.answers[i].score
    playSfx(gained === 2 ? 'right' : gained === 0 ? 'wrong' : 'click')
    const total = points + gained
    setPoints(total)
    window.setTimeout(() => {
      if (index + 1 >= questions.length) onComplete(total, max)
      else {
        setIndex(index + 1)
        setPicked(null)
      }
    }, REACTION_MS)
  }

  return (
    <MinigameFrame title={localize(def.title)} step={index} total={questions.length}>
      <div className="mb-3 flex items-start gap-3">
        <span className="shrink-0 rounded-full bg-paper p-0.5 shadow-[0_0_0_3px_var(--color-gold)]">
          {asker ? <Portrait outfit={asker.outfit} size={52} /> : null}
        </span>
        <div className="relative flex-1 rounded-2xl bg-white px-3 py-2 text-[15px] leading-snug font-extrabold shadow-[inset_0_0_0_2px_#f1dcb6]">
          {picked === null ? localize(current.q) : localize(current.answers[picked].reaction)}
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-extrabold whitespace-nowrap">{t('mg.impression')}</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${impression >= 60 ? 'bg-jade' : impression >= 40 ? 'bg-gold' : 'bg-lacquer'}`}
            style={{ width: `${Math.max(4, Math.min(100, impression))}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {current.answers.map((ans, i) => {
          const state = picked === null ? 'idle' : picked === i ? (ans.score === 2 ? 'right' : ans.score === 0 ? 'wrong' : 'idle') : 'dim'
          return (
            <AnswerButton key={i} state={state} disabled={picked !== null} onClick={() => answer(i)}>
              {localize(ans.text)}
            </AnswerButton>
          )
        })}
      </div>
    </MinigameFrame>
  )
}
