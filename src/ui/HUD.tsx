import { useEffect, useRef, useState, type ReactNode } from 'react'
import { formatClock, weekdayIndex } from '../game/systems/time'
import { formatMoney } from '../i18n/format'
import { useT, type I18nKey } from '../i18n'
import { usePlayer } from '../store/playerStore'
import { useSettings } from '../store/settingsStore'
import { useTime } from '../store/timeStore'
import { useUI } from '../store/uiStore'
import { useFlags } from '../store/flagsStore'
import { ActionIcon } from './ActionIcon'
import { QuestTracker } from './QuestLog'
import { BagIcon, BoltIcon, CoinIcon, GearIcon, MoodIcon, MoonIcon, MusicIcon, MusicOffIcon, RainIcon, SunIcon } from './icons'
import { isRaining } from '../game/systems/weather'
import { SCENES } from '../game/scenes/registry'
import { useWorld } from '../store/worldStore'

function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="hud-chip pointer-events-auto grid h-11 w-11 place-items-center text-[22px] text-ink transition active:translate-y-[3px] active:shadow-none"
    >
      {children}
    </button>
  )
}

/** Shows "+12.000 ₫" floating up from the money pill whenever money increases. */
function useMoneyGain(money: number) {
  const previous = useRef(money)
  const [gain, setGain] = useState<{ amount: number; key: number } | null>(null)
  useEffect(() => {
    const delta = money - previous.current
    previous.current = money
    if (delta <= 0) return
    setGain({ amount: delta, key: Date.now() })
    const id = window.setTimeout(() => setGain(null), 1600)
    return () => window.clearTimeout(id)
  }, [money])
  return gain
}

function Clock() {
  const t = useT()
  const minutes = useTime((s) => Math.floor(s.minutes))
  const day = useTime((s) => s.day)
  const hour = minutes / 60
  const daytime = hour >= 6 && hour < 18.5
  const country = useWorld((s) => SCENES[s.scene].country)
  const raining = isRaining(day, minutes, country)
  return (
    <div
      role="status"
      aria-label={`${formatClock(minutes)}, ${t(`weekday.${weekdayIndex(day)}` as I18nKey)}`}
      className="flex items-center gap-1.5 rounded-2xl bg-jade py-1 pr-3 pl-1.5 text-white shadow-[0_3px_0_var(--color-jade-dark)]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-lg">{raining ? <RainIcon /> : daytime ? <SunIcon /> : <MoonIcon />}</span>
      <span className="font-display text-lg leading-none font-extrabold tabular-nums">{formatClock(minutes)}</span>
      <span className="text-[11px] leading-tight font-bold opacity-90">
        {t(`weekday.${weekdayIndex(day)}` as I18nKey)}
        <br />
        {t('hud.day', { day })}
      </span>
    </div>
  )
}

function StatChip({ label, icon, value, max, barClass }: { label: string; icon: ReactNode; value: number; max: number; barClass: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div role="status" aria-label={`${label}: ${Math.round(value)}/${max}`} className="hud-chip flex h-9 items-center gap-1.5 px-2 text-sm font-extrabold text-ink">
      <span className="shrink-0 text-lg">{icon}</span>
      <div className="hidden h-2 w-7 overflow-hidden rounded-full bg-ink/15 min-[380px]:block sm:w-12">
        <div className={`h-full rounded-full transition-[width] duration-500 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right tabular-nums">{Math.round(value)}</span>
    </div>
  )
}

/** Top HUD: buttons + clock on the left, money + energy + mood on the right. */
export function HUD() {
  const t = useT()
  const money = usePlayer((s) => s.money)
  const currency = usePlayer((s) => s.currency)
  const energy = usePlayer((s) => Math.round(s.energy))
  const maxEnergy = usePlayer((s) => s.maxEnergy)
  const mood = usePlayer((s) => Math.round(s.mood))
  const musicOn = useSettings((s) => s.musicOn)
  const toggleMusic = useSettings((s) => s.toggleMusic)
  const setSettingsOpen = useUI((s) => s.setSettingsOpen)
  const openPanel = useUI((s) => s.openPanel)
  const gain = useMoneyGain(money)
  const showVisa = useFlags((s) => !!s.flags['visa.path'] && !s.flags['de.arrived'])

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-safe pt-safe">
      <div className="flex flex-col items-start gap-2">
        <div className="flex gap-2">
          <HudButton label={t('hud.settings')} onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </HudButton>
          <HudButton label={musicOn ? t('hud.musicMute') : t('hud.musicUnmute')} onClick={toggleMusic}>
            {musicOn ? <MusicIcon /> : <MusicOffIcon className="opacity-60" />}
          </HudButton>
          <HudButton label={t('hud.bag')} onClick={() => openPanel({ type: 'bag' })}>
            <BagIcon />
          </HudButton>
          {showVisa && (
            <HudButton label={t('visa.title')} onClick={() => openPanel({ type: 'visa' })}>
              <ActionIcon name="passport" />
            </HudButton>
          )}
        </div>
        <Clock />
        <QuestTracker />
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="relative">
          <div
            role="status"
            aria-label={`${t('hud.money')}: ${formatMoney(money, currency)}`}
            className="hud-chip flex h-11 items-center gap-1.5 px-3 font-display text-base font-extrabold text-ink sm:text-lg"
          >
            <CoinIcon className={`shrink-0 text-[22px] ${gain ? 'animate-coin' : ''}`} key={gain?.key} />
            <span className="tabular-nums">{formatMoney(money, currency)}</span>
          </div>
          {gain && (
            <span
              key={gain.key}
              className="animate-float-up absolute top-full right-1 mt-1 rounded-full bg-jade px-2.5 py-0.5 text-sm font-black whitespace-nowrap text-white shadow"
            >
              +{formatMoney(gain.amount, currency)}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <StatChip
            label={t('hud.energy')}
            icon={<BoltIcon />}
            value={energy}
            max={maxEnergy}
            barClass={energy < 20 ? 'animate-pulse bg-lacquer' : 'bg-linear-to-r from-gold to-[#f7a440]'}
          />
          <StatChip label={t('hud.mood')} icon={<MoodIcon value={mood} />} value={mood} max={100} barClass="bg-linear-to-r from-rose to-[#ff7f9f]" />
        </div>
      </div>
    </header>
  )
}
