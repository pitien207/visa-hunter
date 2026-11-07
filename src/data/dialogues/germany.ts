import type { Localized } from '../../i18n/localized'
import { CONFIG } from '../config'
import type { DialogueDef } from '../dialogueTypes'

/** Characters in Germany: WG flatmates, Bürgeramt, bank, care home. */

const L = (vi: string, en: string, de?: string): Localized => ({ vi, en, de })
const OK = L('Okay, tschüss!', 'Okay, bye!', 'Okay, tschüss!')

export const GERMANY_DIALOGUES: Record<string, DialogueDef> = {
  lena: {
    vars: () => ({ rent: `${CONFIG.germany.rentPerWeek} €` }),
    start: [{ if: { noFlag: 'de.wg' }, node: 'casting' }, { node: 'home' }],
    nodes: {
      casting: {
        text: L(
          'Hi! Du bist wegen dem Zimmer hier, oder? (Bạn đến xem phòng hả?) Phòng {rent}/tuần. Mình nói chuyện chút nhé — WG-Casting!',
          'Hi! You’re here about the room, right? It’s {rent}/week. Let’s chat a bit — WG casting!',
        ),
        choices: [
          { text: L('Bắt đầu WG-Casting', 'Start the WG casting'), effect: { type: 'action', id: 'de.wgCasting' } },
          { text: L('WG là gì vậy?', 'What’s a WG?'), next: 'whatIsWg' },
          { text: L('Để lúc khác nhé.', 'Maybe later.') },
        ],
      },
      whatIsWg: {
        text: L(
          'Wohngemeinschaft — mấy người ở chung một căn hộ, mỗi người một phòng, dùng chung bếp. Ở Đức sinh viên với Azubi hay ở vậy lắm!',
          'Wohngemeinschaft — people sharing a flat, each with their own room and a shared kitchen. Very common for students and trainees!',
        ),
        next: 'casting',
      },
      home: {
        text: [
          L('Na, wie war dein Tag? (Hôm nay của bạn sao rồi?)', 'Na, how was your day?'),
          L('Nhớ lịch dọn dẹp nhé, tuần này tới lượt bạn lau nhà tắm đó! 😄', 'Remember the cleaning rota — it’s your turn for the bathroom this week! 😄'),
          L('Bạn nấu Phở hôm nào vậy? Jonas hỏi mỗi ngày luôn.', 'When are you making phở? Jonas asks every day.'),
        ],
        choices: [
          { text: L('Mệt nhưng vui!', 'Tired but happy!'), effect: { type: 'mood', amount: 4 } },
          { text: L('Mình nhớ nhà quá…', 'I miss home…'), next: 'homesick' },
        ],
      },
      homesick: {
        text: L('Ach, Heimweh… (À, nhớ nhà…) Lại đây, ăn Kuchen với bọn mình này. Bạn không một mình đâu!', 'Ach, Heimweh… Come have some cake with us. You’re not alone!'),
        choices: [{ text: L('Danke, Lena!', 'Danke, Lena!'), effect: { type: 'mood', amount: 10 } }],
      },
    },
  },

  jonas: {
    vars: () => ({ fine: `${CONFIG.germany.fareDodgeFine} €` }),
    start: 'hello',
    nodes: {
      hello: {
        text: [
          L('Moin! Mẹo đây: Chủ Nhật siêu thị đóng cửa hết, nhớ mua đồ từ thứ Bảy!', 'Moin! Tip: supermarkets close on Sunday — shop on Saturday!'),
          L('Chai lọ có chữ „Pfand" đừng vứt — mang ra máy ở siêu thị đổi được 25 cent!', 'Bottles marked “Pfand” — don’t throw them away! The machine at the supermarket pays 25 cents each.'),
          L('Tàu điện lại trễ… Deutsche Bahn, du bist so zuverlässig — zuverlässig zu spät! 😂', 'Train’s late again… reliably late! 😂'),
          L('Anmeldung trước rồi mới mở tài khoản ngân hàng được. Bürokratie, ja!', 'You need the Anmeldung before a bank account. Bürokratie, ja!'),
          L('Đi tàu nhớ mua vé ở máy nhé. Bị kiểm tra là phạt {fine}!', 'Buy a ticket at the machine before riding — fare dodging costs a fine!'),
        ],
        choices: [{ text: OK }],
      },
    },
  },

  clerk: {
    start: [
      { if: { flag: 'de.anmeldung' }, node: 'done' },
      { if: { test: 'de.numberCalled' }, node: 'called' },
      { node: 'hello' },
    ],
    nodes: {
      hello: {
        text: [
          L('Haben Sie einen Termin? (Bạn có lịch hẹn không?) Không có Termin thì lấy số cũng không được đâu.', 'Do you have an appointment? Without one you can’t even take a number.'),
          L('Nummer ziehen, warten, aufgerufen werden. (Lấy số, chờ, đợi gọi tên.) So einfach ist das.', 'Take a number, wait, get called. It’s that simple.'),
        ],
        choices: [
          { text: L('Đặt Termin online (săn lịch)', 'Book a Termin online'), effect: { type: 'action', id: 'de.buergeramtTermin' } },
          { text: L('Lấy số chờ', 'Take a waiting number'), if: { test: 'de.canTakeNumber' }, effect: { type: 'action', id: 'de.takeNumber' } },
          { text: OK },
        ],
      },
      called: {
        text: L('Nummer aufgerufen! Anmeldung, ja? Füllen Sie bitte das Formular aus. (Mời điền tờ khai.)', 'Your number! Registration, right? Please fill in the form.'),
        choices: [
          { text: L('Điền tờ khai Anmeldung', 'Fill in the registration form'), effect: { type: 'action', id: 'de.anmeldung' } },
          { text: L('Chờ chút ạ', 'One moment') },
        ],
      },
      done: {
        text: L('Sie sind angemeldet. Hier ist Ihre Meldebescheinigung. (Bạn đã đăng ký cư trú. Đây là giấy xác nhận.) Schönen Tag noch!', 'You’re registered. Here’s your certificate. Have a nice day!'),
      },
    },
  },

  wagner: {
    start: [{ if: { flag: 'de.bank' }, node: 'customer' }, { node: 'hello' }],
    nodes: {
      hello: {
        text: L('Willkommen bei der Sparbank! Möchten Sie ein Girokonto eröffnen? (Bạn muốn mở tài khoản không?)', 'Welcome to Sparbank! Would you like to open a current account?'),
        choices: [
          { text: L('Mở tài khoản', 'Open an account'), effect: { type: 'action', id: 'de.openBank' } },
          { text: L('Cần giấy tờ gì ạ?', 'What do I need?'), next: 'needs' },
          { text: OK },
        ],
      },
      needs: {
        text: L('Reisepass und Meldebescheinigung. (Hộ chiếu và giấy Anmeldung.) Ohne Anmeldung kein Konto!', 'Passport and registration certificate. No Anmeldung, no account!'),
        next: 'hello',
      },
      customer: {
        text: L('Ihre Karte kommt per Post, die PIN separat. (Thẻ gửi qua bưu điện, mã PIN gửi riêng.) Typisch deutsch!', 'Your card comes by post, the PIN separately. Typically German!'),
      },
    },
  },

  anna: {
    vars: () => ({ from: CONFIG.care.startHours[0], to: CONFIG.care.startHours[1] }),
    start: [{ if: { not: { test: 'de.paperworkDone' } }, node: 'paperwork' }, { node: 'hello' }],
    nodes: {
      paperwork: {
        text: L(
          'Herzlich willkommen im Sonnenhof! Trước khi bắt đầu, em cần: Anmeldung, tài khoản ngân hàng (để nhận lương) và bảo hiểm y tế nhé.',
          'Welcome to Sonnenhof! Before you start you need: the Anmeldung, a bank account (for your pay) and health insurance.',
        ),
        choices: [
          { text: L('Học lý thuyết (Berufsschule)', 'Study theory (Berufsschule)'), effect: { type: 'action', id: 'care.berufsschule' } },
          { text: L('Dạ em đi làm giấy tờ đây.', 'I’ll get the paperwork done.') },
        ],
      },
      hello: {
        text: [
          L('Guten Morgen! Ca làm bắt đầu từ {from}:00 đến {to}:00. Sẵn sàng chưa?', 'Good morning! Shifts start between {from}:00 and {to}:00. Ready?'),
          L('Các cụ chờ em đó! Nhìn biểu tượng trên đầu mỗi người để biết họ cần gì nhé.', 'The residents are waiting! Look at the icon above each person to see what they need.'),
        ],
        choices: [
          { text: L('Bắt đầu ca làm', 'Start the shift'), effect: { type: 'action', id: 'care.startShift' } },
          { text: L('Học lý thuyết (Berufsschule)', 'Study theory (Berufsschule)'), effect: { type: 'action', id: 'care.berufsschule' } },
          { text: L('Chị hướng dẫn lại giúp em', 'Explain again, please'), next: 'howto' },
          { text: L('Lát nữa ạ.', 'Later.') },
        ],
      },
      howto: {
        text: L(
          'Đi tới gần cụ nào cần giúp. 🍲 = đút ăn, 🧻 = lau miệng, 💬 = trò chuyện, 🤗 = dỗ dành, ♿ = đẩy xe lăn. Chọn đúng thì cụ vui, sai thì cụ giận đó!',
          'Walk up to a resident who needs help. 🍲 = feed, 🧻 = wipe mouth, 💬 = chat, 🤗 = comfort, ♿ = push wheelchair. Pick right and they’re happy!',
        ),
        next: 'hello',
      },
    },
  },
}
