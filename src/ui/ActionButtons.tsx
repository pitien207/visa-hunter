import { useEffect } from 'react'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { triggerPrimary, useFocusedActions, useInteraction, type ContextAction } from '../store/interactionStore'
import { useDialogue } from '../store/dialogueStore'
import { useUI } from '../store/uiStore'
import { useWork } from '../store/workStore'
import { useMinigame } from '../store/minigameStore'
import { useCare } from '../store/careStore'
import { ActionIcon } from './ActionIcon'
import { useIsTouch } from './useIsTouch'

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

/** Something else owns the screen (conversation, shop, sleep…). */
function isBusy() {
  const ui = useUI.getState()
  return (
    ui.settingsOpen ||
    ui.panel !== null ||
    ui.sleeping ||
    ui.transition !== null ||
    ui.fastForward !== null ||
    ui.newDayOpen ||
    useDialogue.getState().npcId !== null ||
    useMinigame.getState().active !== null ||
    useCare.getState().reward !== null
  )
}

/** Desktop: E = main action, 1–4 = the buttons (plan §4). */
function useActionKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || isTypingTarget(e.target) || isBusy()) return
      if (e.code === 'KeyE') {
        triggerPrimary()
        return
      }
      const match = /^(?:Digit|Numpad)([1-4])$/.exec(e.code)
      if (!match) return
      const { focusedId, items } = useInteraction.getState()
      const action = focusedId ? items[focusedId]?.actions[Number(match[1]) - 1] : undefined
      if (action) {
        e.preventDefault()
        action.onPress()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function useCareWorking() {
  return useCare((s) => s.session?.phase === 'working')
}

function KeyBadge({ label }: { label: string }) {
  return (
    <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-md bg-ink px-1 text-[11px] font-black text-cream">
      {label}
    </span>
  )
}

function RoundAction({ action, index, showKeys }: { action: ContextAction; index: number; showKeys: boolean }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={action.onPress}
      aria-label={t(action.labelKey)}
      className="pointer-events-auto flex w-[4.75rem] flex-col items-center gap-1 select-none"
    >
      <span
        className={`relative grid h-16 w-16 place-items-center rounded-full bg-paper text-[34px] shadow-[inset_0_0_0_3px_var(--color-gold),0_4px_0_rgba(91,70,54,0.28)] transition active:translate-y-1 active:scale-95 active:shadow-[inset_0_0_0_3px_var(--color-gold)] ${
          action.muted ? 'opacity-50 grayscale' : ''
        }`}
      >
        <ActionIcon name={action.icon} />
        {showKeys && <KeyBadge label={String(index + 1)} />}
      </span>
      <span className="rounded-full bg-paper/95 px-2 py-0.5 text-xs leading-tight font-black whitespace-nowrap text-ink shadow-sm">
        {t(action.labelKey)}
      </span>
    </button>
  )
}

function PrimaryAction({ action, showKeys }: { action: ContextAction; showKeys: boolean }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={action.onPress}
      className={`pointer-events-auto relative flex h-16 items-center gap-2 rounded-full pr-6 pl-2 font-display text-lg font-extrabold transition select-none active:translate-y-1 active:shadow-none ${
        action.muted ? 'bg-paper text-ink/60 shadow-[inset_0_0_0_2px_#f1dcb6,0_4px_0_rgba(91,70,54,0.25)]' : 'btn-lacquer'
      }`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-[30px] shadow-[inset_0_0_0_2px_var(--color-gold)]">
        <ActionIcon name={action.icon} />
      </span>
      {t(action.labelKey)}
      {showKeys && <KeyBadge label="E" />}
    </button>
  )
}

/**
 * Context action buttons, bottom-right. They appear only while the player is
 * near an interactable and show that interactable's current actions.
 */
export function ActionButtons() {
  const t = useT()
  const localize = useLocalize()
  const isTouch = useIsTouch()
  const { def, actions } = useFocusedActions()
  const cafeWorking = useWork((s) => s.session?.phase === 'working')
  const careWorking = useCareWorking()
  const working = cafeWorking || careWorking
  const uiBusy = useUI((s) => s.panel !== null || s.sleeping || s.transition !== null || s.fastForward !== null || s.newDayOpen)
  const talking = useDialogue((s) => s.npcId !== null)
  const playing = useMinigame((s) => s.active !== null)
  const careDone = useCare((s) => s.reward !== null)
  const busy = uiBusy || talking || playing || careDone
  useActionKeys()

  if (!def || actions.length === 0 || busy) return null
  const showKeys = !isTouch
  const primary = actions.find((a) => a.primary)
  const others = actions.filter((a) => a !== primary)
  const name = def.name ? localize(def.name) : def.nameKey ? t(def.nameKey) : ''

  return (
    <div
      className="absolute z-20 flex flex-col items-end gap-2"
      style={{
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))',
      }}
    >
      {!working && name && (
        <span className="rounded-full bg-jade px-3 py-1 text-sm font-extrabold text-white shadow-[0_3px_0_var(--color-jade-dark)]">
          {name}
          {def.subtitle && <span className="ml-1 text-xs font-bold opacity-85">· {localize(def.subtitle)}</span>}
        </span>
      )}
      {others.length > 0 && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {others.slice(0, primary ? 3 : 4).map((a) => (
            <RoundAction key={a.id} action={a} index={actions.indexOf(a)} showKeys={showKeys} />
          ))}
        </div>
      )}
      {primary && <PrimaryAction action={primary} showKeys={showKeys} />}
    </div>
  )
}
