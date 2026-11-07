import type { Localized } from '../i18n/localized'
import type { Condition } from './conditions'

/**
 * Random morning events (plan §5.7): one may happen when you wake up.
 * Money is in the current country's currency.
 */

export interface GameEvent {
  id: string
  text: Localized
  /** Relative chance (default 1). */
  weight?: number
  when?: Condition
  money?: number
  energy?: number
  mood?: number
}

const E = (id: string, vi: string, en: string, fx: Omit<GameEvent, 'id' | 'text'>): GameEvent => ({ id, text: { vi, en }, ...fx })

/** Chance that any event happens on a given morning. */
export const EVENT_CHANCE = 0.45

export const EVENTS: GameEvent[] = [
  // Vietnam
  E('momMoney', '📩 Mẹ chuyển khoản: „Mẹ gửi con ít tiền học tiếng nè!"', '📩 Mum sends money: “For your German lessons!”', { when: { country: 'vn' }, money: 150_000, mood: 5 }),
  E('rainVn', '🌧 Mưa to cả buổi sáng, đường ngập. Ướt hết rồi…', '🌧 Heavy rain all morning, streets flooded. Soaked…', { when: { country: 'vn' }, mood: -5 }),
  E('bikeBroken', '🔧 Xe đạp bị thủng lốp, vá mất 20.000 ₫.', '🔧 Flat bicycle tyre, 20,000 ₫ to fix.', { when: { country: 'vn' }, money: -20_000 }),
  E('friendCoffee', '☕ Bạn cũ rủ cà phê sáng, kể chuyện cười cả buổi.', '☕ An old friend invites you for coffee and jokes.', { when: { country: 'vn' }, mood: 8 }),
  E('goodSleep', '😴 Ngủ một giấc thật ngon!', '😴 A wonderful night’s sleep!', { energy: 0, mood: 6 }),
  // Germany
  E('brief', '✉️ Brief vom Amt: một lá thư 4 trang toàn chữ khó hiểu. Đọc mất cả buổi…', '✉️ A letter from the authorities: 4 pages of baffling German…', { when: { country: 'de' }, mood: -6, energy: -5 }),
  E('bahn', '🚆 Deutsche Bahn trễ 40 phút. Đứng chờ ngoài sân ga lạnh cóng.', '🚆 The train is 40 minutes late. Freezing on the platform.', { when: { country: 'de' }, mood: -5 }),
  E('callHome', '📱 Gọi video về nhà, mẹ khoe nồi cá kho. Nhớ nhà quá…', '📱 Video call home — Mum shows off her braised fish. So homesick…', { when: { country: 'de' }, mood: 6, weight: 1.5 }),
  E('sunnyDe', '☀️ Trời nắng hiếm hoi! Cả thành phố ra công viên.', '☀️ A rare sunny day! The whole city is in the park.', { when: { country: 'de' }, mood: 8 }),
  E('foundCoin', '🪙 Nhặt được 2 € trên vỉa hè.', '🪙 Found €2 on the sidewalk.', { when: { country: 'de' }, money: 2, mood: 2 }),
  E('neighborCake', '🍰 Bà hàng xóm tặng một miếng Kuchen.', '🍰 The neighbour gives you a slice of cake.', { when: { country: 'de' }, energy: 10, mood: 5 }),
]
