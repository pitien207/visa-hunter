# Changelog

## M4–M10 — German, visa, Germany, care work, Pfand & clothes, polish, PWA, deploy setup (1.0.0)

The whole story is now playable: Saigon street → German course A1–B1 → visa → flight → WG and
Bürgeramt in Germany → nursing shifts at a care home.

### Added — M4: Learning German (plan §6 chapter 1)
- **Thầy Minh's class** in the alley (whiteboard, desks, classmate Vy): enrol per level
  (A1 300.000 ₫, A2 400.000 ₫, B1 500.000 ₫), take 1-hour lessons, then the certificate exam
  (100k / 150k / 200k ₫). Self-study at home ("Tự học" at the door): free, half the XP.
- **Mini-games** (`src/game/minigames/`): vocabulary quiz (timed, 4 choices), der/die/das (article
  colours), sentence builder (tap words in order), 3-part exam (pass ≥ 70 %). Lessons rotate between
  them. Words and sentences are data (`data/vocab.ts`, incl. care vocabulary for Germany).
- XP bar toward the next exam; passing raises the level shown in the bag ("Tiếng Đức").

### Added — M5: The visa chapter (plan §6 chapter 2)
- **Chị Mai** (advisor at the café terrace) explains **Studium vs Ausbildung**; choose a path once you have B1.
- **Visa file** (passport button in the HUD): a checklist of 10 documents per path — passport, biometric photos,
  translated diploma and birth certificate, B1 certificate (automatic), CV, motivation letter, insurance,
  proof of funds (blocked account: 3M ₫ Studium / 1.5M ₫ Ausbildung, paid out in Germany), plus APS + admission
  (Studium) or a training contract (Ausbildung). Some take days to process.
- **Termin hunt** mini-game: refresh a booking calendar and grab a free slot before someone else does.
- **Embassy** scene (ride with Anh Tư the xe ôm driver, 30.000 ₫, open 8–17 h): visa officer interview
  as a question-and-answer game. Pass → visa ready 2 days later; fail or missing documents → try again tomorrow.
- **Airport**: buy the ticket (1.5M ₫), say goodbye to Mẹ, Bố and your little sister, board the plane.
  Your money is exchanged to euros (3.000 ₫ = 1 €) and you wake up in Germany the next morning.

### Added — M6: Arriving in Germany (plan §6 chapter 3)
- **Lindenstraße**: Altbau houses, Bürgeramt, supermarket, bakery, Döner stand, Sparbank, tram stop with a
  ticket machine, recycling bins, linden trees, cars and cyclists, a flea market; German chatter.
- **WG-Casting** with Lena and Jonas (Q&A game) → your own room (95 €/week, charged every Monday; hostel 25 €/night until then).
  Laptop in your room: health insurance sign-up, video call home (big mood boost, once a day).
- **Bürgeramt**: "Ohne Termin geht nichts" — book a Termin (hunt again), come back that day, take a number,
  wait, fill in the Anmeldung (Q&A). Then open a bank account with Herr Wagner. Office hours Mon–Fri 8–16.
- **Tram** (weekly ticket 15 €; ride without one and an inspector may fine you 60 €).
- German shops (EUR): Brötchen, Brezel, Döner, Schorle, Kaffee, Pizza, Kuchen, Asia-Nudeln. Supermarket closed on Sundays.

### Added — M7: Care home workday (plan §6 chapter 4)
- **Pflegeheim Sonnenhof** (by tram): 4 residents with need bubbles and a patience ring — feed, clean, chat,
  comfort, push the wheelchair. 2-minute shift (= 8 h), pay 30–90 € depending on satisfaction,
  + care XP ("Chăm sóc"). Shifts start 6–14 h, once per day, after the paperwork is done.
- Anna (Praxisanleiterin) also offers **Berufsschule** theory: a care-vocabulary quiz for XP.

### Added — M8: Pfand, shops, customisation
- **Pfand bottles** lie around the German street (and respawn): walk over them to collect, return at the
  supermarket for 0,25 € each.
- **Clothes**: Chị Hằng's stall (áo bà ba, nón lá, áo dài…), Chú Sáu the barber (hairstyles), the German
  flea market (yellow rain jacket, beanie…). Wear them from the bag → wardrobe tab; your portrait uses your outfit.

### Added — Quests, achievements, events
- **Quest log** (tap the objective under the clock): chapters 1–4, sticky steps, a current-objective tracker.
  Side quests: life in Saigon (café shift, trà đá, clothes), life in Germany (rent, 20 bottles, Berufsschule, 5 shifts).
- **15 achievements** (bag → achievements tab) and **random morning events** (Mẹ sends money, rain floods the street,
  the tram is late, a neighbour brings cake…).

### Added — M9: Polish
- **Weather**: rainy days in Germany (45 %), afternoon showers in Saigon; grey sky, softer shadows, rain sound
  (muffled indoors), rain icon on the clock. Red phượng and purple bằng lăng petals drift through Saigon by day.
  Particles animate on the GPU (one draw call each).
- **Procedural audio**: music themes for Vietnam, Germany and indoors + sound effects, all generated with
  WebAudio (no audio files). Settings has separate switches for music and sound effects.
- **Title screen** ("▶ Chơi" / "▶ Chơi tiếp · Ngày N", language picker). It appears instantly; the 3D game
  loads after the tap (which also unlocks sound on phones).
- **PWA**: web manifest, app icons, a service worker generated at build time that caches the whole game →
  installable, plays offline after the first visit.
- **Performance**: vendor code split into react / three / physics chunks (cached across updates), scenes lazy-loaded,
  static splash in `index.html`, non-blocking web fonts.
  Lighthouse (production build, which measures the title screen): **mobile performance 93**, desktop 100; accessibility 93
  (the only remaining item is `user-scalable=no`, kept on purpose so pinch/double-tap doesn't zoom the game);
  best practices 100; SEO 100. Tap → playable: ~2 s on a fast-4G-class connection, ~2 s offline from cache.

### Added — M10: Deploy setup (not deployed yet)
- `.github/workflows/azure-static-web-apps.yml` (build with Node 24, upload `dist/`, PR preview URLs) and
  `public/staticwebapp.config.json` (SPA fallback, immutable caching for hashed assets, no-cache for
  `index.html` / `sw.js`, MIME types, security headers). Step-by-step guide incl. the
  `visahunter.nghiapham.org` CNAME: [docs/DEPLOY.md](DEPLOY.md).

### Changed / fixed
- Scenes: one scene at a time, loaded on demand with a fade (`game/scenes/registry.ts`, `systems/travel.ts`);
  the save remembers which scene you're in. Interiors use a dollhouse camera and warm indoor light.
- The character no longer walks while a menu, dialogue or mini-game is open.
- The camera no longer gets pulled in by invisible walls and small props (new `PROP_GROUPS` collision group).
- The café shift is now an optional side quest, and a skipped step can never block the story (a quest also
  opens once a later quest is complete).
- The controls hint moved above the joystick so it doesn't cover the objective.

### Manual test checklist (phone)
- [ ] Title screen appears instantly with lanterns; VI/EN/DE switch works; **▶ Chơi** → loading → the street. Sound plays after that first tap.
- [ ] The objective under the clock says what to do next; tapping it opens the quest log.
- [ ] Alley: talk to **Thầy Minh** → enrol A1 → **Học một buổi** → play the mini-game (answer feedback, result screen, XP toast).
- [ ] Home door → **Tự học** works (half XP). Der/die/das and the sentence builder come up in later lessons.
- [ ] With enough XP, Thầy Minh offers the exam; pass → toast + level in the bag. Repeat for A2 and B1.
- [ ] Café terrace: **Chị Mai** → choose Ausbildung → **Hồ sơ visa** opens; do each document step (money and time go down; some wait a day).
- [ ] The passport button in the HUD reopens the visa file. **Săn lịch hẹn**: tap a free slot fast → Termin day shown.
- [ ] On that day: **Anh Tư** (xe ôm) → Đại sứ quán → talk to the officer → interview → approved (or rejected → retry next day).
- [ ] Two days later: buy the flight (Chị Mai or the visa file) → Anh Tư → airport → talk to Mẹ → board → long fade → Germany, money in €.
- [ ] Germany: rain on some days (rain icon on the clock, grey sky, rain sound); bottles on the street can be picked up.
- [ ] Lindenstraße 12 → WG → Lena → **WG-Casting** → accepted; laptop: insurance + call home; bed works.
- [ ] Bürgeramt (Mon–Fri 8–16): book a Termin → on that day take a number → Anmeldung form → done. Sparbank → open an account.
- [ ] Tram stop: buy a weekly ticket → ride to the care home → Anna → start a shift (6–14 h): tap residents' needs, watch the meter, Feierabend screen, € paid.
- [ ] Supermarket: return bottles for €; shops closed on Sunday show a toast.
- [ ] Clothes: Chị Hằng / Chú Sáu / Flohmarkt → buy → bag → wardrobe tab → wear; the achievements tab lists unlocked ones.
- [ ] Saigon on a dry day: petals drift down; some afternoons bring a short shower.
- [ ] Reload anywhere (even in Germany or inside a building): you continue where you were.
- [ ] Production build only (`npm run build && npm run preview`): add to home screen, airplane mode, reopen → still playable.

## M3 — Stats, time/day, energy, save/load, simple shop + street life & Vietnamese UI (0.3.0)

### Added — M3 (plan §5.1, 5.2, 5.5, 5.6, 5.8)
- **Mood** stat next to energy (face icon changes with mood). Energy now drains slowly over time.
- **Clock & calendar:** 1 real second = 1 game minute while you roam (paused in menus, chats and shifts).
  Day 1 is a Monday at 07:00. HUD shows time, weekday and day number with a sun/moon icon.
  Eating, chatting and working cost game time (a full café shift = 3 h).
- **Day & night:** sky, fog, sunlight and shadows follow the clock (dawn → day → golden hour → dusk →
  moonlit night). Café string lights and street lamps glow at night.
- **Sleep:** at the home door, "Đi ngủ" (from 18:00, or any time when energy < 35) → next morning 07:00,
  full energy, better mood, autosave. Still awake at 02:00 → you fall asleep on the street and wake at
  home tired and grumpy.
- **Simple shop + bag:** Tạp hóa Cô Ba sells mì gói, bánh bao, xôi, nước mía, nước tăng lực into your
  bag; the bag (HUD button) lets you eat/drink them and shows skill XP. Items live in `data/items.ts`,
  shops in `data/shops.ts`.
- **Save/load:** everything (money, energy, mood, skills, day/time, bag, flags, position, camera) is
  saved to localStorage shortly after any change, every 10 s, and when the tab is hidden; loaded on
  start. Settings → Dữ liệu: export/import a save code, or start over.
- The café now has opening hours (07:00–22:00); a shift costs time and changes mood by how well it went.

### Added — Street life
- **Trà đá stall** at the alley mouth: parasol, big tea jug, glasses, sunflower seeds, "TRÀ ĐÁ 5K"
  cardboard sign. Bà Sáu sells (fanning herself); Chú Năm and Anh Hai sip and gossip.
- **Interactive NPCs with a "!" badge** until you've talked to them today:
  - **Bà Sáu** — buy a trà đá: your character walks to the free stool, sits and sips (energy + mood);
    or ask for neighbourhood gossip (random lines, tips about Germany and the café job).
  - **Cô Ba** — the grocery owner; "Mua đồ" opens her shop, or ask her whether going to Germany is hard.
  - **Chú Bảy** — strolls the sidewalk with a đòn gánh (shoulder pole) of bánh mì; eat one now or take one away.
- **Dialogue box:** portrait, red name ribbon, typewriter text, choice buttons with prices
  (keyboard: Space/E to continue, 1–4 to choose, Esc to leave). Dialogues are data (`data/dialogues.ts`).
- **Ambient life:** pedestrians on both sidewalks (they stop and say "Cho qua chút nha!" if you block
  them), two kids playing **đá cầu** on the far sidewalk, **motorbike traffic** in both lanes (helmeted
  riders slow down, stop and honk "Bíp bíp!" if you stand in the road).
- **Speech bubbles** pop up now and then: trà đá gossip as multi-line conversations, vendor calls,
  kids' banter (`data/chatter.ts`, vi/en/de).
- The neighbour's ground floor is now **Tạp hóa Cô Ba** (shelves of goods, hanging snack strips, drink
  crates, cooler, red-and-gold sign). The main road is open to traffic (side road still closed).

### Changed — UI made prettier and more Vietnamese
- New look: "giấy dó" paper panels with a faint four-petal pattern and gold inner line, lacquer-red +
  gold primary buttons and ribbon titles (Tết colours), jade-green secondary buttons, rounded
  **Baloo 2** display font (full Vietnamese support).
- Redesigned HUD (two compact rows), old-coin money icon (round with a square hole), jade clock chip.
- New loading screen with swaying Hội An lanterns; starry "Zzz…" sleep screen; red joystick knob.
- Action buttons show NPC names + roles; the main action is a red pill, others are gold-ringed circles.

### Notes
- Content text (dialogue, chatter, items) is vi + en with German where written; missing German falls back to English.
- ~120–160 draw calls on screen with all NPCs (measured in dev with `__vh.renderInfo()`).

### Manual test checklist
- [ ] Loading screen shows lanterns; the street has people: Bà Sáu's trà đá stall, Cô Ba at her grocery, Chú Bảy walking with baskets, pedestrians, kids kicking a shuttlecock, motorbikes on the road.
- [ ] Speech bubbles appear every few seconds near you (gossip at the trà đá stall, "Bánh mì nóng giòn đây!").
- [ ] Red "!" badges float over Bà Sáu, Cô Ba and Chú Bảy; after talking, the badge is gone for the rest of the day.
- [ ] Walk up to Bà Sáu → **Nói chuyện** → buy a trà đá: you sit on the free stool, sip, then get +energy/+mood; money −5.000 ₫.
- [ ] Ask Bà Sáu for gossip; "Kể nữa đi bà" gives a different line.
- [ ] Cô Ba → **Mua đồ** → buy items (badge ×n), close, open the **bag** (HUD) → **Dùng** restores energy.
- [ ] Catch Chú Bảy (he stops and turns to you) → buy a bánh mì.
- [ ] Stand in the road: a motorbike stops before you and honks; you can't walk through bikes or pedestrians.
- [ ] Clock runs (~1 game minute per second) and pauses in menus/conversations; the sky turns golden ~17:30, purple ~19:00, blue at night; lamps and café lights glow.
- [ ] Home door: before 18:00 "Chưa buồn ngủ"; after 18:00 **Đi ngủ** → Zzz → next day 07:00, full energy.
- [ ] Stay up until 02:00 → you pass out and wake at home.
- [ ] **Reload the page:** money, energy, mood, day/time, bag and position are all kept.
- [ ] Settings → Dữ liệu: export the code, start over (fresh game), import the code (progress back).
- [ ] Café closed before 07:00 / after 22:00; a shift advances the clock.
- [ ] Phone portrait (incl. 360 px wide) and landscape: HUD fits, dialogue choices are easy to tap.

## M2 — Interaction system, context buttons, first WorkStation: café barista (0.2.0)

### Added
- **Interaction system** (`store/interactionStore.ts`, `components/Interactable.tsx`): anything can register
  a zone + 0–4 actions. Standing in a zone focuses it; its actions appear as round buttons bottom-right
  (plan §4). Desktop: **E** = main action, **1–4** = buttons. Tapping/clicking the object itself also
  triggers the main action (or says "Lại gần hơn nhé!" if you're too far). Floating pins mark spots
  with something to do.
- **Generic WorkStation** (`components/WorkStation.tsx`, `game/systems/work.ts`, `store/workStore.ts`):
  location + actions + "Độ hài lòng" (satisfaction) meter + reward, driven entirely by data in
  `data/tasks.ts` (`{ id, scene, actions[], requests[], durationSec, pay, energyCost, skill, xp }`).
  Customers bring requests; pressing the needed actions (any order) fulfils them; a wrong action spills
  the drink; waiting too long makes the customer leave. Pay = wage × time worked × satisfaction
  multiplier (0.5–1.5) + tips for fast orders. Energy cost and skill XP are prorated too.
- **Café barista job** (`scenes/VietnamStreet/CafeJob.tsx`): press **Làm ca** at the counter → the
  character walks behind the counter, the camera turns to a 3/4 view and zooms in, and a 60 s shift
  starts. Five Vietnamese drinks (đen đá, nâu nóng, sữa đá, bạc xỉu, cà phê muối) from four
  ingredients (cà phê, sữa, đá, muối). The cup on the counter fills with coloured layers as you add
  ingredients. Customers (6 looks, incl. nón lá and glasses) walk in, fidget when impatient, hop
  with 💖 when served or slump with 💢 when they give up.
- **Shift UI:** timer, satisfaction bar, order card with ingredient slots + patience bar, "Nghỉ ca"
  (end early), results screen (served/missed, wage, tips, total, XP, energy) and **Nhận lương** to
  collect. The HUD money shows a floating "+xx.000 ₫" when paid. Feedback toasts for every outcome.
- **Player stats now change:** money, energy and skill XP (not saved yet — that's M3).
- **Café rework:** counter moved forward to make room behind it; the roof, sign and awning cut away
  (but keep casting shadows) while you're inside.
- **Dev helpers** (dev builds only): `__vh.teleport(x, z)`, `__vh.work.getState()`, `__vh.project(x, y, z)`.

### Changed
- See-through occluders now taper toward the player and clear fully at the core, so props right in
  front of the character (counter, espresso machine) stay solid and nothing speckles over them.
- The chibi model is data-driven (`data/npcs.ts` outfits: hair styles, conical hat, glasses, backpack).

### Notes
- Energy can't be restored yet (sleep/food arrive in M3): after ~5 shifts the button turns into
  "Mệt quá". Reloading the page resets stats until saving exists.
- Balancing lives in `data/config.ts` → `jobs.cafeBarista` and `work`.

### Manual test checklist
- [ ] A yellow pin bobs above the café sign; walk in through the front. Roof, sign and awning disappear while inside and come back when you leave.
- [ ] Walk up to the counter (front or behind): **Quầy cà phê** + **Làm ca** appear bottom-right. Walk away: they disappear.
- [ ] Press **Làm ca** (or tap the counter, or press E): the character walks around the counter's left end to the barista spot; joystick hides; camera turns and zooms in.
- [ ] Customers walk in from the street; the order card shows the drink and its ingredient slots. Tapping the right ingredients ticks the slots and fills the cup; the customer hops with 💖 and money "Nhanh ghê! Tip…" appears for fast service.
- [ ] Tap a wrong ingredient: "Sai công thức…", the cup empties, satisfaction drops.
- [ ] Ignore a customer: they fidget when the patience bar gets low, then leave with 💢; satisfaction drops.
- [ ] Tapping the counter mid-shift does nothing (no accidental ingredients).
- [ ] Open settings mid-shift: the timer pauses.
- [ ] Shift ends at 0 s (or via **Nghỉ ca**): results screen; **Nhận lương** adds the total (HUD shows "+…₫"), energy goes down, control returns.
- [ ] Desktop: E starts, 1–4 pick ingredients, Enter/E collects pay.
- [ ] Phone portrait + landscape: order card, buttons and joystick don't overlap; all buttons easy to hit.
- [ ] With low energy the button says **Mệt quá** and won't start.

## M1 — Project setup, street corner, chibi player, controls, HUD (0.1.0)

### Added
- **Stack:** Vite 8, React 19, TypeScript (strict), React Three Fiber 9, drei 10, Rapier 2, Zustand 5, Tailwind 4.
- **Scene `VietnamStreet`:** Vietnamese street corner with the family tube house (nhà ống: shop-front
  shutter, balconies, bougainvillea, rooftop water tank), a neighbour house, an open-front café
  ("CÀ PHÊ" sign, striped awning, string lights, counter, sidewalk tables with plastic stools),
  parked scooters, trees, power poles with tangled wires, zebra crossings, hedges, and a pastel
  skyline fading into fog. All geometry is procedural and merged per object for few draw calls.
- **Player:** chibi built from primitives (big head ≈ 45% of height, bob haircut, blush, backpack),
  idle breathing + blinking, walk cycle with bounce, arm/leg swing and forward lean.
  Capsule rigid body with Rapier; collides with buildings and props.
- **Controls:** virtual joystick bottom-left on touch devices (with dead zone, safe-area aware);
  WASD / arrow keys on desktop; drag (mouse or finger) on the 3D view to rotate the camera.
- **Camera:** third-person follow at 40°, smooth damping, wider view on portrait screens,
  pulls in when a building would block the view; poles/trees/roofs between the camera and
  the player dither out ("see-through occluders").
- **HUD:** settings, music toggle, money (VND, 2.500.000 ₫), energy bar (80/100) — static values
  from `data/config.ts`. Settings dialog: music, graphics (Đẹp/Mượt), language (VI/EN/DE),
  fullscreen (where supported). Esc toggles settings on desktop. Preferences persist in localStorage.
- **i18n:** all UI text via `src/i18n/{vi,en,de}.json` (Vietnamese default; missing keys fail type-check).
- **Performance:** DPR capped (2 on "Đẹp", 1.25 on "Mượt") and auto-lowered by drei
  `PerformanceMonitor` when the frame rate drops; soft PCF shadows; ~35 draw calls for the scene.

### Notes
- Music toggle stores the preference only; audio (Howler) arrives with the polish milestone.
- Money/energy are display-only until M3 (stats, time, save/load).

### Manual test checklist
**Phone (portrait and landscape)**
- [ ] Page loads to the "Visa Hunter" splash, then fades into the street with the player in front of the yellow house.
- [ ] Joystick appears bottom-left; dragging it walks the player smoothly in that direction (relative to the camera); releasing stops and the knob springs back.
- [ ] Small pushes walk slowly, full pushes walk at full speed.
- [ ] Swiping with a second finger (or anywhere off the joystick) rotates the camera; walking still feels "up = away from camera".
- [ ] Player can't walk through houses, the café walls/counter, scooters, trees, tables, or past the hedges/road barriers.
- [ ] Walk into the café and behind the counter; the roof fades around the player so they stay visible.
- [ ] Walk down the alley between the house and the café to the back wall; the camera never ends up inside a building.
- [ ] Poles/trees passing in front of the camera turn see-through instead of hiding the player.
- [ ] HUD sits below the notch / status bar; nothing is cut off on a narrow phone; no page scroll, zoom, or text selection when tapping/dragging.
- [ ] Rotate the phone: layout and camera adapt without reloading.
- [ ] Settings: music, graphics, language and fullscreen (Android) work; choices survive a reload.
- [ ] Switching graphics to "Mượt" keeps the game smooth on a weaker phone.

**Desktop**
- [ ] WASD and arrow keys move; diagonal movement isn't faster; keys don't get stuck after alt-tabbing.
- [ ] Mouse drag rotates the camera; Esc opens/closes settings.
- [ ] Hint at the top explains the controls and fades after ~8 s.
