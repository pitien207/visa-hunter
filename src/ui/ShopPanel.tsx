import { getItem, type ItemDef } from '../data/items'
import { SHOPS, type ShopId } from '../data/shops'
import { buyItem } from '../game/systems/effects'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { useInventory } from '../store/inventoryStore'
import { usePlayer } from '../store/playerStore'
import { useUI } from '../store/uiStore'
import { CoinIcon } from './icons'
import { ItemIcon } from './ItemIcon'
import { Sheet } from './Sheet'

const sign = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

export function EffectChips({ item }: { item: ItemDef }) {
  return (
    <span className="flex gap-1 text-[11px] font-black">
      <span className="rounded-full bg-gold-light px-1.5 py-0.5">⚡{sign(item.energy)}</span>
      {item.mood !== 0 && <span className={`rounded-full px-1.5 py-0.5 ${item.mood > 0 ? 'bg-rose/40' : 'bg-ink/10'}`}>☺{sign(item.mood)}</span>}
    </span>
  )
}

/** Simple shop (plan §5.5): buy food & drinks into the bag. */
export function ShopPanel() {
  const t = useT()
  const localize = useLocalize()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  const money = usePlayer((s) => s.money)
  const currency = usePlayer((s) => s.currency)
  const owned = useInventory((s) => s.items)

  if (panel?.type !== 'shop') return null
  const shop = SHOPS[panel.shopId as ShopId]
  if (!shop) return null

  return (
    <Sheet title={localize(shop.name)} onClose={closePanel}>
      <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-bold">
        {t('shop.yourMoney')}:
        <CoinIcon className="text-lg" />
        <span className="font-display text-base font-extrabold tabular-nums">{formatMoney(money, currency)}</span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {shop.items.map((id) => {
          const item = getItem(id)
          if (!item) return null
          const short = item.price > money
          return (
            <li key={id} className="relative flex flex-col items-center gap-1 rounded-2xl bg-white/80 p-2.5 text-center shadow-[inset_0_0_0_2px_#f1dcb6]">
              {(owned[id] ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 rounded-full bg-jade px-1.5 text-[11px] font-black text-white">×{owned[id]}</span>
              )}
              <ItemIcon name={item.icon} className="text-[40px]" />
              <span className="text-sm leading-tight font-extrabold">{localize(item.name)}</span>
              <EffectChips item={item} />
              <button
                type="button"
                onClick={() => buyItem(id, false)}
                className={`mt-1 flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-sm font-black active:translate-y-1 active:shadow-none ${
                  short ? 'bg-ink/15 text-ink/50' : 'btn-lacquer'
                }`}
              >
                {t('shop.buy')} · {formatMoney(item.price, item.currency)}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
