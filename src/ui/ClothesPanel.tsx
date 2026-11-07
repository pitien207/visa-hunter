import { CLOTHES, CLOTHES_SHOP_NAMES, type ClothesShopId } from '../data/clothes'
import { buyClothing, isWearing, wear } from '../game/systems/wardrobe'
import { formatMoney } from '../i18n/format'
import { useT } from '../i18n'
import { useLocalize } from '../i18n/localized'
import { usePlayer } from '../store/playerStore'
import { useUI } from '../store/uiStore'
import { Portrait } from './Portrait'
import { Sheet } from './Sheet'

/** Clothes stall / barber / flea market (M8): buy and try on. */
export function ClothesPanel() {
  const t = useT()
  const localize = useLocalize()
  const panel = useUI((s) => s.panel)
  const closePanel = useUI((s) => s.closePanel)
  const outfit = usePlayer((s) => s.outfit)
  const wardrobe = usePlayer((s) => s.wardrobe)
  const money = usePlayer((s) => s.money)
  if (panel?.type !== 'clothes') return null
  const shopId = panel.shopId as ClothesShopId
  const items = CLOTHES.filter((c) => c.shop === shopId)

  return (
    <Sheet title={localize(CLOTHES_SHOP_NAMES[shopId])} onClose={closePanel}>
      <div className="mb-3 flex justify-center">
        <span className="rounded-full bg-paper p-1 shadow-[0_0_0_3px_var(--color-gold)]">
          <Portrait outfit={outfit} size={72} />
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const owned = wardrobe.includes(item.id)
          const wearing = owned && isWearing(item.id)
          return (
            <li key={item.id} className="flex flex-col items-center gap-1 rounded-2xl bg-white/80 p-2.5 text-center shadow-[inset_0_0_0_2px_#f1dcb6]">
              <span className="h-8 w-8 rounded-full shadow-[inset_0_0_0_3px_rgba(91,70,54,0.15)]" style={{ background: item.swatch }} />
              <span className="text-[13px] leading-tight font-extrabold">{localize(item.name)}</span>
              {owned ? (
                <button
                  type="button"
                  disabled={wearing}
                  onClick={() => wear(item.id)}
                  className="mt-1 w-full rounded-xl btn-jade py-1.5 text-sm font-black disabled:opacity-60"
                >
                  {wearing ? t('wardrobe.wearing') : t('wardrobe.wear')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => buyClothing(item.id)}
                  className={`mt-1 w-full rounded-xl py-1.5 text-sm font-black ${item.price > money ? 'bg-ink/15 text-ink/50' : 'btn-lacquer'}`}
                >
                  {t('shop.buy')} · {formatMoney(item.price, item.currency)}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
