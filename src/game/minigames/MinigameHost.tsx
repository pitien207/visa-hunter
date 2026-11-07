import { useState } from 'react'
import { CONFIG } from '../../data/config'
import { useT } from '../../i18n'
import { makeResult, useMinigame, type MinigameResult } from '../../store/minigameStore'
import { playSfx } from '../systems/audio'
import { ResultView } from './common'
import { DerDieDas } from './DerDieDas'
import { Exam } from './Exam'
import { QaGame } from './QaGame'
import { SentenceBuilder } from './SentenceBuilder'
import { TerminHunt } from './TerminHunt'
import { VocabQuiz } from './VocabQuiz'

/** Shows the active mini-game, then its result screen; "Tiếp tục" reports back to the caller. */
export function MinigameHost() {
  const t = useT()
  const active = useMinigame((s) => s.active)
  const finish = useMinigame((s) => s.finish)
  const [result, setResult] = useState<{ id: number; result: MinigameResult; title: string } | null>(null)

  if (!active) return null
  if (result && result.id === active.id) {
    return <ResultView title={result.title} result={result.result} onContinue={() => finish(result.result)} />
  }

  const complete = (title: string, passScore: number, skipResult = false) => (correct: number, total: number, extra?: number) => {
    const r = makeResult(correct, total, passScore)
    if (extra !== undefined) r.value = extra
    playSfx(r.passed ? 'success' : 'fail')
    if (skipResult) finish(r)
    else setResult({ id: active.id, result: r, title })
  }

  switch (active.kind) {
    case 'vocab': {
      const title = t('mg.vocabTitle')
      return <VocabQuiz key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
    }
    case 'derdiedas': {
      const title = t('mg.derdiedasTitle')
      return <DerDieDas key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
    }
    case 'sentence': {
      const title = t('mg.sentenceTitle')
      return <SentenceBuilder key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
    }
    case 'exam': {
      const title = t('mg.examTitle', { level: CONFIG.german.levels[active.level]?.name ?? '' })
      return <Exam key={active.id} level={active.level} onComplete={complete(title, CONFIG.german.examPassScore)} />
    }
    case 'termin':
      return <TerminHunt key={active.id} title={t('mg.terminTitle')} onComplete={complete(t('mg.terminTitle'), 1, true)} />
    case 'qa':
      return <QaGame key={active.id} set={active.set} count={active.count} onComplete={complete('', active.passScore, true)} />
  }
}
