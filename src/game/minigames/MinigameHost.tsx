import { useState, type ReactNode } from 'react'
import { CONFIG } from '../../data/config'
import { useT } from '../../i18n'
import { makeResult, useMinigame, type MinigameResult } from '../../store/minigameStore'
import { useWorld } from '../../store/worldStore'
import { playSfx } from '../systems/audio'
import { MinigameThemeContext, ResultView, type MinigameTheme } from './common'
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
  const scene = useWorld((s) => s.scene)
  const [result, setResult] = useState<{ id: number; result: MinigameResult; title: string } | null>(null)

  if (!active) return null

  // The look follows the place: chalkboard in class, exam sheet, school notebook at home.
  const theme: MinigameTheme = active.kind === 'exam' ? 'exam' : scene === 'classroom' ? 'chalk' : scene === 'home' ? 'notebook' : 'paper'

  const complete = (title: string, passScore: number, skipResult = false) => (correct: number, total: number, extra?: number) => {
    const r = makeResult(correct, total, passScore)
    if (extra !== undefined) r.value = extra
    playSfx(r.passed ? 'success' : 'fail')
    if (skipResult) finish(r)
    else setResult({ id: active.id, result: r, title })
  }

  let game: ReactNode = null
  if (result && result.id === active.id) {
    game = <ResultView title={result.title} result={result.result} onContinue={() => finish(result.result)} />
  } else {
    switch (active.kind) {
      case 'vocab': {
        const title = t('mg.vocabTitle')
        game = <VocabQuiz key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
        break
      }
      case 'derdiedas': {
        const title = t('mg.derdiedasTitle')
        game = <DerDieDas key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
        break
      }
      case 'sentence': {
        const title = t('mg.sentenceTitle')
        game = <SentenceBuilder key={active.id} level={active.level} count={active.count} title={title} onComplete={complete(title, 0.5)} />
        break
      }
      case 'exam': {
        const title = t('mg.examTitle', { level: CONFIG.german.levels[active.level]?.name ?? '' })
        game = <Exam key={active.id} level={active.level} onComplete={complete(title, CONFIG.german.examPassScore)} />
        break
      }
      case 'termin':
        game = <TerminHunt key={active.id} title={t('mg.terminTitle')} onComplete={complete(t('mg.terminTitle'), 1, true)} />
        break
      case 'qa':
        game = <QaGame key={active.id} set={active.set} count={active.count} onComplete={complete('', active.passScore, true)} />
        break
    }
  }
  return <MinigameThemeContext.Provider value={theme}>{game}</MinigameThemeContext.Provider>
}
