import type { Localized } from '../i18n/localized'

/**
 * German vocabulary and sentences (plan §7 data/vocab.ts). Add words freely:
 * level 0 = A1, 1 = A2, 2 = B1, 3 = care-work vocabulary (Berufsschule).
 */

export type Article = 'der' | 'die' | 'das'

export interface VocabWord {
  de: string
  article?: Article
  meaning: Localized
  level: number
}

export interface Sentence {
  de: string
  meaning: Localized
  level: number
}

const w = (level: number, de: string, article: Article | undefined, vi: string, en: string): VocabWord => ({
  de,
  article,
  meaning: { vi, en },
  level,
})

export const VOCAB: VocabWord[] = [
  // A1
  w(0, 'Tisch', 'der', 'cái bàn', 'table'),
  w(0, 'Tür', 'die', 'cửa ra vào', 'door'),
  w(0, 'Haus', 'das', 'ngôi nhà', 'house'),
  w(0, 'Stuhl', 'der', 'cái ghế', 'chair'),
  w(0, 'Lampe', 'die', 'cái đèn', 'lamp'),
  w(0, 'Buch', 'das', 'quyển sách', 'book'),
  w(0, 'Kaffee', 'der', 'cà phê', 'coffee'),
  w(0, 'Milch', 'die', 'sữa', 'milk'),
  w(0, 'Wasser', 'das', 'nước', 'water'),
  w(0, 'Tee', 'der', 'trà', 'tea'),
  w(0, 'Mutter', 'die', 'mẹ', 'mother'),
  w(0, 'Vater', 'der', 'bố', 'father'),
  w(0, 'Kind', 'das', 'đứa trẻ', 'child'),
  w(0, 'Stadt', 'die', 'thành phố', 'city'),
  w(0, 'Bahnhof', 'der', 'nhà ga', 'train station'),
  w(0, 'Auto', 'das', 'xe hơi', 'car'),
  w(0, 'Straße', 'die', 'con đường', 'street'),
  w(0, 'Freund', 'der', 'người bạn', 'friend'),
  w(0, 'Schule', 'die', 'trường học', 'school'),
  w(0, 'Brot', 'das', 'bánh mì (Đức)', 'bread'),
  w(0, 'Apfel', 'der', 'quả táo', 'apple'),
  w(0, 'Uhr', 'die', 'đồng hồ', 'clock'),
  w(0, 'Fenster', 'das', 'cửa sổ', 'window'),
  w(0, 'Hund', 'der', 'con chó', 'dog'),
  w(0, 'Katze', 'die', 'con mèo', 'cat'),
  w(0, 'Zimmer', 'das', 'căn phòng', 'room'),
  w(0, 'Arbeit', 'die', 'công việc', 'work'),
  w(0, 'Geld', 'das', 'tiền', 'money'),
  w(0, 'Tag', 'der', 'ngày', 'day'),
  w(0, 'Hallo', undefined, 'xin chào', 'hello'),
  w(0, 'Danke', undefined, 'cảm ơn', 'thank you'),
  w(0, 'Tschüss', undefined, 'tạm biệt', 'bye'),
  w(0, 'heute', undefined, 'hôm nay', 'today'),
  w(0, 'morgen', undefined, 'ngày mai', 'tomorrow'),
  w(0, 'essen', undefined, 'ăn', 'to eat'),
  w(0, 'trinken', undefined, 'uống', 'to drink'),
  w(0, 'schlafen', undefined, 'ngủ', 'to sleep'),
  w(0, 'lernen', undefined, 'học', 'to learn'),
  // A2
  w(1, 'Termin', 'der', 'lịch hẹn', 'appointment'),
  w(1, 'Wohnung', 'die', 'căn hộ', 'flat'),
  w(1, 'Formular', 'das', 'tờ khai', 'form'),
  w(1, 'Ausweis', 'der', 'giấy tờ tùy thân', 'ID card'),
  w(1, 'Miete', 'die', 'tiền thuê nhà', 'rent'),
  w(1, 'Konto', 'das', 'tài khoản ngân hàng', 'bank account'),
  w(1, 'Arzt', 'der', 'bác sĩ', 'doctor'),
  w(1, 'Krankenkasse', 'die', 'quỹ bảo hiểm y tế', 'health insurer'),
  w(1, 'Gehalt', 'das', 'tiền lương', 'salary'),
  w(1, 'Vertrag', 'der', 'hợp đồng', 'contract'),
  w(1, 'Rechnung', 'die', 'hóa đơn', 'bill'),
  w(1, 'Ticket', 'das', 'vé', 'ticket'),
  w(1, 'Zug', 'der', 'tàu hỏa', 'train'),
  w(1, 'Verspätung', 'die', 'sự trễ giờ', 'delay'),
  w(1, 'Wetter', 'das', 'thời tiết', 'weather'),
  w(1, 'Regen', 'der', 'mưa', 'rain'),
  w(1, 'Reise', 'die', 'chuyến đi', 'trip'),
  w(1, 'Gepäck', 'das', 'hành lý', 'luggage'),
  w(1, 'Flughafen', 'der', 'sân bay', 'airport'),
  w(1, 'Botschaft', 'die', 'đại sứ quán', 'embassy'),
  w(1, 'Visum', 'das', 'thị thực (visa)', 'visa'),
  w(1, 'Pass', 'der', 'hộ chiếu', 'passport'),
  w(1, 'Nachbarin', 'die', 'cô hàng xóm', 'neighbour (f)'),
  w(1, 'Frühstück', 'das', 'bữa sáng', 'breakfast'),
  w(1, 'Supermarkt', 'der', 'siêu thị', 'supermarket'),
  w(1, 'pünktlich', undefined, 'đúng giờ', 'on time'),
  w(1, 'schwierig', undefined, 'khó', 'difficult'),
  w(1, 'bezahlen', undefined, 'trả tiền', 'to pay'),
  w(1, 'unterschreiben', undefined, 'ký tên', 'to sign'),
  w(1, 'warten', undefined, 'chờ đợi', 'to wait'),
  w(1, 'vergessen', undefined, 'quên', 'to forget'),
  // B1
  w(2, 'Ausbildung', 'die', 'học nghề', 'vocational training'),
  w(2, 'Studium', 'das', 'việc học đại học', 'university studies'),
  w(2, 'Lebenslauf', 'der', 'sơ yếu lý lịch', 'CV'),
  w(2, 'Bewerbung', 'die', 'hồ sơ ứng tuyển', 'application'),
  w(2, 'Vorstellungsgespräch', 'das', 'buổi phỏng vấn', 'job interview'),
  w(2, 'Arbeitgeber', 'der', 'chủ lao động', 'employer'),
  w(2, 'Pflege', 'die', 'điều dưỡng, chăm sóc', 'nursing care'),
  w(2, 'Pflegeheim', 'das', 'viện dưỡng lão', 'care home'),
  w(2, 'Bewohner', 'der', 'cư dân (viện dưỡng lão)', 'resident'),
  w(2, 'Erfahrung', 'die', 'kinh nghiệm', 'experience'),
  w(2, 'Zeugnis', 'das', 'bằng, học bạ', 'certificate'),
  w(2, 'Abschluss', 'der', 'bằng tốt nghiệp', 'degree'),
  w(2, 'Anmeldung', 'die', 'đăng ký cư trú', 'registration'),
  w(2, 'Bürgeramt', 'das', 'văn phòng công dân', 'citizens’ office'),
  w(2, 'Mietvertrag', 'der', 'hợp đồng thuê nhà', 'tenancy contract'),
  w(2, 'Versicherung', 'die', 'bảo hiểm', 'insurance'),
  w(2, 'Sperrkonto', 'das', 'tài khoản phong tỏa', 'blocked account'),
  w(2, 'Schichtdienst', 'der', 'làm việc theo ca', 'shift work'),
  w(2, 'Geduld', 'die', 'sự kiên nhẫn', 'patience'),
  w(2, 'Heimweh', 'das', 'nỗi nhớ nhà', 'homesickness'),
  w(2, 'Feierabend', 'der', 'giờ tan làm', 'end of the workday'),
  w(2, 'Pünktlichkeit', 'die', 'sự đúng giờ', 'punctuality'),
  w(2, 'verantwortlich', undefined, 'có trách nhiệm', 'responsible'),
  w(2, 'zuverlässig', undefined, 'đáng tin cậy', 'reliable'),
  w(2, 'unterstützen', undefined, 'hỗ trợ', 'to support'),
  w(2, 'sich bewerben', undefined, 'nộp đơn xin', 'to apply'),
  // Care work (Berufsschule)
  w(3, 'Rollstuhl', 'der', 'xe lăn', 'wheelchair'),
  w(3, 'Löffel', 'der', 'cái thìa', 'spoon'),
  w(3, 'Serviette', 'die', 'khăn ăn', 'napkin'),
  w(3, 'Bett', 'das', 'giường', 'bed'),
  w(3, 'Decke', 'die', 'cái chăn', 'blanket'),
  w(3, 'Blutdruck', 'der', 'huyết áp', 'blood pressure'),
  w(3, 'Tablette', 'die', 'viên thuốc', 'pill'),
  w(3, 'Pflaster', 'das', 'băng cá nhân', 'plaster'),
  w(3, 'Schicht', 'die', 'ca làm việc', 'shift'),
  w(3, 'Handtuch', 'das', 'khăn tắm', 'towel'),
  w(3, 'Fieber', 'das', 'sốt', 'fever'),
  w(3, 'Schmerz', 'der', 'cơn đau', 'pain'),
]

const s = (level: number, de: string, vi: string, en: string): Sentence => ({ de, meaning: { vi, en }, level })

export const SENTENCES: Sentence[] = [
  s(0, 'Ich heiße Lan.', 'Tôi tên là Lan.', 'My name is Lan.'),
  s(0, 'Ich trinke gern Kaffee.', 'Tôi thích uống cà phê.', 'I like drinking coffee.'),
  s(0, 'Das ist mein Freund.', 'Đây là bạn tôi.', 'This is my friend.'),
  s(0, 'Wo ist der Bahnhof?', 'Nhà ga ở đâu?', 'Where is the station?'),
  s(0, 'Ich komme aus Vietnam.', 'Tôi đến từ Việt Nam.', 'I come from Vietnam.'),
  s(0, 'Ich lerne jeden Tag Deutsch.', 'Tôi học tiếng Đức mỗi ngày.', 'I learn German every day.'),
  s(1, 'Ich habe morgen einen Termin.', 'Ngày mai tôi có một lịch hẹn.', 'I have an appointment tomorrow.'),
  s(1, 'Die Miete ist zu hoch.', 'Tiền thuê nhà cao quá.', 'The rent is too high.'),
  s(1, 'Der Zug hat wieder Verspätung.', 'Tàu lại bị trễ nữa rồi.', 'The train is late again.'),
  s(1, 'Ich möchte ein Konto eröffnen.', 'Tôi muốn mở một tài khoản.', 'I would like to open an account.'),
  s(1, 'Können Sie mir bitte helfen?', 'Anh/chị có thể giúp tôi không?', 'Could you help me, please?'),
  s(1, 'Ich suche eine kleine Wohnung.', 'Tôi đang tìm một căn hộ nhỏ.', 'I am looking for a small flat.'),
  s(2, 'Ich möchte eine Ausbildung in der Pflege machen.', 'Tôi muốn học nghề điều dưỡng.', 'I want to train as a nurse.'),
  s(2, 'Seit zwei Jahren lerne ich Deutsch.', 'Tôi học tiếng Đức được hai năm rồi.', 'I have been learning German for two years.'),
  s(2, 'Ich habe einen Termin beim Bürgeramt.', 'Tôi có lịch hẹn ở Bürgeramt.', 'I have an appointment at the citizens’ office.'),
  s(2, 'Nach der Arbeit habe ich endlich Feierabend.', 'Sau giờ làm cuối cùng tôi cũng được nghỉ.', 'After work I finally have my evening off.'),
  s(2, 'Ich bin zuverlässig und arbeite gern im Team.', 'Tôi đáng tin cậy và thích làm việc nhóm.', 'I am reliable and like working in a team.'),
]

/** Words up to `level`, with the current level twice as likely (review older words too). */
export function vocabPool(level: number, onlyNouns = false): VocabWord[] {
  const care = level >= 3
  const pool = VOCAB.filter((v) => (care ? v.level === 3 : v.level <= level) && (!onlyNouns || v.article))
  return care ? pool : [...pool, ...pool.filter((v) => v.level === level)]
}
