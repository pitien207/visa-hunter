import { useLocalize } from '../i18n/localized'
import { useUI } from '../store/uiStore'

const TONES = {
  night: 'bg-linear-to-b from-[#2b2440] to-[#4a3358] text-gold-light',
  // Classroom: a chalkboard in a wooden frame
  chalk: 'chalkboard text-[#f4f1e6]',
  // Exam: a sheet of exam paper
  paper: 'exam-paper text-ink',
}

/** Fade between scenes / moments, with a caption ("✈ Bay sang Đức…", "🔔 Vào tiết"). */
export function TransitionOverlay() {
  const localize = useLocalize()
  const transition = useUI((s) => s.transition)
  const tone = TONES[transition?.tone ?? 'night']
  return (
    <div
      aria-hidden={!transition}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 px-6 text-center transition-opacity duration-400 ${tone} ${
        transition ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {transition?.icon && <p className="animate-pop text-6xl">{transition.icon}</p>}
      {transition?.label && (
        <p className={`font-display text-3xl font-extrabold ${transition.long ? 'animate-sway' : 'animate-pop'}`}>{localize(transition.label)}</p>
      )}
      {transition?.subtitle && <p className="animate-pop text-sm font-bold opacity-80">{localize(transition.subtitle)}</p>}
      {transition?.long && <p className="animate-bounce text-4xl">✈️</p>}
    </div>
  )
}
