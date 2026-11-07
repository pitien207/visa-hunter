import type { Localized } from '../../i18n/localized'
import type { DialogueDef } from '../dialogueTypes'

/** Everyday characters on the Vietnamese street. */

export const BYE: Localized = { vi: 'Dạ thôi, cháu đi đây ạ.', en: "I'm fine, thanks. Bye!", de: 'Danke, ich gehe schon.' }

export const STREET_DIALOGUES: Record<string, DialogueDef> = {
  baSau: {
    start: 'hello',
    nodes: {
      hello: {
        text: [
          { vi: 'Cháu ơi, ngồi làm cốc trà đá cho mát! Có 5 nghìn thôi.', en: 'Hey dear, have a glass of iced tea to cool off! Only 5,000.', de: 'Na, Kind, trink ein Glas Eistee zur Abkühlung! Nur 5.000.' },
          { vi: 'Nắng thế này mà không uống trà đá là say nắng đấy cháu.', en: "In this sun you'll faint without iced tea, dear.", de: 'Bei dieser Sonne fällst du ohne Eistee um, Kind.' },
        ],
        choices: [
          {
            text: { vi: 'Dạ cho cháu một cốc', en: 'One glass, please', de: 'Ein Glas, bitte' },
            effect: { type: 'sitAndConsume', itemId: 'traDa', seatId: 'traDa' },
          },
          { text: { vi: 'Bà kể cháu nghe chuyện phố mình đi', en: 'Tell me about the neighbourhood', de: 'Erzähl mir von der Nachbarschaft' }, next: 'gossip' },
          { text: BYE },
        ],
      },
      gossip: {
        text: [
          { vi: 'Ngày xưa phố này toàn nhà ống mái ngói, giờ nhà nào cũng mở quán cà phê.', en: 'This street used to be all tube houses with tiled roofs. Now every house has a café.', de: 'Früher standen hier nur Röhrenhäuser mit Ziegeldach. Jetzt hat jedes Haus ein Café.' },
          { vi: 'Thằng Tuấn đầu ngõ sang Đức học điều dưỡng, tháng nào cũng gửi tiền về cho mẹ nó đấy.', en: 'Tuấn from the alley trains as a nurse in Germany and sends his mum money every month.', de: 'Tuấn aus der Gasse lernt in Deutschland Pflege und schickt jeden Monat Geld nach Hause.' },
          { vi: 'Muốn đi Đức thì phải học tiếng Đức trước. Mà tiếng gì mà chữ dài dằng dặc!', en: 'To go to Germany you must learn German first. Such long words!', de: 'Für Deutschland musst du erst Deutsch lernen. So lange Wörter!' },
          { vi: 'Cháu chịu khó làm thêm ở quán cà phê kia đi, bà chủ dễ tính lắm.', en: 'Work some shifts at that café, dear. The owner is kind.', de: 'Arbeite ein paar Schichten im Café dort, die Chefin ist nett.' },
        ],
        choices: [
          { text: { vi: 'Hay quá! Kể nữa đi bà', en: 'Tell me more!', de: 'Erzähl mehr!' }, next: 'gossip' },
          { text: { vi: 'Dạ cháu cảm ơn bà', en: 'Thank you, granny', de: 'Danke, Oma' }, effect: { type: 'mood', amount: 3 } },
        ],
      },
    },
  },

  coBa: {
    start: 'hello',
    nodes: {
      hello: {
        text: { vi: 'Cháu mua gì? Mì tôm, bánh bao, nước mía… có đủ cả!', en: 'What do you need? Noodles, buns, sugarcane juice… I have it all!', de: 'Was brauchst du? Nudeln, Brötchen, Zuckerrohrsaft… alles da!' },
        choices: [
          { text: { vi: 'Cho cháu xem hàng', en: 'Let me see', de: 'Zeig mal' }, effect: { type: 'openShop', shopId: 'taphoa' } },
          { text: { vi: 'Cô ơi, đi Đức có khó không cô?', en: 'Auntie, is it hard to go to Germany?', de: 'Tante, ist es schwer, nach Deutschland zu gehen?' }, next: 'advice' },
          { text: BYE },
        ],
      },
      advice: {
        text: { vi: 'Khó chứ cháu! Phải học tiếng, làm hồ sơ, rồi còn chứng minh tài chính nữa.', en: 'Of course! You need the language, the paperwork, and proof of money too.', de: 'Natürlich! Sprache, Papierkram und dann noch ein Finanznachweis.' },
        next: 'advice2',
      },
      advice2: {
        text: { vi: 'Nhưng cháu chăm chỉ thì cái gì cũng được hết. Cố lên nhé!', en: 'But if you work hard, anything is possible. You can do it!', de: 'Aber wer fleißig ist, schafft alles. Du packst das!' },
        choices: [{ text: { vi: 'Dạ cháu cảm ơn cô!', en: 'Thank you, auntie!', de: 'Danke, Tante!' }, effect: { type: 'mood', amount: 5 } }],
      },
    },
  },

  chiLua: {
    start: 'hello',
    nodes: {
      hello: {
        text: [
          { vi: 'Hoa đây em ơi! Cúc họa mi mới về, 30 nghìn một bó, cắm bàn học là xinh lắm.', en: 'Flowers, dear! Fresh daisies, 30,000 a bunch — lovely on a study desk.', de: 'Blumen! Frische Gänseblümchen, 30.000 der Strauß — hübsch auf dem Schreibtisch.' },
          { vi: 'Xe hoa của chị đi khắp phố cổ đấy. Mua một bó cho vui cửa vui nhà đi em!', en: 'My flower bike rides all over the Old Quarter. Take a bunch home!', de: 'Mein Blumenrad fährt durch die ganze Altstadt. Nimm einen Strauß mit!' },
        ],
        choices: [
          { text: { vi: 'Cho em một bó', en: 'One bunch, please', de: 'Einen Strauß, bitte' }, effect: { type: 'buy', itemId: 'hoaCuc', use: true } },
          { text: { vi: 'Mùa này hoa gì đẹp hả chị?', en: 'Which flowers are in season?', de: 'Welche Blumen haben gerade Saison?' }, next: 'seasons' },
          { text: BYE },
        ],
      },
      seasons: {
        text: [
          { vi: 'Hà Nội mỗi mùa một loại hoa: tháng Năm hoa sen, mùa thu hoa sữa thơm nồng, đầu đông thì cúc họa mi trắng muốt.', en: 'Hanoi has a flower for every season: lotus in May, milk flowers in autumn, white daisies in early winter.', de: 'Hanoi hat für jede Jahreszeit eine Blume: Lotus im Mai, Milchblumen im Herbst, weiße Gänseblümchen im Frühwinter.' },
          { vi: 'Người Hà Nội chụp ảnh với xe hoa nhiều lắm. Em đứng vào chị chụp cho một kiểu không?', en: 'People love taking photos with the flower bike. Want one?', de: 'Alle machen Fotos mit dem Blumenrad. Willst du auch eins?' },
        ],
        next: 'hello',
      },
    },
  },

  chuBay: {
    start: 'hello',
    nodes: {
      hello: {
        text: [
          { vi: 'Bánh mì nóng giòn đây cháu! 15 nghìn một cái, pate chả đầy đủ.', en: 'Hot crispy bánh mì! 15,000 each, with pork and pâté.', de: 'Heißes Bánh mì! 15.000 das Stück, mit Fleisch und Pastete.' },
          { vi: 'Đói chưa cháu? Bánh mì chú ngon nhất phố đấy!', en: 'Hungry? My bánh mì is the best on the street!', de: 'Hunger? Mein Bánh mì ist das beste der Straße!' },
        ],
        choices: [
          { text: { vi: 'Cho cháu một cái ăn luôn', en: 'One to eat now', de: 'Eins zum Sofortessen' }, effect: { type: 'buy', itemId: 'banhMi', use: true }, next: 'enjoy' },
          { text: { vi: 'Gói cho cháu một cái mang về', en: 'One to take away', de: 'Eins zum Mitnehmen' }, effect: { type: 'buy', itemId: 'banhMi', use: false }, next: 'thanks' },
          { text: { vi: 'Dạ thôi chú', en: 'No thanks, uncle', de: 'Nein danke, Onkel' } },
        ],
      },
      enjoy: {
        text: { vi: 'Ăn cho chắc bụng rồi đi làm nhé!', en: 'Fill your belly, then off to work!', de: 'Iss dich satt, dann ab zur Arbeit!' },
      },
      thanks: {
        text: { vi: 'Đây cháu, còn nóng hổi đấy!', en: 'Here you go, still warm!', de: 'Bitte schön, noch warm!' },
      },
    },
  },
}
