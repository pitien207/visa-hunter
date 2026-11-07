import type { Localized } from '../../i18n/localized'
import { formatMoney } from '../../i18n/format'
import { germanVars } from '../../game/systems/german'
import { CONFIG } from '../config'
import type { DialogueDef } from '../dialogueTypes'

/** Main-story characters in Vietnam: German class, visa advisor, xe ôm, embassy, airport. */

const L = (vi: string, en: string, de?: string): Localized => ({ vi, en, de })
const BYE = L('Dạ con chào thầy ạ.', 'Goodbye, teacher.', 'Auf Wiedersehen!')

export const STORY_DIALOGUES: Record<string, DialogueDef> = {
  thayMinh: {
    vars: germanVars,
    start: [{ if: { germanLevel: 3 }, node: 'graduated' }, { node: 'hello' }],
    nodes: {
      hello: {
        text: [
          L('Chào em! Lớp tiếng Đức của thầy đây. Mục tiêu tiếp theo: {target} ({xp}/{need} XP).', 'Hello! This is my German class. Next goal: {target} ({xp}/{need} XP).'),
          L('Guten Tag! Hôm nay học gì nào? Mục tiêu: {target}, em có {xp}/{need} XP rồi.', 'Guten Tag! What shall we learn today? Goal: {target}, you have {xp}/{need} XP.'),
        ],
        choices: [
          { text: L('Đăng ký khóa {target} ({courseFee})', 'Enrol in the {target} course ({courseFee})'), if: { test: 'german.notEnrolled' }, effect: { type: 'action', id: 'german.enroll' }, next: 'enrolled' },
          { text: L('Học một buổi (1 tiếng)', 'Take a lesson (1 hour)'), if: { test: 'german.enrolled' }, effect: { type: 'action', id: 'german.lesson' } },
          { text: L('Thi chứng chỉ {target} ({examFee})', 'Take the {target} exam ({examFee})'), if: { test: 'german.examReady' }, effect: { type: 'action', id: 'german.exam' } },
          { text: L('Thầy ơi, học tiếng Đức có khó không?', 'Is German hard, teacher?'), next: 'tips' },
          { text: BYE },
        ],
      },
      enrolled: {
        text: L('Tốt lắm! Mỗi buổi học là một trò chơi nhỏ: từ vựng, der/die/das, ghép câu. Đủ XP thì thi nha.', 'Great! Each lesson is a little game: vocabulary, der/die/das, sentences. Get enough XP, then take the exam.'),
        next: 'hello',
      },
      tips: {
        text: [
          L('Mẹo nè: danh từ giống cái hay có đuôi -ung, -heit, -keit: die Wohnung, die Freiheit.', 'Tip: feminine nouns often end in -ung, -heit, -keit: die Wohnung, die Freiheit.'),
          L('Ở Đức đúng giờ là số một. Trễ 5 phút là… thôi khỏi nói!', 'In Germany punctuality is everything. Five minutes late is… let’s not talk about it!'),
          L('Từ quan trọng nhất ở Đức là „Termin". Không có Termin thì không làm gì được hết!', 'The most important German word is “Termin”. Without one, nothing happens!'),
          L('Về nhà tự học cũng được, nhưng đi học với thầy thì nhanh hơn gấp đôi đó.', 'Self-study at home works too, but class is twice as fast.'),
          L('Das Mädchen là „das" đó em. Đừng hỏi thầy tại sao!', 'It’s “das Mädchen” (the girl). Don’t ask me why!'),
        ],
        next: 'hello',
      },
      graduated: {
        text: L('Em có B1 rồi! Thầy tự hào lắm. Giờ qua quán cà phê gặp chị Mai tư vấn làm hồ sơ nhé.', 'You have B1! I’m so proud. Now go see Mai at the café about your visa papers.'),
        choices: [{ text: L('Dạ con cảm ơn thầy!', 'Thank you, teacher!'), effect: { type: 'mood', amount: 5 } }],
      },
    },
  },

  chiMai: {
    vars: () => ({ ...germanVars() }),
    start: [
      { if: { not: { germanLevel: 3 } }, node: 'early' },
      { if: { noFlag: 'visa.path' }, node: 'choose' },
      { node: 'helping' },
    ],
    nodes: {
      early: {
        text: L('Chào em! Chị tư vấn du học Đức nè. Muốn đi Đức thì trước hết phải có tiếng Đức B1 nha. Em đang học tới đâu rồi?', 'Hi! I advise on studying in Germany. First you need German at B1. How far along are you?'),
        choices: [
          { text: L('Studium khác Ausbildung thế nào ạ?', 'How is Studium different from Ausbildung?'), next: 'explain' },
          { text: L('Dạ em đi học tiếp đây ạ.', 'I’ll keep studying.') },
        ],
      },
      explain: {
        text: L(
          'Studium là học đại học: cần chứng chỉ APS, thư mời nhập học và Sperrkonto nhiều tiền hơn. Ausbildung là học nghề có lương, như điều dưỡng: cần hợp đồng học nghề, chứng minh tài chính ít hơn.',
          'Studium is university: you need an APS certificate, an admission letter and more money in a blocked account. Ausbildung is paid vocational training, like nursing: you need a training contract and less proof of funds.',
        ),
        next: 'afterExplain',
      },
      afterExplain: {
        text: L('Cả hai đều cần hộ chiếu, giấy tờ dịch thuật công chứng, CV, thư động lực, bảo hiểm… và một cái Termin ở Đại sứ quán!', 'Both need a passport, translated and notarized papers, CV, motivation letter, insurance… and a Termin at the embassy!'),
        choices: [
          { text: L('Em chọn đường luôn!', 'Let me choose now!'), if: { all: [{ germanLevel: 3 }, { noFlag: 'visa.path' }] }, next: 'choose' },
          { text: L('Dạ em hiểu rồi.', 'Got it.') },
        ],
      },
      choose: {
        text: L('Em có B1 rồi, giỏi quá! Giờ chọn con đường nào nè?', 'You have B1, well done! Which path will you take?'),
        choices: [
          { text: L('Du học (Studium)', 'University (Studium)'), effect: { type: 'action', id: 'visa.choosePath', arg: 'studium' }, next: 'chosen' },
          { text: L('Học nghề điều dưỡng (Ausbildung)', 'Nursing training (Ausbildung)'), effect: { type: 'action', id: 'visa.choosePath', arg: 'ausbildung' }, next: 'chosen' },
          { text: L('Chị giải thích lại giúp em', 'Explain again, please'), next: 'explain' },
        ],
      },
      chosen: {
        text: L('Quyết định đúng đắn! Chị mở „Hồ sơ visa" cho em rồi — bấm vào cuốn hộ chiếu trên màn hình nhé. Đủ giấy tờ thì săn Termin!', 'Good choice! I opened your “Visa file” — tap the passport icon on screen. Once your papers are ready, hunt for a Termin!'),
        choices: [{ text: L('Mở hồ sơ visa', 'Open the visa file'), effect: { type: 'action', id: 'visa.openPanel' } }],
      },
      helping: {
        text: [
          L('Hồ sơ tới đâu rồi em? Thiếu gì chị chỉ cho.', 'How are your papers going? I can help.'),
          L('Nhớ nha: đi phỏng vấn mà thiếu một tờ giấy thôi là bị từ chối đó!', 'Remember: one missing paper at the interview and you’re rejected!'),
        ],
        choices: [
          { text: L('Mở hồ sơ visa', 'Open the visa file'), effect: { type: 'action', id: 'visa.openPanel' } },
          { text: L('Săn Termin ở Đại sứ quán', 'Hunt for an embassy Termin'), if: { test: 'visa.canHunt' }, effect: { type: 'action', id: 'visa.termin' } },
          { text: L('Mua vé máy bay', 'Buy a plane ticket'), if: { all: [{ test: 'visa.ready' }, { noFlag: 'visa.flight' }] }, cost: CONFIG.visa.flightCost, effect: { type: 'action', id: 'visa.buyFlight' } },
          { text: L('Mẹo phỏng vấn visa?', 'Interview tips?'), next: 'interviewTips' },
          { text: L('Dạ em cảm ơn chị.', 'Thanks!') },
        ],
      },
      interviewTips: {
        text: [
          L('Trả lời thật, ngắn gọn, bằng tiếng Đức càng tốt. Nói rõ em sẽ học gì, ở đâu, sống bằng tiền gì.', 'Answer honestly and briefly, in German if you can. Say what you’ll study, where, and how you’ll pay for it.'),
          L('Đừng nói đi Đức để du lịch hay chưa biết làm gì — họ không thích đâu!', 'Don’t say you’re going to sightsee or that you don’t know your plans!'),
        ],
        next: 'helping',
      },
    },
  },

  xeOm: {
    vars: () => ({ fare: formatMoney(CONFIG.visa.xeOmFare) }),
    start: 'hello',
    nodes: {
      hello: {
        text: [
          L('Đi đâu em? {fare} một chuyến, chạy lẹ như gió!', 'Where to? {fare} a ride, fast as the wind!'),
          L('Xe ôm đây! Đi đâu anh chở, đường nào anh cũng rành.', 'Motorbike taxi! I know every road in town.'),
        ],
        choices: [
          { text: L('Đại sứ quán Đức', 'German Embassy'), if: { flag: 'visa.path' }, cost: CONFIG.visa.xeOmFare, effect: { type: 'action', id: 'xeOm.embassy' } },
          { text: L('Sân bay Tân Sơn Nhất', 'Tân Sơn Nhất Airport'), if: { flag: 'visa.readyDay' }, cost: CONFIG.visa.xeOmFare, effect: { type: 'action', id: 'xeOm.airport' } },
          { text: L('Anh kể chuyện gì vui đi', 'Tell me something fun'), next: 'story' },
          { text: L('Dạ thôi anh.', 'Not now.') },
        ],
      },
      story: {
        text: [
          L('Hôm qua anh chở một ông Tây, ổng nói „Danke" hoài, anh tưởng ổng kêu „đắng"!', 'Yesterday a foreigner kept saying “Danke” — I thought he said “đắng” (bitter)!'),
          L('Kẹt xe giờ cao điểm thì anh đi đường hẻm, hẻm nào anh cũng thuộc.', 'At rush hour I take the alleys — I know them all.'),
          L('Em đi Đức nhớ gửi anh tấm hình tuyết nha, anh chưa thấy tuyết bao giờ.', 'Send me a photo of snow from Germany — I’ve never seen it.'),
        ],
        next: 'hello',
      },
    },
  },

  officer: {
    start: [{ if: { test: 'visa.terminToday' }, node: 'ready' }, { node: 'noTermin' }],
    nodes: {
      ready: {
        text: L('Guten Tag. Ihr Termin ist heute. Bitte setzen Sie sich. (Chào bạn, hôm nay là lịch hẹn của bạn. Mời ngồi.)', 'Guten Tag. Your appointment is today. Please take a seat.'),
        choices: [
          { text: L('Bắt đầu phỏng vấn', 'Start the interview'), effect: { type: 'action', id: 'visa.interview' } },
          { text: L('Chờ em chút ạ', 'One moment, please') },
        ],
      },
      noTermin: {
        text: [
          L('Ohne Termin geht hier gar nichts. (Không có lịch hẹn thì không làm gì được.)', 'Ohne Termin geht hier gar nichts. (Nothing happens without an appointment.)'),
          L('Ihr Visum wird bearbeitet. Bitte warten Sie. (Visa đang được xử lý, vui lòng chờ.)', 'Your visa is being processed. Please wait.'),
        ],
      },
    },
  },

  me: {
    start: 'hello',
    nodes: {
      hello: {
        text: L('Con đi mạnh giỏi nha. Nhớ ăn uống đầy đủ, mặc ấm, rảnh thì gọi video về cho mẹ.', 'Take care, my child. Eat well, dress warmly, and video-call me when you can.'),
        next: 'bag',
      },
      bag: {
        text: L('Mẹ có nhét mấy gói mì với chai nước mắm trong vali rồi đó. Bên đó chắc không có đâu!', 'I packed some instant noodles and a bottle of fish sauce in your suitcase. They surely don’t have that there!'),
        choices: [
          { text: L('Con thương mẹ!', 'I love you, Mum!'), effect: { type: 'mood', amount: 10 } },
          { text: L('Mẹ ơi, nước mắm bị cấm mang lên máy bay đó…', 'Mum, fish sauce isn’t allowed on the plane…'), next: 'fishSauce' },
        ],
      },
      fishSauce: {
        text: L('Kệ, mẹ gói kỹ lắm rồi! Đi đi con, đi bình an.', 'Never mind, I wrapped it very well! Go now, travel safely.'),
        choices: [{ text: L('Dạ, con đi đây!', 'Okay, I’m off!'), effect: { type: 'mood', amount: 10 } }],
      },
    },
  },

  chiHang: {
    start: 'hello',
    nodes: {
      hello: {
        text: L('Quần áo mới về nè em! Mặc vô là đẹp liền, đi Đức cũng sang.', 'New clothes just in! Look great — even in Germany.'),
        choices: [
          { text: L('Cho em xem đồ', 'Show me'), effect: { type: 'action', id: 'clothes.open', arg: 'vnClothes' } },
          { text: L('Dạ thôi chị.', 'No thanks.') },
        ],
      },
    },
  },

  chuSau: {
    start: 'hello',
    nodes: {
      hello: {
        text: L('Hớt tóc hông con? Chú hớt ở đây ba mươi năm rồi, đẹp như ca sĩ!', 'Haircut? I’ve cut hair on this corner for thirty years — you’ll look like a pop star!'),
        choices: [
          { text: L('Cho con xem kiểu tóc', 'Show me the styles'), effect: { type: 'action', id: 'clothes.open', arg: 'barber' } },
          { text: L('Dạ để bữa khác chú.', 'Another day.') },
        ],
      },
    },
  },
}
