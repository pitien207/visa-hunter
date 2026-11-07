import { useEffect, type ReactNode } from 'react'
import { useT } from '../i18n'
import { CloseIcon } from './icons'

/** Paper bottom-sheet / dialog with a red ribbon title. Esc or tapping outside closes it. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useT()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-ink/30 p-3 backdrop-blur-[2px] sm:items-center"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="panel animate-sheet relative w-full max-w-md p-4 pt-7 text-ink">
        <h2 className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full ribbon px-5 py-1 text-lg whitespace-nowrap">{title}</h2>
        <button
          type="button"
          aria-label={t('settings.close')}
          onClick={onClose}
          className="absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-ink/10 text-lg"
        >
          <CloseIcon />
        </button>
        <div className="max-h-[60dvh] overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
