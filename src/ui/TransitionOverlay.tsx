import { useLocalize } from '../i18n/localized'
import { useUI } from '../store/uiStore'

/** Fade-to-black between scenes, with the destination's name. */
export function TransitionOverlay() {
  const localize = useLocalize()
  const transition = useUI((s) => s.transition)
  return (
    <div
      aria-hidden={!transition}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-linear-to-b from-[#2b2440] to-[#4a3358] transition-opacity duration-400 ${
        transition ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {transition?.label && (
        <p className={`px-6 text-center font-display text-3xl font-extrabold text-gold-light ${transition.long ? 'animate-sway' : 'animate-pop'}`}>
          {localize(transition.label)}
        </p>
      )}
      {transition?.long && <p className="animate-bounce text-4xl">✈️</p>}
    </div>
  )
}
