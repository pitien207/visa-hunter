import type { Localized } from '../i18n/localized'

/**
 * Ambient speech bubbles. Conversations play line by line between NPCs of a group;
 * solo lines pop up now and then over one NPC. Add lines freely.
 */

export interface ChatLine {
  /** NPC id (or a generated id like "bike-0"). */
  speaker: string
  text: Localized
}

export const CONVERSATIONS: Record<string, ChatLine[][]> = {
  traDa: [
    [
      { speaker: 'chuNam', text: { vi: 'Trời nóng như đổ lửa!', en: "It's hot as fire today!", de: 'Heiß wie Feuer heute!' } },
      { speaker: 'anhHai', text: { vi: 'Làm cốc trà đá cho mát bác ơi.', en: 'Have some iced tea to cool down, uncle.', de: 'Trink Eistee zum Abkühlen, Onkel.' } },
    ],
    [
      { speaker: 'anhHai', text: { vi: 'Nghe nói thằng Tuấn đầu ngõ đi Đức rồi đấy.', en: 'Heard Tuấn from up the alley went to Germany.', de: 'Tuấn aus der Gasse ist nach Deutschland gegangen.' } },
      { speaker: 'chuNam', text: { vi: 'Ừ, sang bên ấy học điều dưỡng.', en: 'Yeah, training to be a nurse over there.', de: 'Ja, er macht dort eine Pflegeausbildung.' } },
      { speaker: 'baSau', text: { vi: 'Giỏi thế cơ à!', en: 'What a clever boy!', de: 'Was für ein kluger Junge!' } },
    ],
    [
      { speaker: 'chuNam', text: { vi: 'Giá xăng lại lên nữa rồi…', en: 'Petrol went up again…', de: 'Benzin ist wieder teurer…' } },
      { speaker: 'anhHai', text: { vi: 'Thôi đạp xe cho khỏe bác ạ!', en: 'Just ride a bicycle, uncle, it’s healthier!', de: 'Fahr doch Fahrrad, Onkel, das ist gesünder!' } },
    ],
    [
      { speaker: 'anhHai', text: { vi: 'Tối nay xem bóng đá không bác?', en: 'Watching football tonight, uncle?', de: 'Schaust du heute Abend Fußball, Onkel?' } },
      { speaker: 'chuNam', text: { vi: 'Xem chứ! Việt Nam vô địch!', en: 'Of course! Go Vietnam!', de: 'Na klar! Vietnam vor!' } },
    ],
    [
      { speaker: 'baSau', text: { vi: 'Thêm đá không các cháu?', en: 'More ice, you two?', de: 'Noch Eis, ihr zwei?' } },
      { speaker: 'anhHai', text: { vi: 'Dạ cho cháu thêm cốc nữa!', en: 'Yes please, another glass!', de: 'Ja bitte, noch ein Glas!' } },
    ],
    [
      { speaker: 'chuNam', text: { vi: 'Bên Đức người ta uống bia như mình uống trà đá ấy.', en: 'In Germany they drink beer like we drink iced tea.', de: 'In Deutschland trinkt man Bier wie wir Eistee.' } },
      { speaker: 'anhHai', text: { vi: 'Thật không bác?', en: 'Really, uncle?', de: 'Echt jetzt, Onkel?' } },
      { speaker: 'chuNam', text: { vi: 'Thật! Mà phải trả lại vỏ chai nữa, gọi là Pfand.', en: 'Really! And you return the bottles — it’s called Pfand.', de: 'Echt! Und die Flaschen gibt man zurück — Pfand.' } },
    ],
    [
      { speaker: 'anhHai', text: { vi: 'Bác biết "Termin" là gì không?', en: 'Uncle, do you know what a "Termin" is?', de: 'Onkel, weißt du, was ein "Termin" ist?' } },
      { speaker: 'chuNam', text: { vi: 'Không biết, nghe như tên món ăn.', en: 'No idea, sounds like a dish.', de: 'Keine Ahnung, klingt wie ein Gericht.' } },
      { speaker: 'anhHai', text: { vi: 'Là lịch hẹn đấy! Bên Đức đi đâu cũng cần Termin.', en: 'It’s an appointment! In Germany you need one for everything.', de: 'Ein Termin! In Deutschland braucht man für alles einen.' } },
    ],
  ],
}

export const SOLO_LINES: Record<string, Localized[]> = {
  chuBay: [
    { vi: 'Bánh mì nóng giòn đây!', en: 'Hot crispy bánh mì!', de: 'Heißes, knuspriges Bánh mì!' },
    { vi: 'Ai bánh mì pate không?', en: 'Who wants a pork bánh mì?', de: 'Wer will ein Bánh mì mit Fleisch?' },
    { vi: 'Bánh mì đây, bánh mì đây!', en: 'Bánh mì here, bánh mì here!', de: 'Bánh mì hier, Bánh mì hier!' },
  ],
  coBa: [
    { vi: 'Mua gì không cháu?', en: 'Buying anything, dear?', de: 'Möchtest du etwas kaufen?' },
    { vi: 'Nóng quá, phe phẩy cái quạt…', en: 'So hot… fan, fan, fan…', de: 'So heiß… fächeln, fächeln…' },
    { vi: 'Nước mía mát lạnh đây!', en: 'Fresh sugarcane juice just in!', de: 'Frischer Zuckerrohrsaft!' },
  ],
  coHoa: [
    { vi: 'Đi chợ thôi…', en: 'Off to the market…', de: 'Ab zum Markt…' },
    { vi: 'Nắng quá đi mất!', en: 'So sunny!', de: 'So sonnig!' },
  ],
  anhKhoa: [
    { vi: 'Guten Morgen! Ơ, nói thế có đúng không nhỉ?', en: 'Guten Morgen! Did I say that right?', de: 'Guten Morgen! Hab ich das richtig gesagt?' },
    { vi: 'Der, die, das… sao khó thế không biết!', en: 'Der, die, das… why is it so hard!', de: 'Der, die, das… warum so schwer!' },
  ],
  chiLan: [
    { vi: 'Hôm nay quán cà phê đông thế.', en: 'The café is so busy today.', de: 'Das Café ist heute so voll.' },
    { vi: 'Tắc đường kinh khủng!', en: 'Traffic is crazy!', de: 'Der Verkehr ist verrückt!' },
  ],
  kids: [
    { vi: 'Của mày này!', en: 'Your turn!', de: 'Du bist dran!' },
    { vi: 'Hụt rồi, haha!', en: 'Missed it, haha!', de: 'Daneben, haha!' },
    { vi: 'Đá cao lên xem nào!', en: 'Kick it higher!', de: 'Höher schießen!' },
    { vi: 'Tới tao!', en: 'My turn!', de: 'Ich bin dran!' },
  ],
  biker: [
    { vi: 'Bíp bíp!', en: 'Beep beep!', de: 'Tüt tüt!' },
    { vi: 'Bíp! Cẩn thận nhé!', en: 'Beep! Watch out!', de: 'Tüt! Pass auf!' },
  ],
  yield: [
    { vi: 'Cho đi nhờ tí nhé!', en: 'Excuse me!', de: 'Entschuldigung!' },
    { vi: 'Ơ, xin lỗi nhé!', en: 'Oops, sorry!', de: 'Ups, Verzeihung!' },
  ],

  // --- Germany ---
  yieldDe: [
    { vi: 'Entschuldigung! (Xin lỗi!)', en: 'Entschuldigung! (Excuse me!)', de: 'Entschuldigung!' },
    { vi: 'Darf ich mal? (Cho tôi qua nhé?)', en: 'Darf ich mal? (May I pass?)', de: 'Darf ich mal?' },
  ],
  herrMueller: [
    { vi: 'Ruhe bitte! Mittagsruhe! (Giữ trật tự! Giờ nghỉ trưa!)', en: 'Quiet please! It’s Mittagsruhe (quiet hours)!', de: 'Ruhe bitte! Mittagsruhe!' },
    { vi: 'Früher war alles besser… (Ngày xưa cái gì cũng tốt hơn…)', en: 'Früher war alles besser… (Everything was better in the old days…)', de: 'Früher war alles besser…' },
    { vi: 'Der Müll gehört in die gelbe Tonne! (Rác nhựa bỏ thùng vàng!)', en: 'That goes in the yellow bin!', de: 'Der Müll gehört in die gelbe Tonne!' },
  ],
  sophie: [
    { vi: 'Moin! (Chào!)', en: 'Moin! (Hi!)', de: 'Moin!' },
    { vi: 'Hast du einen Termin? Ich warte seit drei Wochen…', en: 'Got a Termin? I’ve been waiting three weeks…', de: 'Hast du einen Termin? Ich warte seit drei Wochen…' },
    { vi: 'Schon wieder Regen… (Lại mưa nữa…)', en: 'Schon wieder Regen… (Rain again…)', de: 'Schon wieder Regen…' },
  ],
  anhKhoaDe: [
    { vi: 'Bên Đức lạnh quá, nhớ cốc trà đá bà Thu thế!', en: 'Germany is so cold — I miss Granny Thu’s iced tea!', de: 'Deutschland ist kalt — ich vermisse Eistee!' },
    { vi: 'Người Việt mình ở đây cũng đông lắm đấy!', en: 'Lots of Vietnamese people live here too!', de: 'Hier leben viele Vietnamesen!' },
  ],
  tom: [
    { vi: 'Alles für ’nen Euro! (Mọi thứ một euro!)', en: 'Everything for one euro!', de: 'Alles für ’nen Euro!' },
    { vi: 'Flohmarkt! Schnäppchen! (Chợ đồ cũ! Giá hời!)', en: 'Flea market! Bargains!', de: 'Flohmarkt! Schnäppchen!' },
  ],
  wagner: [{ vi: 'Girokonto gefällig? (Mở tài khoản không?)', en: 'Fancy a current account?', de: 'Girokonto gefällig?' }],
  cyclist: [
    { vi: 'Klingeling! Radweg! (Đường xe đạp đó!)', en: 'Ring ring! Bike lane!', de: 'Klingeling! Radweg!' },
    { vi: 'Achtung! (Cẩn thận!)', en: 'Watch out!', de: 'Achtung!' },
  ],
  driver: [
    { vi: 'Hup hup! 🚗', en: 'Honk honk! 🚗', de: 'Hup hup! 🚗' },
    { vi: 'Bitte nicht auf der Straße stehen! (Đừng đứng giữa đường!)', en: 'Please don’t stand in the road!', de: 'Bitte nicht auf der Straße stehen!' },
  ],
}
