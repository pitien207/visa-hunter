import { CHAPTER_NAMES, QUESTS } from '../data/quests'
import { currentObjective, questComplete, questVisible, stepDone } from '../game/systems/watchers'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useFlags } from '../store/flagsStore'
import { useUI } from '../store/uiStore'
import { Sheet } from './Sheet'

/** Small "next objective" chip under the clock. Tap to open the quest log. */
export function QuestTracker() {
  const localize = useLocalize()
  useFlags((s) => s.flags) // re-render when progress changes
  const openPanel = useUI((s) => s.openPanel)
  const objective = currentObjective()
  if (!objective) return null
  return (
    <button
      type="button"
      onClick={() => openPanel({ type: 'quests' })}
      className="hud-chip pointer-events-auto flex max-w-[13.5rem] items-start gap-1.5 px-2.5 py-1.5 text-left sm:max-w-xs"
    >
      <span className="mt-0.5 text-sm">🎯</span>
      <span className="text-[12px] leading-snug font-extrabold text-ink">{localize(objective.step.text)}</span>
    </button>
  )
}

export function QuestLog() {
  const t = useT()
  const localize = useLocalize()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  useFlags((s) => s.flags)
  if (panel?.type !== 'quests') return null

  const visible = QUESTS.filter(questVisible)
  const chapters = [...new Set(visible.map((q) => q.chapter))].sort((a, b) => b - a)

  return (
    <Sheet title={t('quests.title')} onClose={closePanel}>
      {chapters.map((ch) => (
        <section key={ch} className="mb-3">
          <h3 className="mb-1.5 font-display text-sm font-extrabold text-lacquer">{localize(CHAPTER_NAMES[ch])}</h3>
          <ul className="flex flex-col gap-2">
            {visible
              .filter((q) => q.chapter === ch)
              .map((q) => {
                const done = questComplete(q)
                return (
                  <li key={q.id} className={`rounded-2xl bg-white/80 p-2.5 shadow-[inset_0_0_0_2px_#f1dcb6] ${done ? 'opacity-60' : ''}`}>
                    <div className="mb-1 flex items-center gap-1.5 text-[15px] font-black">
                      {done ? '✅' : q.side ? '⭐' : '📜'} {localize(q.title)}
                    </div>
                    <ul className="flex flex-col gap-0.5">
                      {q.steps.map((s) => {
                        const ok = stepDone(s.id)
                        return (
                          <li key={s.id} className={`flex gap-1.5 text-[13px] font-bold ${ok ? 'text-jade line-through' : 'text-ink'}`}>
                            <span>{ok ? '✓' : '○'}</span>
                            <span>{localize(s.text)}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </Sheet>
  )
}
