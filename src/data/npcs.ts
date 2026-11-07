import type { Localized } from '../i18n/localized'

/** Character looks and the people of the street. Models are built at runtime (no files). */

export type HairStyle = 'bob' | 'short' | 'bun'
export type Accessory = 'nonLa' | 'glasses' | 'helmet' | 'beanie' | null

export interface Outfit {
  skin: string
  hair: string
  hairStyle: HairStyle
  shirt: string
  shorts: string
  shoe: string
  /** Backpack colour, or null for none. */
  bag: string | null
  accessory: Accessory
  /** Helmet colour etc. */
  accent?: string
}

export const PLAYER_OUTFIT: Outfit = {
  skin: '#ffe0c9',
  hair: '#3d2c2c',
  hairStyle: 'bob',
  shirt: '#a9d6ff',
  shorts: '#6b7cb8',
  shoe: '#ff9eb3',
  bag: '#ffc27a',
  accessory: null,
}

/** Café customers, picked in turn. */
export const CUSTOMER_OUTFITS: Outfit[] = [
  { skin: '#f9d4b8', hair: '#2b2222', hairStyle: 'bun', shirt: '#ffb3c7', shorts: '#8e7cc3', shoe: '#ffffff', bag: null, accessory: null },
  { skin: '#eec39f', hair: '#1f1a1a', hairStyle: 'short', shirt: '#b8e6c9', shorts: '#5d6b8a', shoe: '#7a8bb5', bag: null, accessory: 'glasses' },
  { skin: '#f5cfb0', hair: '#4a3328', hairStyle: 'bob', shirt: '#ffe08a', shorts: '#c97b63', shoe: '#ff9b8f', bag: null, accessory: 'nonLa' },
  { skin: '#e8b994', hair: '#2a2020', hairStyle: 'short', shirt: '#cdb8f0', shorts: '#4f5d75', shoe: '#ffd166', bag: '#8fd3c1', accessory: null },
  { skin: '#fbdcc4', hair: '#5b3a2c', hairStyle: 'bun', shirt: '#9fe0f0', shorts: '#e98aa0', shoe: '#ffffff', bag: null, accessory: 'glasses' },
  { skin: '#f0c8a8', hair: '#1c1818', hairStyle: 'short', shirt: '#ffc3a0', shorts: '#6b8f71', shoe: '#5d6170', bag: null, accessory: 'nonLa' },
]

/** Motorbike riders (helmets are the law!). */
export const RIDER_OUTFITS: Outfit[] = [
  { skin: '#f0c8a8', hair: '#1c1818', hairStyle: 'short', shirt: '#7fb8e8', shorts: '#4f5d75', shoe: '#5d6170', bag: null, accessory: 'helmet', accent: '#ff9b8f' },
  { skin: '#f9d4b8', hair: '#2b2222', hairStyle: 'bob', shirt: '#ffe08a', shorts: '#6b7cb8', shoe: '#ffffff', bag: null, accessory: 'helmet', accent: '#a8e6cf' },
  { skin: '#e8b994', hair: '#2a2020', hairStyle: 'short', shirt: '#cdb8f0', shorts: '#5d6b8a', shoe: '#ffd166', bag: null, accessory: 'helmet', accent: '#fff6e3' },
  { skin: '#fbdcc4', hair: '#5b3a2c', hairStyle: 'bun', shirt: '#ff9fb2', shorts: '#8e7cc3', shoe: '#ffffff', bag: null, accessory: 'helmet', accent: '#7fb8e8' },
]

export interface NpcDef {
  id: string
  name: Localized
  /** Shown under the name when you can talk to them. */
  title?: Localized
  outfit: Outfit
  /** Dialogue in data/dialogues.ts. NPCs with one are interactive and get a "!" marker. */
  dialogueId?: string
}

export const NPCS = {
  baSau: {
    id: 'baSau',
    name: { vi: 'Bà Sáu', en: 'Granny Sau', de: 'Oma Sau' },
    title: { vi: 'Bán trà đá', en: 'Iced-tea seller', de: 'Eistee-Verkäuferin' },
    outfit: { skin: '#f0c8a8', hair: '#d9d6dc', hairStyle: 'bun', shirt: '#b8d8f0', shorts: '#3f4a5c', shoe: '#5d6170', bag: null, accessory: null },
    dialogueId: 'baSau',
  },
  coBa: {
    id: 'coBa',
    name: { vi: 'Cô Ba', en: 'Auntie Ba', de: 'Tante Ba' },
    title: { vi: 'Chủ tạp hóa', en: 'Grocery owner', de: 'Ladenbesitzerin' },
    outfit: { skin: '#f5cfb0', hair: '#2b2222', hairStyle: 'bun', shirt: '#f7a8c0', shorts: '#2f3a4d', shoe: '#ff9b8f', bag: null, accessory: null },
    dialogueId: 'coBa',
  },
  chuBay: {
    id: 'chuBay',
    name: { vi: 'Chú Bảy', en: 'Uncle Bay', de: 'Onkel Bay' },
    title: { vi: 'Bánh mì dạo', en: 'Bánh mì vendor', de: 'Bánh-mì-Verkäufer' },
    outfit: { skin: '#e8b994', hair: '#2a2020', hairStyle: 'short', shirt: '#efe0bd', shorts: '#5d6b8a', shoe: '#5d6170', bag: null, accessory: 'nonLa' },
    dialogueId: 'chuBay',
  },
  chuNam: {
    id: 'chuNam',
    name: { vi: 'Chú Năm', en: 'Uncle Nam', de: 'Onkel Nam' },
    // The classic white tank top (áo ba lỗ).
    outfit: { skin: '#e8b994', hair: '#4a4448', hairStyle: 'short', shirt: '#ffffff', shorts: '#6b7a8f', shoe: '#5d6170', bag: null, accessory: null },
  },
  anhHai: {
    id: 'anhHai',
    name: { vi: 'Anh Hai', en: 'Brother Hai', de: 'Bruder Hai' },
    outfit: { skin: '#f0c8a8', hair: '#1c1818', hairStyle: 'short', shirt: '#7fb8e8', shorts: '#3f4a5c', shoe: '#ffffff', bag: null, accessory: null },
  },
  beTi: {
    id: 'beTi',
    name: { vi: 'Bé Tí', en: 'Little Ti', de: 'Klein Ti' },
    outfit: { skin: '#f9d4b8', hair: '#2b2222', hairStyle: 'short', shirt: '#ffe08a', shorts: '#4f7cc4', shoe: '#ff9b8f', bag: null, accessory: null },
  },
  beNa: {
    id: 'beNa',
    name: { vi: 'Bé Na', en: 'Little Na', de: 'Klein Na' },
    outfit: { skin: '#fbdcc4', hair: '#3d2c2c', hairStyle: 'bun', shirt: '#ffb3c7', shorts: '#9fd8c8', shoe: '#ffffff', bag: null, accessory: null },
  },
  coHoa: {
    id: 'coHoa',
    name: { vi: 'Cô Hoa', en: 'Auntie Hoa', de: 'Tante Hoa' },
    outfit: { skin: '#f5cfb0', hair: '#2b2222', hairStyle: 'bob', shirt: '#c9b8f0', shorts: '#5d6b8a', shoe: '#ffffff', bag: '#ffb38a', accessory: 'nonLa' },
  },
  anhKhoa: {
    id: 'anhKhoa',
    name: { vi: 'Anh Khoa', en: 'Khoa', de: 'Khoa' },
    outfit: { skin: '#eec39f', hair: '#1f1a1a', hairStyle: 'short', shirt: '#9fe0c9', shorts: '#4f5d75', shoe: '#7a8bb5', bag: '#5b7cc4', accessory: 'glasses' },
  },
  chiLan: {
    id: 'chiLan',
    name: { vi: 'Chị Lan', en: 'Lan', de: 'Lan' },
    outfit: { skin: '#fbdcc4', hair: '#3d2c2c', hairStyle: 'bun', shirt: '#ffd3a0', shorts: '#c97b63', shoe: '#ff9b8f', bag: null, accessory: null },
  },

  // --- Story: Vietnam ---
  thayMinh: {
    id: 'thayMinh',
    name: { vi: 'Thầy Minh', en: 'Teacher Minh', de: 'Lehrer Minh' },
    title: { vi: 'Lớp tiếng Đức', en: 'German class', de: 'Deutschkurs' },
    outfit: { skin: '#eec39f', hair: '#2a2020', hairStyle: 'short', shirt: '#ffffff', shorts: '#3f4a5c', shoe: '#5d6170', bag: null, accessory: 'glasses' },
    dialogueId: 'thayMinh',
  },
  vy: {
    id: 'vy',
    name: { vi: 'Bạn Vy', en: 'Vy', de: 'Vy' },
    outfit: { skin: '#fbdcc4', hair: '#2b2222', hairStyle: 'bob', shirt: '#ffe08a', shorts: '#8e7cc3', shoe: '#ffffff', bag: '#ff9fb2', accessory: null },
  },
  chiMai: {
    id: 'chiMai',
    name: { vi: 'Chị Mai', en: 'Mai', de: 'Mai' },
    title: { vi: 'Tư vấn du học', en: 'Study-abroad advisor', de: 'Auslandsberaterin' },
    outfit: { skin: '#f5cfb0', hair: '#3d2c2c', hairStyle: 'bun', shirt: '#cdb8f0', shorts: '#2f3a4d', shoe: '#d4473b', bag: null, accessory: 'glasses' },
    dialogueId: 'chiMai',
  },
  anhTu: {
    id: 'anhTu',
    name: { vi: 'Anh Tư', en: 'Brother Tư', de: 'Bruder Tư' },
    title: { vi: 'Xe ôm', en: 'Motorbike taxi', de: 'Motorradtaxi' },
    outfit: { skin: '#e8b994', hair: '#1c1818', hairStyle: 'short', shirt: '#8fbf6a', shorts: '#4f5d75', shoe: '#5d6170', bag: null, accessory: 'helmet', accent: '#2f8c7f' },
    dialogueId: 'xeOm',
  },
  chiHang: {
    id: 'chiHang',
    name: { vi: 'Chị Hằng', en: 'Hằng', de: 'Hằng' },
    title: { vi: 'Bán quần áo', en: 'Clothes seller', de: 'Kleiderhändlerin' },
    outfit: { skin: '#f9d4b8', hair: '#2b2222', hairStyle: 'bun', shirt: '#ff9b8f', shorts: '#5d6b8a', shoe: '#ffffff', bag: null, accessory: 'nonLa' },
    dialogueId: 'chiHang',
  },
  chuSau: {
    id: 'chuSau',
    name: { vi: 'Chú Sáu', en: 'Uncle Sáu', de: 'Onkel Sáu' },
    title: { vi: 'Thợ hớt tóc', en: 'Barber', de: 'Friseur' },
    outfit: { skin: '#e8b994', hair: '#9a9298', hairStyle: 'short', shirt: '#b8d8f0', shorts: '#3f4a5c', shoe: '#5d6170', bag: null, accessory: null },
    dialogueId: 'chuSau',
  },
  officer: {
    id: 'officer',
    name: { vi: 'Bà Lehmann', en: 'Ms Lehmann', de: 'Frau Lehmann' },
    title: { vi: 'Viên chức lãnh sự', en: 'Consular officer', de: 'Konsularbeamtin' },
    outfit: { skin: '#fbe2d0', hair: '#c9a46a', hairStyle: 'bun', shirt: '#3f4a6b', shorts: '#2f3a4d', shoe: '#2f2f38', bag: null, accessory: 'glasses' },
    dialogueId: 'officer',
  },
  me: {
    id: 'me',
    name: { vi: 'Mẹ', en: 'Mum', de: 'Mama' },
    outfit: { skin: '#f0c8a8', hair: '#2b2222', hairStyle: 'bun', shirt: '#e98aa0', shorts: '#3f4a5c', shoe: '#ffffff', bag: null, accessory: null },
    dialogueId: 'me',
  },
  bo: {
    id: 'bo',
    name: { vi: 'Bố', en: 'Dad', de: 'Papa' },
    outfit: { skin: '#e8b994', hair: '#4a4448', hairStyle: 'short', shirt: '#7fb8e8', shorts: '#3f4a5c', shoe: '#5d6170', bag: null, accessory: null },
  },
  emGai: {
    id: 'emGai',
    name: { vi: 'Em gái', en: 'Little sister', de: 'Kleine Schwester' },
    outfit: { skin: '#fbdcc4', hair: '#2b2222', hairStyle: 'bun', shirt: '#ffe08a', shorts: '#ff9fb2', shoe: '#ffffff', bag: null, accessory: null },
  },

  // --- Story: Germany ---
  lena: {
    id: 'lena',
    name: { vi: 'Lena', en: 'Lena', de: 'Lena' },
    title: { vi: 'Bạn cùng WG', en: 'Flatmate', de: 'Mitbewohnerin' },
    outfit: { skin: '#fbe2d0', hair: '#d9a24e', hairStyle: 'bun', shirt: '#9fe0c9', shorts: '#3f4a6b', shoe: '#ffffff', bag: null, accessory: null },
    dialogueId: 'lena',
  },
  jonas: {
    id: 'jonas',
    name: { vi: 'Jonas', en: 'Jonas', de: 'Jonas' },
    title: { vi: 'Bạn cùng WG', en: 'Flatmate', de: 'Mitbewohner' },
    outfit: { skin: '#f6d6c0', hair: '#6b4a32', hairStyle: 'short', shirt: '#7a8bb5', shorts: '#2f3a4d', shoe: '#d4473b', bag: null, accessory: 'beanie', accent: '#f4c04e' },
    dialogueId: 'jonas',
  },
  clerk: {
    id: 'clerk',
    name: { vi: 'Ông Becker', en: 'Mr Becker', de: 'Herr Becker' },
    title: { vi: 'Nhân viên Bürgeramt', en: 'Bürgeramt clerk', de: 'Sachbearbeiter' },
    outfit: { skin: '#f6d6c0', hair: '#b8b2ac', hairStyle: 'short', shirt: '#c9b48a', shorts: '#4f4a40', shoe: '#2f2f38', bag: null, accessory: 'glasses' },
    dialogueId: 'clerk',
  },
  wagner: {
    id: 'wagner',
    name: { vi: 'Bà Wagner', en: 'Ms Wagner', de: 'Frau Wagner' },
    title: { vi: 'Ngân hàng Sparbank', en: 'Sparbank', de: 'Sparbank' },
    outfit: { skin: '#fbe2d0', hair: '#5b3a2c', hairStyle: 'bob', shirt: '#d4473b', shorts: '#2f3a4d', shoe: '#2f2f38', bag: null, accessory: null },
    dialogueId: 'wagner',
  },
  anna: {
    id: 'anna',
    name: { vi: 'Chị Anna', en: 'Nurse Anna', de: 'Schwester Anna' },
    title: { vi: 'Hướng dẫn thực tập', en: 'Mentor', de: 'Praxisanleiterin' },
    outfit: { skin: '#fbe2d0', hair: '#c97b4a', hairStyle: 'bun', shirt: '#ffffff', shorts: '#ffffff', shoe: '#ffffff', bag: null, accessory: null },
    dialogueId: 'anna',
  },
  frauSchmidt: {
    id: 'frauSchmidt',
    name: { vi: 'Bà Schmidt', en: 'Mrs Schmidt', de: 'Frau Schmidt' },
    outfit: { skin: '#f6dccb', hair: '#e8e4ec', hairStyle: 'bun', shirt: '#cdb8f0', shorts: '#6b5a7a', shoe: '#c97b63', bag: null, accessory: 'glasses' },
  },
  herrWeber: {
    id: 'herrWeber',
    name: { vi: 'Ông Weber', en: 'Mr Weber', de: 'Herr Weber' },
    outfit: { skin: '#f0d0bc', hair: '#dcd8de', hairStyle: 'short', shirt: '#8fa8c8', shorts: '#4f4a40', shoe: '#5d6170', bag: null, accessory: null },
  },
  frauHoffmann: {
    id: 'frauHoffmann',
    name: { vi: 'Bà Hoffmann', en: 'Mrs Hoffmann', de: 'Frau Hoffmann' },
    outfit: { skin: '#f6dccb', hair: '#f0eef2', hairStyle: 'bob', shirt: '#f7a8c0', shorts: '#5d6b8a', shoe: '#ffffff', bag: null, accessory: null },
  },
  herrKrause: {
    id: 'herrKrause',
    name: { vi: 'Ông Krause', en: 'Mr Krause', de: 'Herr Krause' },
    outfit: { skin: '#f0d0bc', hair: '#cfcfd6', hairStyle: 'short', shirt: '#a8c89a', shorts: '#4f5d75', shoe: '#5d6170', bag: null, accessory: 'glasses' },
  },
  herrMueller: {
    id: 'herrMueller',
    name: { vi: 'Ông Müller', en: 'Mr Müller', de: 'Herr Müller' },
    outfit: { skin: '#f0d0bc', hair: '#a8a2a0', hairStyle: 'short', shirt: '#8a9a7a', shorts: '#4f4a40', shoe: '#5d6170', bag: null, accessory: 'beanie', accent: '#5b7cc4' },
  },
  sophie: {
    id: 'sophie',
    name: { vi: 'Sophie', en: 'Sophie', de: 'Sophie' },
    outfit: { skin: '#fbe2d0', hair: '#e0b45e', hairStyle: 'bob', shirt: '#ff9fb2', shorts: '#3f4a6b', shoe: '#ffffff', bag: '#e8dcc0', accessory: null },
  },
  tom: {
    id: 'tom',
    name: { vi: 'Tom', en: 'Tom', de: 'Tom' },
    outfit: { skin: '#e8b994', hair: '#2a2020', hairStyle: 'short', shirt: '#f4c04e', shorts: '#3f4a6b', shoe: '#5d6170', bag: '#4f5d75', accessory: null },
  },
} satisfies Record<string, NpcDef>

export type NpcId = keyof typeof NPCS

export function getNpc(id: string): NpcDef | undefined {
  return (NPCS as Record<string, NpcDef>)[id]
}
