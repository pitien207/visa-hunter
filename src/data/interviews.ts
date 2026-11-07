import type { Localized } from '../i18n/localized'

/**
 * Question-and-answer mini-games (embassy interview, WG casting, Anmeldung form).
 * Each answer scores 0 (bad), 1 (ok) or 2 (great); the reaction shows briefly.
 */

export interface QaAnswer {
  text: Localized
  score: 0 | 1 | 2
  reaction: Localized
}

export interface QaQuestion {
  q: Localized
  answers: QaAnswer[]
}

export interface QaSet {
  title: Localized
  /** NPC id whose portrait asks the questions. */
  asker: string
  questions: QaQuestion[]
}

const a = (score: 0 | 1 | 2, vi: string, en: string, rVi: string, rEn: string): QaAnswer => ({
  text: { vi, en },
  score,
  reaction: { vi: rVi, en: rEn },
})
const q = (vi: string, en: string, answers: QaAnswer[]): QaQuestion => ({ q: { vi, en }, answers })

const GOOD = ['Gut.', 'Good.'] as const
const OK = ['Hmm, verstehe.', 'Hmm, I see.'] as const
const BAD = ['Das ist nicht überzeugend…', 'That is not convincing…'] as const

const SHARED_EMBASSY: QaQuestion[] = [
  q('„Sprechen Sie Deutsch?"', '“Do you speak German?”', [
    a(2, 'Ja, ich habe das B1-Zertifikat.', 'Ja, ich habe das B1-Zertifikat.', 'Sehr schön! (Rất tốt!)', 'Sehr schön! (Very nice!)'),
    a(1, 'Ein bisschen…', 'Ein bisschen…', OK[0], OK[1]),
    a(0, 'Yes, I speak English!', 'Yes, I speak English!', 'Auf Deutsch, bitte. (Nói tiếng Đức nhé.)', 'Auf Deutsch, bitte. (In German, please.)'),
  ]),
  q('„Haben Sie Verwandte in Deutschland?"', '“Do you have relatives in Germany?”', [
    a(2, 'Nein, aber eine Freundin wohnt in Berlin.', 'Nein, aber eine Freundin wohnt in Berlin.', GOOD[0], GOOD[1]),
    a(1, 'Nein.', 'Nein.', OK[0], OK[1]),
    a(0, 'Có ạ, cả họ hàng bên đó luôn!', 'Yes, my whole family is there!', 'Wirklich? (Thật không?)', 'Really?'),
  ]),
]

export const QA_SETS = {
  embassyAusbildung: {
    title: { vi: 'Phỏng vấn visa học nghề', en: 'Vocational training visa interview', de: 'Visumsinterview Ausbildung' },
    asker: 'officer',
    questions: [
      q('„Warum möchten Sie nach Deutschland?"', '“Why do you want to go to Germany?”', [
        a(2, 'Ich möchte eine Ausbildung in der Pflege machen.', 'Ich möchte eine Ausbildung in der Pflege machen.', GOOD[0], GOOD[1]),
        a(1, 'Weil Deutschland schön ist.', 'Weil Deutschland schön ist.', OK[0], OK[1]),
        a(0, 'Để đi du lịch ạ!', 'To travel around!', 'Dafür gibt es ein Touristenvisum. (Cái đó là visa du lịch.)', 'That would be a tourist visa.'),
      ]),
      q('„Wo werden Sie Ihre Ausbildung machen?"', '“Where will you do your training?”', [
        a(2, 'Im Pflegeheim Sonnenhof. Hier ist mein Vertrag.', 'Im Pflegeheim Sonnenhof. Hier ist mein Vertrag.', GOOD[0], GOOD[1]),
        a(1, 'Ich weiß es noch nicht genau.', 'Ich weiß es noch nicht genau.', OK[0], OK[1]),
        a(0, 'Ở đâu cũng được ạ.', 'Anywhere is fine.', BAD[0], BAD[1]),
      ]),
      q('„Wie finanzieren Sie sich?"', '“How will you support yourself?”', [
        a(2, 'Mit meiner Ausbildungsvergütung und meinem Sperrkonto.', 'Mit meiner Ausbildungsvergütung und meinem Sperrkonto.', GOOD[0], GOOD[1]),
        a(1, 'Bố mẹ em sẽ gửi tiền ạ.', 'My parents will send money.', OK[0], OK[1]),
        a(0, 'Em chưa nghĩ tới chuyện đó.', 'I haven’t thought about it.', BAD[0], BAD[1]),
      ]),
      q('„Warum gerade die Pflege?"', '“Why nursing care in particular?”', [
        a(2, 'Ich helfe gern Menschen, besonders älteren Menschen.', 'Ich helfe gern Menschen, besonders älteren Menschen.', 'Das ist schön. (Thật đáng quý.)', 'That’s lovely.'),
        a(1, 'Vì nghe nói lương ổn ạ.', 'I heard the pay is okay.', OK[0], OK[1]),
        a(0, 'Mẹ em bắt em đi ạ.', 'My mum made me.', BAD[0], BAD[1]),
      ]),
      q('„Was machen Sie nach der Ausbildung?"', '“What will you do after the training?”', [
        a(2, 'Ich möchte als Pflegefachkraft arbeiten und mich weiterbilden.', 'Ich möchte als Pflegefachkraft arbeiten und mich weiterbilden.', GOOD[0], GOOD[1]),
        a(1, 'Về Việt Nam mở quán cà phê ạ.', 'Go home and open a café.', OK[0], OK[1]),
        a(0, 'Dạ chưa biết ạ.', 'No idea yet.', BAD[0], BAD[1]),
      ]),
      ...SHARED_EMBASSY,
    ],
  },
  embassyStudium: {
    title: { vi: 'Phỏng vấn visa du học', en: 'Student visa interview', de: 'Visumsinterview Studium' },
    asker: 'officer',
    questions: [
      q('„Warum möchten Sie in Deutschland studieren?"', '“Why do you want to study in Germany?”', [
        a(2, 'Die Universitäten sind sehr gut und das Studium ist praxisnah.', 'Die Universitäten sind sehr gut und das Studium ist praxisnah.', GOOD[0], GOOD[1]),
        a(1, 'Vì miễn học phí ạ.', 'Because it’s tuition-free.', OK[0], OK[1]),
        a(0, 'Để qua đó đi làm kiếm tiền ạ.', 'To work and earn money.', BAD[0], BAD[1]),
      ]),
      q('„Welches Fach möchten Sie studieren?"', '“Which subject will you study?”', [
        a(2, 'Informatik. Ich habe eine Zulassung der Universität.', 'Informatik. Ich habe eine Zulassung der Universität.', GOOD[0], GOOD[1]),
        a(1, 'Etwas mit Technik.', 'Etwas mit Technik.', OK[0], OK[1]),
        a(0, 'Ngành nào cũng được ạ.', 'Any subject is fine.', BAD[0], BAD[1]),
      ]),
      q('„Wie finanzieren Sie Ihr Studium?"', '“How will you finance your studies?”', [
        a(2, 'Ich habe ein Sperrkonto mit dem nötigen Betrag.', 'Ich habe ein Sperrkonto mit dem nötigen Betrag.', GOOD[0], GOOD[1]),
        a(1, 'Em sẽ đi làm thêm ạ.', 'I’ll get a side job.', OK[0], OK[1]),
        a(0, 'Dạ chưa tính ạ.', 'Haven’t planned that.', BAD[0], BAD[1]),
      ]),
      q('„Haben Sie das APS-Zertifikat?"', '“Do you have the APS certificate?”', [
        a(2, 'Ja, hier bitte.', 'Ja, hier bitte.', GOOD[0], GOOD[1]),
        a(1, 'Ich habe es beantragt.', 'Ich habe es beantragt.', OK[0], OK[1]),
        a(0, 'APS là gì vậy ạ?', 'What is APS?', BAD[0], BAD[1]),
      ]),
      q('„Was machen Sie nach dem Studium?"', '“What will you do after your studies?”', [
        a(2, 'Ich möchte Berufserfahrung sammeln und dann entscheiden.', 'Ich möchte Berufserfahrung sammeln und dann entscheiden.', GOOD[0], GOOD[1]),
        a(1, 'Về nước làm cho công ty Đức ạ.', 'Go home and work for a German company.', OK[0], OK[1]),
        a(0, 'Dạ chưa biết ạ.', 'No idea yet.', BAD[0], BAD[1]),
      ]),
      ...SHARED_EMBASSY,
    ],
  },
  wgCasting: {
    title: { vi: 'WG-Casting (phỏng vấn ở ghép)', en: 'WG casting (flat-share interview)', de: 'WG-Casting' },
    asker: 'lena',
    questions: [
      q('„Wie stellst du dir das WG-Leben vor?" (Bạn hình dung sống chung thế nào?)', '“How do you picture life in a WG?”', [
        a(2, 'Zusammen kochen, aber auch Ruhe respektieren.', 'Cook together, but respect quiet time too.', 'Perfekt!', 'Perfect!'),
        a(1, 'Party jeden Abend!', 'Party every night!', 'Haha… jeden Abend?', 'Haha… every night?'),
        a(0, 'Em ở trong phòng suốt, không nói chuyện với ai.', 'I’ll stay in my room and talk to no one.', 'Okay… schade.', 'Okay… too bad.'),
      ]),
      q('„Wir haben einen Putzplan. Findest du das gut?" (Lịch dọn dẹp?)', '“We have a cleaning rota. Okay with that?”', [
        a(2, 'Ja klar, Ordnung muss sein!', 'Of course, order is order!', 'Ein echter Deutscher!', 'A true German!'),
        a(1, 'Wenn es sein muss…', 'If I must…', 'Hmm.', 'Hmm.'),
        a(0, 'Em không thích dọn dẹp lắm.', 'I don’t really like cleaning.', 'Oh nein…', 'Oh no…'),
      ]),
      q('„Kochst du gern?"', '“Do you like cooking?”', [
        a(2, 'Ja! Ich koche euch mal Phở.', 'Yes! I’ll make you phở.', 'Phở! Wann?!', 'Phở! When?!'),
        a(1, 'Em chủ yếu ăn mì gói.', 'Mostly instant noodles.', 'Haha, kennen wir.', 'Haha, been there.'),
        a(0, 'Không, ngày nào em cũng gọi đồ ăn.', 'No, I order food every day.', 'Teuer…', 'Expensive…'),
      ]),
      q('„Was machst du in Deutschland?"', '“What are you doing in Germany?”', [
        a(2, 'Ich mache eine Ausbildung in der Pflege.', 'I’m training as a nurse.', 'Respekt!', 'Respect!'),
        a(1, 'Arbeiten und Deutsch lernen.', 'Working and learning German.', 'Cool.', 'Cool.'),
        a(0, 'Em cũng chưa biết nữa.', 'I don’t know yet.', 'Hmm…', 'Hmm…'),
      ]),
      q('„Welche Tonne ist für Plastik?" (Thùng rác nào cho nhựa?)', '“Which bin is for plastic?”', [
        a(2, 'Die gelbe Tonne!', 'The yellow bin!', 'Richtig!', 'Correct!'),
        a(1, 'Die blaue?', 'The blue one?', 'Fast. Blau ist Papier.', 'Close. Blue is paper.'),
        a(0, 'Bỏ chung hết một thùng ạ?', 'All in one bin?', 'NEIN!', 'NO!'),
      ]),
      q('„Wie oft hast du Besuch?"', '“How often do you have visitors?”', [
        a(2, 'Manchmal, und ich sage vorher Bescheid.', 'Sometimes, and I’ll tell you first.', 'Super.', 'Great.'),
        a(1, 'Fast nie.', 'Almost never.', 'Okay.', 'Okay.'),
        a(0, 'Mỗi ngày chục người ạ.', 'Ten people a day.', 'Bitte was?', 'Excuse me?'),
      ]),
    ],
  },
  anmeldung: {
    title: { vi: 'Tờ khai Anmeldung', en: 'The registration form', de: 'Anmeldeformular' },
    asker: 'clerk',
    questions: [
      q('„Familienname?" (Họ)', '“Surname?”', [
        a(2, 'Nguyễn', 'Nguyễn', 'Gut.', 'Good.'),
        a(1, 'Lan (đó là tên…)', 'Lan (that’s the first name…)', 'Das ist der Vorname. (Đó là tên.)', 'That’s the first name.'),
        a(0, 'Mẹ em ạ', 'My mum', 'Bitte?', 'Pardon?'),
      ]),
      q('„Geburtsort?" (Nơi sinh)', '“Place of birth?”', [
        a(2, 'Hà Nội, Vietnam', 'Hanoi, Vietnam', 'Gut.', 'Good.'),
        a(1, 'Bệnh viện ạ', 'A hospital', 'Welche Stadt? (Thành phố nào?)', 'Which city?'),
        a(0, 'Weiß ich nicht', 'I don’t know', 'Hmm.', 'Hmm.'),
      ]),
      q('„Einzugsdatum?" (Ngày dọn vào)', '“Move-in date?”', [
        a(2, 'Am Ersten dieses Monats.', 'On the first of this month.', 'Gut.', 'Good.'),
        a(1, 'Morgen vielleicht?', 'Maybe tomorrow?', 'Vielleicht? (Có lẽ?)', 'Maybe?'),
        a(0, 'Gestern? Oder heute?', 'Yesterday? Or today?', 'Na toll.', 'Great.'),
      ]),
      q('„Wohnungsgeberbestätigung?" (Giấy xác nhận của chủ nhà)', '“Landlord confirmation?”', [
        a(2, 'Hier, unterschrieben.', 'Here, signed.', 'Sehr gut!', 'Very good!'),
        a(1, 'Ich bringe sie später.', 'I’ll bring it later.', 'Ohne geht es nicht…', 'Can’t do it without…'),
        a(0, 'Was ist das?', 'What’s that?', 'Seufz. (Thở dài.)', 'Sigh.'),
      ]),
      q('„Religionszugehörigkeit?" (Tôn giáo — để tính thuế nhà thờ)', '“Religion? (for church tax)”', [
        a(2, 'Keine.', 'None.', 'Gut.', 'Good.'),
        a(2, 'Phật giáo.', 'Buddhist.', 'In Ordnung.', 'All right.'),
        a(1, 'Kirchensteuer?!', 'Church tax?!', 'Ja, die gibt es.', 'Yes, that exists.'),
      ]),
    ],
  },
} satisfies Record<string, QaSet>

export type QaSetId = keyof typeof QA_SETS
