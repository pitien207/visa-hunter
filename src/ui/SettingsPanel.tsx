import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CONFIG, type QualityLevel } from '../data/config'
import { exportSave, importSave, resetSave, suspendSaving } from '../game/systems/save'
import { LANGUAGE_NAMES, useT } from '../i18n'
import { useDialogue } from '../store/dialogueStore'
import { useSettings, type Language } from '../store/settingsStore'
import { useUI } from '../store/uiStore'
import { CloseIcon } from './icons'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="font-extrabold">{label}</span>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex rounded-full bg-ink/10 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
            o.value === value ? 'bg-lacquer text-gold-light shadow' : 'text-ink/60'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function useFullscreen() {
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled
  const [active, setActive] = useState(() => supported && !!document.fullscreenElement)
  useEffect(() => {
    if (!supported) return
    const onChange = () => setActive(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [supported])
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => {})
  }
  return { supported, active, toggle }
}

/** Export/import a save code and start over (plan §5.8). */
function SaveData() {
  const t = useT()
  const [mode, setMode] = useState<'none' | 'export' | 'import'>('none')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const area = useRef<HTMLTextAreaElement>(null)

  const showExport = () => {
    setCode(exportSave())
    setMessage(null)
    setMode('export')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // No clipboard API over plain http on phones: select the text for a manual copy.
      area.current?.select()
      document.execCommand?.('copy')
    }
    setMessage(t('settings.copied'))
  }
  const apply = () => {
    if (importSave(code)) {
      suspendSaving()
      window.location.reload()
    } else {
      setMessage(t('settings.importError'))
    }
  }
  const reset = () => {
    if (!window.confirm(t('settings.resetConfirm'))) return
    // Don't let the autosave write the old state back while reloading.
    suspendSaving()
    resetSave()
    window.location.reload()
  }

  return (
    <div className="mt-2 border-t-2 border-dashed border-ink/15 pt-3">
      <div className="mb-2 font-display text-base font-extrabold text-lacquer">{t('settings.data')}</div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={showExport} className="rounded-full btn-jade px-3 py-1.5 text-sm font-extrabold">
          {t('settings.export')}
        </button>
        <button
          type="button"
          onClick={() => {
            setCode('')
            setMessage(null)
            setMode('import')
          }}
          className="rounded-full btn-jade px-3 py-1.5 text-sm font-extrabold"
        >
          {t('settings.import')}
        </button>
        <button type="button" onClick={reset} className="rounded-full bg-ink/10 px-3 py-1.5 text-sm font-extrabold text-lacquer">
          {t('settings.reset')}
        </button>
      </div>
      {mode !== 'none' && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            ref={area}
            value={code}
            readOnly={mode === 'export'}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('settings.importHint')}
            rows={3}
            className="w-full resize-none rounded-xl border-2 border-[#f1dcb6] bg-white p-2 font-mono text-[11px] break-all text-ink"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={mode === 'export' ? copy : apply}
              className="rounded-full btn-lacquer px-4 py-1.5 text-sm font-extrabold"
            >
              {mode === 'export' ? t('settings.copy') : t('settings.importApply')}
            </button>
            {message && <span className="text-xs font-bold text-ink/70">{message}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

/** Settings dialog. Esc toggles it on desktop (plan §4) unless something else is open. */
export function SettingsPanel() {
  const t = useT()
  const open = useUI((s) => s.settingsOpen)
  const setOpen = useUI((s) => s.setSettingsOpen)
  const { musicOn, toggleMusic, sfxOn, toggleSfx, quality, setQuality, language, setLanguage } = useSettings()
  const fullscreen = useFullscreen()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return
      const ui = useUI.getState()
      // Esc closes conversations / shop / bag first (they handle it themselves).
      if (!ui.settingsOpen && (ui.panel || useDialogue.getState().npcId)) return
      setOpen(!ui.settingsOpen)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  if (!open) return null

  const onOff = [
    { value: 'on', label: t('settings.on') },
    { value: 'off', label: t('settings.off') },
  ] as const

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="panel animate-pop relative w-full max-w-sm p-5 pt-7 text-ink">
        <h2 id="settings-title" className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full ribbon px-5 py-1 text-lg whitespace-nowrap">
          {t('settings.title')}
        </h2>
        <button
          type="button"
          aria-label={t('settings.close')}
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-ink/10 text-lg"
        >
          <CloseIcon />
        </button>

        <div className="max-h-[70dvh] overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
          <Row label={t('settings.music')}>
            <Segmented
              value={musicOn ? 'on' : 'off'}
              options={[...onOff]}
              onChange={(v) => {
                if ((v === 'on') !== musicOn) toggleMusic()
              }}
            />
          </Row>
          <Row label={t('settings.sfx')}>
            <Segmented
              value={sfxOn ? 'on' : 'off'}
              options={[...onOff]}
              onChange={(v) => {
                if ((v === 'on') !== sfxOn) toggleSfx()
              }}
            />
          </Row>
          <Row label={t('settings.graphics')}>
            <Segmented<QualityLevel>
              value={quality}
              options={[
                { value: 'high', label: t('settings.graphicsHigh') },
                { value: 'low', label: t('settings.graphicsLow') },
              ]}
              onChange={setQuality}
            />
          </Row>
          <Row label={t('settings.language')}>
            <Segmented<Language>
              value={language}
              options={(Object.keys(LANGUAGE_NAMES) as Language[]).map((l) => ({ value: l, label: l.toUpperCase() }))}
              onChange={setLanguage}
            />
          </Row>
          {fullscreen.supported && (
            <Row label={t('settings.fullscreen')}>
              <Segmented
                value={fullscreen.active ? 'on' : 'off'}
                options={[...onOff]}
                onChange={(v) => {
                  if ((v === 'on') !== fullscreen.active) fullscreen.toggle()
                }}
              />
            </Row>
          )}

          <SaveData />

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-2xl btn-lacquer py-3 font-display text-lg font-extrabold active:translate-y-1 active:shadow-none"
          >
            {t('settings.close')}
          </button>
          <p className="mt-3 text-center text-xs font-bold text-ink/50">
            Visa Hunter · {t('settings.version', { version: CONFIG.version })} · {LANGUAGE_NAMES[language]}
          </p>
        </div>
      </div>
    </div>
  )
}
