import type { Localized } from '../../i18n/localized'
import type { DialogueDef } from '../dialogueTypes'

/** Everyday characters on the Vietnamese street. */

export const BYE: Localized = { vi: 'Dạ thôi, con đi đây ạ.', en: "I'm fine, thanks. Bye!", de: 'Danke, ich gehe schon.' }

export const STREET_DIALOGUES: Record<string, DialogueDef> = {
  baSau: {
    start: 'hello',
    nodes: {
      hello: {
        text: [
          { vi: 'Ủa con, ghé uống ly trà đá cho mát nè! Có 5 nghìn à.', en: 'Hey dear, have a glass of iced tea to cool off! Only 5,000.', de: 'Na, Kind, trink ein Glas Eistee zur Abkühlung! Nur 5.000.' },
          { vi: 'Nắng vầy mà không uống trà đá là xỉu đó con.', en: "In this sun you'll faint without iced tea, dear.", de: 'Bei dieser Sonne fällst du ohne Eistee um, Kind.' },
        ],
        choices: [
          {
            text: { vi: 'Dạ cho con một ly', en: 'One glass, please', de: 'Ein Glas, bitte' },
            effect: { type: 'sitAndConsume', itemId: 'traDa', seatId: 'traDa' },
          },
          { text: { vi: 'Bà kể con nghe chuyện xóm mình đi', en: 'Tell me about the neighbourhood', de: 'Erzähl mir von der Nachbarschaft' }, next: 'gossip' },
          { text: BYE },
        ],
      },
      gossip: {
        text: [
          { vi: 'Hồi xưa xóm này toàn ruộng, giờ toàn quán cà phê không à.', en: 'This was all rice fields once. Now it’s all coffee shops.', de: 'Früher waren hier Reisfelder. Jetzt nur noch Cafés.' },
          { vi: 'Thằng Tuấn đầu hẻm qua Đức học điều dưỡng, tháng nào cũng gửi tiền về cho má nó đó.', en: 'Tuấn from the alley trains as a nurse in Germany and sends his mum money every month.', de: 'Tuấn aus der Gasse lernt in Deutschland Pflege und schickt jeden Monat Geld nach Hause.' },
          { vi: 'Muốn đi Đức thì phải học tiếng Đức trước. Mà tiếng gì đâu chữ dài thòng!', en: 'To go to Germany you must learn German first. Such long words!', de: 'Für Deutschland musst du erst Deutsch lernen. So lange Wörter!' },
          { vi: 'Con chịu khó làm thêm ở quán cà phê kia đi, chủ quán dễ lắm.', en: 'Work some shifts at that café, dear. The owner is kind.', de: 'Arbeite ein paar Schichten im Café dort, die Chefin ist nett.' },
        ],
        choices: [
          { text: { vi: 'Hay quá! Kể nữa đi bà', en: 'Tell me more!', de: 'Erzähl mehr!' }, next: 'gossip' },
          { text: { vi: 'Dạ con cảm ơn bà', en: 'Thank you, granny', de: 'Danke, Oma' }, effect: { type: 'mood', amount: 3 } },
        ],
      },
    },
  },

  coBa: {
    start: 'hello',
    nodes: {
      hello: {
        text: { vi: 'Con mua gì? Mì gói, bánh bao, nước mía… có đủ hết!', en: 'What do you need? Noodles, buns, sugarcane juice… I have it all!', de: 'Was brauchst du? Nudeln, Brötchen, Zuckerrohrsaft… alles da!' },
        choices: [
          { text: { vi: 'Cho con xem hàng', en: 'Let me see', de: 'Zeig mal' }, effect: { type: 'openShop', shopId: 'taphoa' } },
          { text: { vi: 'Cô ơi, đi Đức có khó không cô?', en: 'Auntie, is it hard to go to Germany?', de: 'Tante, ist es schwer, nach Deutschland zu gehen?' }, next: 'advice' },
          { text: BYE },
        ],
      },
      advice: {
        text: { vi: 'Khó chứ con! Phải học tiếng, làm hồ sơ, rồi còn chứng minh tài chính nữa.', en: 'Of course! You need the language, the paperwork, and proof of money too.', de: 'Natürlich! Sprache, Papierkram und dann noch ein Finanznachweis.' },
        next: 'advice2',
      },
      advice2: {
        text: { vi: 'Nhưng con siêng năng thì cái gì cũng được hết. Cố lên nha!', en: 'But if you work hard, anything is possible. You can do it!', de: 'Aber wer fleißig ist, schafft alles. Du packst das!' },
        choices: [{ text: { vi: 'Dạ con cảm ơn cô!', en: 'Thank you, auntie!', de: 'Danke, Tante!' }, effect: { type: 'mood', amount: 5 } }],
      },
    },
  },

  chuBay: {
    start: 'hello',
    nodes: {
      hello: {
        text: [
          { vi: 'Bánh mì nóng giòn đây con! 15 nghìn một ổ, thịt pate đầy đủ.', en: 'Hot crispy bánh mì! 15,000 each, with pork and pâté.', de: 'Heißes Bánh mì! 15.000 das Stück, mit Fleisch und Pastete.' },
          { vi: 'Đói bụng hông con? Bánh mì chú ngon nhất xóm đó!', en: 'Hungry? My bánh mì is the best on the street!', de: 'Hunger? Mein Bánh mì ist das beste der Straße!' },
        ],
        choices: [
          { text: { vi: 'Cho con một ổ ăn liền', en: 'One to eat now', de: 'Eins zum Sofortessen' }, effect: { type: 'buy', itemId: 'banhMi', use: true }, next: 'enjoy' },
          { text: { vi: 'Gói con một ổ mang về', en: 'One to take away', de: 'Eins zum Mitnehmen' }, effect: { type: 'buy', itemId: 'banhMi', use: false }, next: 'thanks' },
          { text: { vi: 'Dạ thôi chú', en: 'No thanks, uncle', de: 'Nein danke, Onkel' } },
        ],
      },
      enjoy: {
        text: { vi: 'Ăn cho chắc bụng rồi đi làm nha!', en: 'Fill your belly, then off to work!', de: 'Iss dich satt, dann ab zur Arbeit!' },
      },
      thanks: {
        text: { vi: 'Nè con, còn nóng hổi đó!', en: 'Here you go, still warm!', de: 'Bitte schön, noch warm!' },
      },
    },
  },
}
