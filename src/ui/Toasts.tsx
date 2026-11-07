import { useT } from '../i18n'
import { useToasts, type ToastTone } from '../store/toastStore'

const TONE: Record<ToastTone, string> = {
  info: 'bg-ink/85 text-cream',
  good: 'bg-jade text-white shadow-[0_3px_0_var(--color-jade-dark)]',
  bad: 'bg-lacquer text-gold-light shadow-[0_3px_0_var(--color-lacquer-dark)]',
}

/** Short feedback bubbles in the middle of the screen. */
export function Toasts() {
  const t = useT()
  const toasts = useToasts((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div
      className="absolute inset-x-0 z-20 flex flex-col items-center gap-2 px-6"
      style={{ top: 'max(40%, 16.5rem)' }}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className={`animate-pop rounded-full px-4 py-2 text-center text-base font-black shadow-lg ${TONE[toast.tone]}`}
        >
          {t(toast.key, toast.vars)}
        </p>
      ))}
    </div>
  )
}
