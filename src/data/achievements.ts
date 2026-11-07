import type { Localized } from '../i18n/localized'
import type { Condition } from './conditions'

/** Achievements (plan §5.9). Unlocked once their condition holds; shown in the bag. */

export interface AchievementDef {
  id: string
  icon: string
  name: Localized
  desc: Localized
  when: Condition
}

const A = (id: string, icon: string, vi: string, en: string, dVi: string, dEn: string, when: Condition): AchievementDef => ({
  id,
  icon,
  name: { vi, en },
  desc: { vi: dVi, en: dEn },
  when,
})

export const ACHIEVEMENTS: AchievementDef[] = [
  A('barista', '☕', 'Barista tập sự', 'Apprentice barista', 'Phục vụ 20 ly cà phê', 'Serve 20 drinks', { flag: 'stats.served', atLeast: 20 }),
  A('traDa', '🧊', 'Chiến hữu trà đá', 'Iced-tea comrade', 'Uống 5 ly trà đá với Bà Sáu', 'Drink 5 iced teas at Granny Sau’s', { flag: 'stats.traDa', atLeast: 5 }),
  A('derdiedas', '🎯', 'Der, die, das? Dễ!', 'Der, die, das? Easy!', 'Một bài học không sai câu nào', 'A lesson without a single mistake', { flag: 'stats.perfectLessons', atLeast: 1 }),
  A('b1', '🎓', 'B1 rồi nè!', 'B1 achieved!', 'Thi đậu chứng chỉ B1', 'Pass the B1 exam', { germanLevel: 3 }),
  A('terminHunter', '📅', 'Termin Hunter', 'Termin Hunter', 'Săn được Termin ngay lần đầu tiên', 'Get a Termin on your very first try', { flag: 'achv.terminFirstTry' }),
  A('visa', '🛂', 'Có visa rồi!', 'Visa granted!', 'Phỏng vấn visa thành công', 'Pass the visa interview', { flag: 'visa.readyDay' }),
  A('hallo', '🇩🇪', 'Hallo Deutschland', 'Hallo Deutschland', 'Đặt chân đến nước Đức', 'Arrive in Germany', { flag: 'de.arrived' }),
  A('wg', '🏠', 'Có nhà rồi', 'Got a room', 'Vượt qua WG-Casting', 'Pass a WG casting', { flag: 'de.wg' }),
  A('buerokratie', '📎', 'Bürokratie-Profi', 'Bureaucracy pro', 'Anmeldung, ngân hàng và bảo hiểm — xong hết!', 'Anmeldung, bank and insurance — all done!', { test: 'de.paperworkDone' }),
  A('careHeart', '💗', 'Trái tim điều dưỡng', 'Heart of care', 'Một ca chăm sóc với 100% hài lòng', 'A care shift at 100% satisfaction', { flag: 'achv.perfectCare' }),
  A('pfand50', '🍾', 'Thợ săn Pfand', 'Pfand hunter', 'Trả 50 chai Pfand', 'Return 50 Pfand bottles', { flag: 'stats.bottles', atLeast: 50 }),
  A('pfandKoenig', '👑', 'Pfandkönig', 'Pfand king', 'Trả 1.000 chai Pfand', 'Return 1,000 Pfand bottles', { flag: 'stats.bottles', atLeast: 1000 }),
  A('schwarzfahrer', '🎫', 'Đi tàu chui…', 'Fare dodger…', 'Đi tàu không có vé', 'Ride without a ticket', { flag: 'stats.schwarzfahren', atLeast: 1 }),
  A('nightOwl', '🦉', 'Cú đêm', 'Night owl', 'Ngủ gục ngoài đường một lần', 'Fall asleep on the street once', { flag: 'stats.passedOut', atLeast: 1 }),
  A('fashion', '👕', 'Sành điệu', 'Fashionista', 'Mua 3 món đồ hoặc kiểu tóc', 'Buy 3 clothes or hairstyles', { flag: 'stats.clothes', atLeast: 3 }),
]
