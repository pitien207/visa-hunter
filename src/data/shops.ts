import type { Localized } from '../i18n/localized'
import type { ItemId } from './items'

export interface ShopDef {
  id: string
  name: Localized
  items: ItemId[]
  /** Opening hours [from, to). Omit = always open. */
  hours?: [number, number]
  /** Germany: shops are closed on Sunday. */
  closedSunday?: boolean
}

export const SHOPS = {
  taphoa: {
    id: 'taphoa',
    name: { vi: 'Tạp hóa Cô Ba', en: "Auntie Ba's grocery", de: 'Tante Bas Laden' },
    items: ['miGoi', 'banhBao', 'xoi', 'nuocMia', 'tangLuc'],
  },
  supermarkt: {
    id: 'supermarkt',
    name: { vi: 'Siêu thị', en: 'Supermarket', de: 'Supermarkt' },
    items: ['broetchen', 'schorle', 'pizza', 'asiaNudeln'],
    hours: [8, 22],
    closedSunday: true,
  },
  baeckerei: {
    id: 'baeckerei',
    name: { vi: 'Tiệm bánh Bäckerei', en: 'Bakery', de: 'Bäckerei' },
    items: ['broetchen', 'brezel', 'kuchen', 'kaffee'],
    // Bakeries open early — even on Sunday morning.
    hours: [6, 18],
  },
  imbiss: {
    id: 'imbiss',
    name: { vi: 'Quầy Döner', en: 'Döner stand', de: 'Imbiss' },
    items: ['doener', 'schorle'],
    hours: [10, 24],
  },
} satisfies Record<string, ShopDef>

export type ShopId = keyof typeof SHOPS
