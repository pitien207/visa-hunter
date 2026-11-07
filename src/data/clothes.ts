import type { Currency } from '../i18n/format'
import type { Localized } from '../i18n/localized'
import type { Outfit } from './npcs'

/** Clothes and hairstyles (plan §5.5–5.6). Buying adds to the wardrobe; wear them from the bag. */

export type ClothingSlot = 'shirt' | 'shorts' | 'shoe' | 'hat' | 'hair' | 'bag'
export type ClothesShopId = 'vnClothes' | 'barber' | 'flohmarkt'

export interface ClothingDef {
  id: string
  name: Localized
  slot: ClothingSlot
  price: number
  currency: Currency
  shop: ClothesShopId
  /** Outfit fields this item changes. */
  apply: Partial<Outfit>
  /** Colour shown in the shop. */
  swatch: string
}

const c = (
  id: string,
  vi: string,
  en: string,
  slot: ClothingSlot,
  shop: ClothesShopId,
  price: number,
  apply: Partial<Outfit>,
  swatch: string,
): ClothingDef => ({ id, name: { vi, en }, slot, shop, price, currency: shop === 'flohmarkt' ? 'EUR' : 'VND', apply, swatch })

export const CLOTHES: ClothingDef[] = [
  // Chị Hằng's clothes stall (Vietnam)
  c('aoHong', 'Áo thun hồng', 'Pink T-shirt', 'shirt', 'vnClothes', 80_000, { shirt: '#ffb3c7' }, '#ffb3c7'),
  c('aoDoi', 'Áo đội tuyển đỏ', 'Red football jersey', 'shirt', 'vnClothes', 120_000, { shirt: '#d4473b' }, '#d4473b'),
  c('aoBaBa', 'Áo bà ba xanh ngọc', 'Jade áo bà ba shirt', 'shirt', 'vnClothes', 150_000, { shirt: '#8fd3c1' }, '#8fd3c1'),
  c('quanJean', 'Quần short jean', 'Denim shorts', 'shorts', 'vnClothes', 100_000, { shorts: '#4f6fa8' }, '#4f6fa8'),
  c('depToOng', 'Dép tổ ong', 'Honeycomb sandals', 'shoe', 'vnClothes', 30_000, { shoe: '#f4f1e6' }, '#f4f1e6'),
  c('nonLa', 'Nón lá', 'Conical hat', 'hat', 'vnClothes', 50_000, { accessory: 'nonLa' }, '#f2d79c'),
  c('baloMoi', 'Balo du học', 'Study-abroad backpack', 'bag', 'vnClothes', 200_000, { bag: '#7fb8e8' }, '#7fb8e8'),
  // Sidewalk barber (Vietnam)
  c('tocNgan', 'Tóc ngắn', 'Short hair', 'hair', 'barber', 40_000, { hairStyle: 'short' }, '#3d2c2c'),
  c('tocBui', 'Tóc búi', 'Hair bun', 'hair', 'barber', 40_000, { hairStyle: 'bun' }, '#3d2c2c'),
  c('tocBob', 'Tóc bob', 'Bob cut', 'hair', 'barber', 40_000, { hairStyle: 'bob' }, '#3d2c2c'),
  c('tocNau', 'Nhuộm nâu hạt dẻ', 'Chestnut dye', 'hair', 'barber', 120_000, { hair: '#7a4a32' }, '#7a4a32'),
  // Flohmarkt (Germany, EUR)
  c('pulli', 'Áo len Pullover', 'Pullover', 'shirt', 'flohmarkt', 8, { shirt: '#5b7cc4' }, '#5b7cc4'),
  c('regenjacke', 'Áo mưa vàng', 'Yellow rain jacket', 'shirt', 'flohmarkt', 18, { shirt: '#f4c04e' }, '#f4c04e'),
  c('jeans', 'Quần jean', 'Jeans', 'shorts', 'flohmarkt', 12, { shorts: '#3f4a6b' }, '#3f4a6b'),
  c('sneaker', 'Giày sneaker', 'Sneakers', 'shoe', 'flohmarkt', 15, { shoe: '#ffffff' }, '#ffffff'),
  c('muetze', 'Mũ len Mütze', 'Beanie', 'hat', 'flohmarkt', 5, { accessory: 'beanie', accent: '#d4473b' }, '#d4473b'),
  c('jutebeutel', 'Túi vải Jutebeutel', 'Tote bag', 'bag', 'flohmarkt', 3, { bag: '#e8dcc0' }, '#e8dcc0'),
]

export const CLOTHES_SHOP_NAMES: Record<ClothesShopId, Localized> = {
  vnClothes: { vi: 'Sạp quần áo Chị Hằng', en: "Hằng's clothes stall", de: 'Hằngs Kleiderstand' },
  barber: { vi: 'Cắt tóc vỉa hè', en: 'Sidewalk barber', de: 'Straßenfriseur' },
  flohmarkt: { vi: 'Chợ đồ cũ Flohmarkt', en: 'Flea market', de: 'Flohmarkt' },
}

export const getClothing = (id: string) => CLOTHES.find((x) => x.id === id)
