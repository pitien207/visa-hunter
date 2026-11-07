import { useEffect, useRef, useState } from 'react'
import { getNpc } from '../data/npcs'
import { advanceDialogue, chooseOption, closeDialogue, currentNode, dialogueLine, fillDialogueVars, visibleChoices } from '../game/systems/dialogue'
import { effectCost } from '../game/systems/effects'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useSettings } from '../store/settingsStore'
import { useDialogue } from '../store/dialogueStore'
import { usePlayer } from '../store/playerStore'
import { Portrait } from './Portrait'

const CHARS_PER_SECOND = 45

/** Conversation sheet at the bottom: portrait, name ribbon, typewriter text, choices. */
export function DialogueBox() {
  const t = useT()
  const localize = useLocalize()
  const npcId = useDialogue((s) => s.npcId)
  const step = useDialogue((s) => s.step)
  const variant = useDialogue((s) => s.variant)
  const money = usePlayer((s) => s.money)
  const currency = usePlayer((s) => s.currency)
  const node = npcId ? currentNode() : null
  const npc = npcId ? getNpc(npcId) : undefined
  const language = useSettings((s) => s.language)
  const text = node ? dialogueLine(node, variant, language) : ''
  const [shown, setShown] = useState(0)
  const typing = shown < text.length

  // Typewriter: restart on every new line.
  useEffect(() => {
    setShown(0)
    if (!text) return
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          window.clearInterval(id)
          return n
        }
        return n + 1
      })
    }, 1000 / CHARS_PER_SECOND)
    return () => window.clearInterval(id)
  }, [step, text])

  const onTap = () => {
    if (typing) setShown(text.length)
    else advanceDialogue()
  }

  // Keyboard: Space/Enter/E = continue, 1–4 = choices, Esc = leave.
  const latest = useRef({ onTap, typing })
  latest.current = { onTap, typing }
  useEffect(() => {
    if (!npcId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.code === 'Escape') {
        closeDialogue()
        return
      }
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault()
        latest.current.onTap()
        return
      }
      const match = /^(?:Digit|Numpad)([1-4])$/.exec(e.code)
      if (match && !latest.current.typing) chooseOption(Number(match[1]) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [npcId])

  if (!npcId || !node || !npc) return null
  const choices = visibleChoices(node)

  return (
    <div
      data-dialogue
      className="absolute inset-x-0 z-30 flex justify-center px-3"
      style={{ bottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <section className="animate-sheet pointer-events-auto w-full max-w-xl" aria-live="polite">
        {!typing && choices.length > 0 && (
          <div className="mb-2 flex flex-col items-end gap-2">
            {choices.map((choice, i) => {
              const cost = choice.cost ?? effectCost(choice.effect)
              const short = cost > money
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => chooseOption(i)}
                  className="animate-pop flex max-w-full items-center gap-2 rounded-2xl btn-jade py-2.5 pr-3 pl-4 text-left text-[15px] font-extrabold active:translate-y-1 active:shadow-none"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span>{fillDialogueVars(localize(choice.text))}</span>
                  {cost > 0 && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${short ? 'bg-lacquer text-gold-light' : 'bg-gold-light text-ink'}`}>
                      {formatMoney(cost, currency)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <button type="button" onClick={onTap} className="panel relative flex w-full gap-3 p-4 pt-5 text-left">
          <span className="absolute -top-4 left-20 rounded-full ribbon px-4 py-0.5 text-base">
            {localize(npc.name)}
            {npc.title && <span className="ml-1.5 text-xs font-bold opacity-80">· {localize(npc.title)}</span>}
          </span>
          <span className="-mt-8 shrink-0 rounded-full bg-paper p-0.5 shadow-[0_0_0_3px_var(--color-gold),0_3px_0_3px_rgba(91,70,54,0.2)]">
            <Portrait outfit={npc.outfit} size={60} />
          </span>
          <span className="min-h-14 flex-1 text-[16px] leading-snug font-bold text-ink">
            {text.slice(0, shown)}
            <span className="opacity-0">{text.slice(shown)}</span>
          </span>
          {!typing && choices.length === 0 && (
            <span className="animate-nudge absolute right-4 bottom-2 text-xs font-extrabold text-lacquer">▼ {t('dialogue.continue')}</span>
          )}
        </button>
      </section>
    </div>
  )
}
