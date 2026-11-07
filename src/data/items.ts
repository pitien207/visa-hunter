import type { Currency } from '../i18n/format'
import type { Localized } from '../i18n/localized'

/** Food & drink (plan §5.5). Add an item here and list it in a shop (data/shops.ts). */

export type ItemIconName =
  | 'banhMi'
  | 'traDa'
  | 'miGoi'
  | 'banhBao'
  | 'nuocMia'
  | 'tangLuc'
  | 'xoi'
  | 'broetchen'
  | 'brezel'
  | 'doener'
  | 'schorle'
  | 'kaffee'
  | 'pizza'
  | 'kuchen'

export interface ItemDef {
  id: string
  name: Localized
  icon: ItemIconName
  price: number
  currency: Currency
  energy: number
  mood: number
  /** In-game minutes it takes to eat/drink. */
  minutes: number
}

export const ITEMS = {
  banhMi: {
    id: 'banhMi',
    name: { vi: 'Bánh mì thịt', en: 'Bánh mì sandwich', de: 'Bánh-mì-Sandwich' },
    icon: 'banhMi',
    price: 15_000,
    currency: 'VND',
    energy: 25,
    mood: 3,
    minutes: 10,
  },
  traDa: {
    id: 'traDa',
    name: { vi: 'Trà đá', en: 'Iced tea', de: 'Eistee' },
    icon: 'traDa',
    price: 5_000,
    currency: 'VND',
    energy: 6,
    mood: 8,
    minutes: 15,
  },
  miGoi: {
    id: 'miGoi',
    name: { vi: 'Mì gói', en: 'Instant noodles', de: 'Instantnudeln' },
    icon: 'miGoi',
    price: 6_000,
    currency: 'VND',
    energy: 12,
    mood: 0,
    minutes: 10,
  },
  banhBao: {
    id: 'banhBao',
    name: { vi: 'Bánh bao', en: 'Steamed bun', de: 'Gedämpftes Brötchen' },
    icon: 'banhBao',
    price: 12_000,
    currency: 'VND',
    energy: 18,
    mood: 2,
    minutes: 8,
  },
  xoi: {
    id: 'xoi',
    name: { vi: 'Xôi đậu xanh', en: 'Mung bean sticky rice', de: 'Klebreis mit Mungbohnen' },
    icon: 'xoi',
    price: 10_000,
    currency: 'VND',
    energy: 20,
    mood: 2,
    minutes: 8,
  },
  nuocMia: {
    id: 'nuocMia',
    name: { vi: 'Nước mía', en: 'Sugarcane juice', de: 'Zuckerrohrsaft' },
    icon: 'nuocMia',
    price: 10_000,
    currency: 'VND',
    energy: 8,
    mood: 6,
    minutes: 5,
  },
  tangLuc: {
    id: 'tangLuc',
    name: { vi: 'Nước tăng lực', en: 'Energy drink', de: 'Energydrink' },
    icon: 'tangLuc',
    price: 12_000,
    currency: 'VND',
    energy: 15,
    mood: -3,
    minutes: 2,
  },
  // --- Germany (EUR) ---
  broetchen: {
    id: 'broetchen',
    name: { vi: 'Bánh mì tròn Brötchen', en: 'Bread roll', de: 'Brötchen' },
    icon: 'broetchen',
    price: 0.6,
    currency: 'EUR',
    energy: 8,
    mood: 1,
    minutes: 5,
  },
  brezel: {
    id: 'brezel',
    name: { vi: 'Bánh Brezel', en: 'Pretzel', de: 'Brezel' },
    icon: 'brezel',
    price: 1.2,
    currency: 'EUR',
    energy: 10,
    mood: 3,
    minutes: 5,
  },
  doener: {
    id: 'doener',
    name: { vi: 'Bánh Döner', en: 'Döner kebab', de: 'Döner' },
    icon: 'doener',
    price: 7,
    currency: 'EUR',
    energy: 35,
    mood: 6,
    minutes: 15,
  },
  schorle: {
    id: 'schorle',
    name: { vi: 'Nước táo Apfelschorle', en: 'Apple spritzer', de: 'Apfelschorle' },
    icon: 'schorle',
    price: 1.5,
    currency: 'EUR',
    energy: 6,
    mood: 4,
    minutes: 3,
  },
  kaffee: {
    id: 'kaffee',
    name: { vi: 'Cà phê mang đi', en: 'Coffee to go', de: 'Kaffee to go' },
    icon: 'kaffee',
    price: 2.8,
    currency: 'EUR',
    energy: 12,
    mood: 2,
    minutes: 3,
  },
  pizza: {
    id: 'pizza',
    name: { vi: 'Pizza đông lạnh', en: 'Frozen pizza', de: 'Tiefkühlpizza' },
    icon: 'pizza',
    price: 3,
    currency: 'EUR',
    energy: 25,
    mood: 2,
    minutes: 20,
  },
  kuchen: {
    id: 'kuchen',
    name: { vi: 'Bánh táo Apfelkuchen', en: 'Apple cake', de: 'Apfelkuchen' },
    icon: 'kuchen',
    price: 2.5,
    currency: 'EUR',
    energy: 12,
    mood: 6,
    minutes: 8,
  },
  asiaNudeln: {
    id: 'asiaNudeln',
    name: { vi: 'Mì gói (siêu thị châu Á)', en: 'Instant noodles (Asia shop)', de: 'Instantnudeln (Asia-Markt)' },
    icon: 'miGoi',
    price: 1.2,
    currency: 'EUR',
    energy: 12,
    mood: 5,
    minutes: 10,
  },
} satisfies Record<string, ItemDef>

export type ItemId = keyof typeof ITEMS

export function getItem(id: string): ItemDef | undefined {
  return (ITEMS as Record<string, ItemDef>)[id]
}
