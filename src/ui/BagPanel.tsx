import { useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { getClothing, type ClothingSlot } from '../data/clothes'
import { getItem } from '../data/items'
import { SKILLS, type SkillId } from '../data/skills'
import { CONFIG } from '../data/config'
import { eatFromBag } from '../game/systems/effects'
import { isWearing, takeOff, wear } from '../game/systems/wardrobe'
import { useT, type I18nKey } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useFlags } from '../store/flagsStore'
import { useInventory } from '../store/inventoryStore'
import { usePlayer } from '../store/playerStore'
import { useUI } from '../store/uiStore'
import { ItemIcon } from './ItemIcon'
import { Portrait } from './Portrait'
import { Sheet } from './Sheet'
import { EffectChips } from './ShopPanel'

type Tab = 'items' | 'wardrobe' | 'achievements'
const SLOTS: ClothingSlot[] = ['hat', 'hair', 'shirt', 'shorts', 'shoe', 'bag']

function Items() {
  const t = useT()
  const localize = useLocalize()
  const items = useInventory((s) => s.items)
  const skills = usePlayer((s) => s.skills)
  const german = usePlayer((s) => s.german)
  const entries = Object.entries(items).filter(([, n]) => n > 0)
  const skillEntries = Object.entries(skills) as [SkillId, number][]
  const levelName = german.level === 0 ? '—' : CONFIG.german.levels[german.level - 1]?.name
  return (
    <>
      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm font-bold text-ink/60">{t('bag.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map(([id, count]) => {
            const item = getItem(id)
            if (!item) return null
            return (
              <li key={id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-2 pr-2.5 shadow-[inset_0_0_0_2px_#f1dcb6]">
                <span className="relative">
                  <ItemIcon name={item.icon} className="text-[38px]" />
                  <span className="absolute -right-1 -bottom-1 rounded-full bg-jade px-1.5 text-[11px] font-black text-white">×{count}</span>
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-sm leading-tight font-extrabold">{localize(item.name)}</span>
                  <EffectChips item={item} />
                </span>
                <button type="button" onClick={() => eatFromBag(id)} className="rounded-xl btn-jade px-4 py-2 text-sm font-black active:translate-y-1 active:shadow-none">
                  {t('bag.use')}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <h3 className="mt-4 mb-1.5 font-display text-base font-extrabold text-lacquer">{t('bag.skills')}</h3>
      <ul className="flex flex-col gap-1">
        <li className="flex justify-between rounded-xl bg-white/70 px-3 py-1.5 text-sm font-extrabold">
          <span>🇩🇪 {t('bag.german')}</span>
          <span>{levelName}</span>
        </li>
        {skillEntries.length === 0 ? (
          <li className="text-sm font-bold text-ink/60">{t('bag.noSkills')}</li>
        ) : (
          skillEntries.map(([id, xp]) => (
            <li key={id} className="flex justify-between rounded-xl bg-white/70 px-3 py-1.5 text-sm font-extrabold">
              <span>{t(SKILLS[id].nameKey)}</span>
              <span className="tabular-nums">{t('bag.xp', { xp })}</span>
            </li>
          ))
        )}
      </ul>
    </>
  )
}

function Wardrobe() {
  const t = useT()
  const localize = useLocalize()
  const outfit = usePlayer((s) => s.outfit)
  const wardrobe = usePlayer((s) => s.wardrobe)
  return (
    <>
      <div className="mb-3 flex justify-center">
        <span className="rounded-full bg-paper p-1 shadow-[0_0_0_3px_var(--color-gold)]">
          <Portrait outfit={outfit} size={72} />
        </span>
      </div>
      {wardrobe.length === 0 && <p className="py-2 text-center text-sm font-bold text-ink/60">{t('wardrobe.empty')}</p>}
      {SLOTS.map((slot) => {
        const owned = wardrobe.map(getClothing).filter((c) => c && c.slot === slot)
        if (!owned.length) return null
        return (
          <div key={slot} className="mb-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-black text-lacquer uppercase">{t(`slot.${slot}` as I18nKey)}</span>
              <button type="button" onClick={() => takeOff(slot)} className="rounded-full bg-ink/10 px-2 py-0.5 text-[11px] font-extrabold">
                {t('wardrobe.default')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {owned.map((c) =>
                c ? (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => wear(c.id)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-extrabold ${isWearing(c.id) ? 'btn-jade' : 'bg-white/80 shadow-[inset_0_0_0_2px_#f1dcb6]'}`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.swatch }} />
                    {localize(c.name)}
                  </button>
                ) : null,
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

function Achievements() {
  const localize = useLocalize()
  const flags = useFlags((s) => s.flags)
  return (
    <ul className="grid grid-cols-2 gap-2">
      {ACHIEVEMENTS.map((a) => {
        const got = !!flags[`achv.got.${a.id}`]
        return (
          <li key={a.id} className={`rounded-2xl p-2.5 text-center shadow-[inset_0_0_0_2px_#f1dcb6] ${got ? 'bg-gold-light' : 'bg-white/60 opacity-60 grayscale'}`}>
            <div className="text-3xl">{got ? a.icon : '🔒'}</div>
            <div className="text-[13px] leading-tight font-black">{localize(a.name)}</div>
            <div className="mt-0.5 text-[11px] leading-tight font-bold text-ink/70">{localize(a.desc)}</div>
          </li>
        )
      })}
    </ul>
  )
}

/** The bag (plan §5.6): food, wardrobe, achievements. */
export function BagPanel() {
  const t = useT()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  const [tab, setTab] = useState<Tab>('items')
  if (panel?.type !== 'bag') return null

  const tabs: { id: Tab; label: string }[] = [
    { id: 'items', label: t('bag.title') },
    { id: 'wardrobe', label: t('wardrobe.title') },
    { id: 'achievements', label: t('achievements.title') },
  ]
  return (
    <Sheet title={t('bag.title')} onClose={closePanel}>
      <div className="mb-3 flex rounded-full bg-ink/10 p-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`flex-1 rounded-full px-2 py-1.5 text-[13px] font-extrabold transition ${tab === x.id ? 'bg-lacquer text-gold-light shadow' : 'text-ink/60'}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      {tab === 'items' && <Items />}
      {tab === 'wardrobe' && <Wardrobe />}
      {tab === 'achievements' && <Achievements />}
    </Sheet>
  )
}
