import type { Localized } from '../i18n/localized'
import type { Condition } from './conditions'

/**
 * Story quests (plan §5.4): chapters of quests, each a checklist of steps. A step is done
 * when its condition holds (and stays done). A quest appears once the quest in `after`
 * is complete (or a later main quest already is, so a skipped step never blocks the story).
 * The HUD shows the first unfinished step of the first open main quest.
 */

export interface QuestStep {
  id: string
  text: Localized
  done: Condition
}

export interface QuestDef {
  id: string
  chapter: number
  title: Localized
  after?: string
  /** Side quests don't drive the objective tracker. */
  side?: boolean
  steps: QuestStep[]
}

const L = (vi: string, en: string): Localized => ({ vi, en })
const step = (id: string, vi: string, en: string, done: Condition): QuestStep => ({ id, text: L(vi, en), done })

export const CHAPTER_NAMES: Record<number, Localized> = {
  1: L('Chương 1 · Học tiếng Đức ở Việt Nam', 'Chapter 1 · Learning German in Vietnam'),
  2: L('Chương 2 · Hành trình visa', 'Chapter 2 · The visa journey'),
  3: L('Chương 3 · Đặt chân đến Đức', 'Chapter 3 · Arriving in Germany'),
  4: L('Chương 4 · Ausbildung điều dưỡng', 'Chapter 4 · Nursing training'),
}

export const QUESTS: QuestDef[] = [
  {
    id: 'start',
    chapter: 1,
    title: L('Bắt đầu hành trình', 'The journey begins'),
    steps: [
      step('start.teacher', 'Gặp Thầy Minh ở lớp tiếng Đức trong hẻm', 'Meet Teacher Minh at the alley German class', { flag: 'talked.thayMinh' }),
      step('start.enroll', 'Đăng ký khóa A1', 'Enrol in the A1 course', { flag: 'course.0' }),
    ],
  },
  {
    id: 'saigon',
    chapter: 1,
    title: L('Sống ở Sài Gòn', 'Life in Saigon'),
    side: true,
    steps: [
      step('start.shift', 'Làm một ca ở quán cà phê', 'Work a shift at the café', { flag: 'stats.shifts', atLeast: 1 }),
      step('sg.traDa', 'Uống trà đá ở quán Bà Sáu', 'Have iced tea at Granny Sáu’s stall', { flag: 'stats.traDa', atLeast: 1 }),
      step('sg.clothes', 'Mua đồ mới ở sạp Chị Hằng', 'Buy new clothes at Hằng’s stall', { flag: 'stats.clothes', atLeast: 1 }),
    ],
  },
  {
    id: 'a1',
    chapter: 1,
    title: L('Chứng chỉ A1', 'A1 certificate'),
    after: 'start',
    steps: [
      step('a1.xp', 'Học bài cho đủ XP (lớp học hoặc tự học ở nhà)', 'Earn enough XP (class or self-study at home)', { any: [{ germanXpReady: true }, { germanLevel: 1 }] }),
      step('a1.exam', 'Thi đậu A1', 'Pass the A1 exam', { germanLevel: 1 }),
    ],
  },
  {
    id: 'a2',
    chapter: 1,
    title: L('Chứng chỉ A2', 'A2 certificate'),
    after: 'a1',
    steps: [
      step('a2.enroll', 'Đăng ký khóa A2', 'Enrol in the A2 course', { flag: 'course.1' }),
      step('a2.exam', 'Thi đậu A2', 'Pass the A2 exam', { germanLevel: 2 }),
    ],
  },
  {
    id: 'b1',
    chapter: 1,
    title: L('Chứng chỉ B1', 'B1 certificate'),
    after: 'a2',
    steps: [
      step('b1.enroll', 'Đăng ký khóa B1', 'Enrol in the B1 course', { flag: 'course.2' }),
      step('b1.exam', 'Thi đậu B1', 'Pass the B1 exam', { germanLevel: 3 }),
    ],
  },
  {
    id: 'path',
    chapter: 2,
    title: L('Chọn con đường', 'Choose your path'),
    after: 'b1',
    steps: [
      step('path.mai', 'Gặp chị Mai tư vấn du học (bàn ngoài quán cà phê)', 'Meet Mai the advisor (café terrace)', { flag: 'talked.chiMai' }),
      step('path.choose', 'Chọn Studium hoặc Ausbildung', 'Choose Studium or Ausbildung', { flag: 'visa.path' }),
    ],
  },
  {
    id: 'visa',
    chapter: 2,
    title: L('Hồ sơ visa', 'The visa application'),
    after: 'path',
    steps: [
      step('visa.docs', 'Hoàn thành mọi giấy tờ trong Hồ sơ visa', 'Complete every document in the visa file', { test: 'visa.docsComplete' }),
      step('visa.termin', 'Săn được Termin ở Đại sứ quán', 'Get an embassy Termin', { any: [{ flag: 'visa.terminDay', atLeast: 1 }, { flag: 'visa.readyDay' }] }),
      step('visa.interview', 'Đi xe ôm tới Đại sứ quán đúng ngày và phỏng vấn đậu', 'Ride to the embassy on the day and pass the interview', { flag: 'visa.readyDay' }),
    ],
  },
  {
    id: 'departure',
    chapter: 2,
    title: L('Lên đường', 'Departure'),
    after: 'visa',
    steps: [
      step('dep.visa', 'Chờ visa được cấp', 'Wait for the visa', { test: 'visa.ready' }),
      step('dep.flight', 'Mua vé máy bay (chị Mai)', 'Buy a plane ticket (Mai)', { flag: 'visa.flight' }),
      step('dep.airport', 'Ra sân bay, chào gia đình và lên máy bay', 'Go to the airport, say goodbye, board the plane', { flag: 'de.arrived' }),
    ],
  },
  {
    id: 'arrival',
    chapter: 3,
    title: L('Chào nước Đức!', 'Hallo Deutschland!'),
    after: 'departure',
    steps: [
      step('arr.wg', 'Tìm phòng: WG-Casting ở Lindenstraße 12', 'Find a room: WG casting at Lindenstraße 12', { flag: 'de.wg' }),
      step('arr.anmeldung', 'Anmeldung ở Bürgeramt (cần Termin + lấy số)', 'Register at the Bürgeramt (Termin + number)', { flag: 'de.anmeldung' }),
      step('arr.bank', 'Mở tài khoản ở Sparbank', 'Open an account at Sparbank', { flag: 'de.bank' }),
      step('arr.insurance', 'Đăng ký bảo hiểm y tế (laptop trong phòng WG)', 'Sign up for health insurance (laptop in your WG room)', { flag: 'de.insurance' }),
    ],
  },
  {
    id: 'firstDay',
    chapter: 4,
    title: L('Ngày làm việc đầu tiên', 'The first workday'),
    after: 'arrival',
    steps: [
      step('fd.ticket', 'Mua vé tàu ở máy bán vé', 'Buy a transit ticket at the machine', { any: [{ flag: 'de.ticketUntil' }, { flag: 'talked.anna' }] }),
      step('fd.anna', 'Đi tàu tới viện dưỡng lão, gặp chị Anna', 'Take the tram to the care home, meet Anna', { flag: 'talked.anna' }),
      step('fd.shift', 'Hoàn thành một ca chăm sóc', 'Finish a care shift', { flag: 'stats.careShifts', atLeast: 1 }),
    ],
  },
  {
    id: 'life',
    chapter: 4,
    title: L('Cuộc sống ở Đức', 'Life in Germany'),
    after: 'arrival',
    side: true,
    steps: [
      step('life.rent', 'Trả tiền thuê nhà tuần đầu tiên', 'Pay your first week’s rent', { flag: 'stats.rentPaid', atLeast: 1 }),
      step('life.pfand', 'Nhặt và trả 20 chai Pfand', 'Collect and return 20 Pfand bottles', { flag: 'stats.bottles', atLeast: 20 }),
      step('life.clothes', 'Mua đồ ở chợ Flohmarkt', 'Buy something at the flea market', { flag: 'stats.clothes', atLeast: 1 }),
      step('life.school', 'Học lý thuyết Berufsschule', 'Attend Berufsschule theory', { flag: 'stats.berufsschule', atLeast: 1 }),
      step('life.shifts', 'Hoàn thành 5 ca chăm sóc', 'Finish 5 care shifts', { flag: 'stats.careShifts', atLeast: 5 }),
    ],
  },
]
