# Visa Hunter — Game Plan & Build Spec

> Paste this file into your project root (e.g. `docs/PLAN.md`) and tell the AI coding agent:
> "Read docs/PLAN.md. Implement Milestone 1 only. Ask before changing the architecture."
> Build milestone by milestone — never ask for the whole game in one prompt.

---

## 1. Concept

**Visa Hunter** is a cute 3D life-simulation web game about the journey of a young Vietnamese person
who learns German in Vietnam, earns money with part-time jobs, survives the visa process, moves to Germany
for university (Studium) or vocational training (Ausbildung), graduates, works, and builds a life there.

- Platform: mobile browser first (portrait + landscape), desktop browser second
- Tone: warm, funny, a bit satirical about German bureaucracy (Termin, Formular, Pfand, Deutsche Bahn)
- UI language: Vietnamese by default, German terms kept for flavor (Termin, Anmeldung, Sperrkonto, Pfand…).
  All UI strings go through an i18n file so English/German can be added later.

## 2. Art direction

- Chibi characters: big round head (~45% of height), short body, simple dot eyes, rosy cheeks
- Soft pastel palette, warm lighting, soft shadows, slightly toy-like / clay-like look
- Low-poly rounded shapes, toon or soft-lambert materials, subtle ambient occlusion feel
- Camera: third-person, slightly high angle (~35–45°), smooth follow, slight zoom on interaction
- Original assets only. Use CC0 packs (Kenney, Quaternius, KayKit) or build characters from primitives
  (spheres/capsules). Do NOT copy any existing game's characters, logos or UI art.

## 3. Tech stack

| Area | Choice |
|---|---|
| Build | Vite + TypeScript |
| 3D | Three.js via React Three Fiber (`@react-three/fiber`, `@react-three/drei`) |
| Physics/collision | `@react-three/rapier` (simple capsule controller, static colliders) |
| State | Zustand (game state) with `persist` middleware (localStorage save) |
| UI/HUD | React DOM overlay + Tailwind CSS |
| Touch joystick | Custom component (or `nipplejs`) |
| Audio | Howler.js (BGM + SFX, mute toggle) |
| Content | JSON/TS data files (jobs, tasks, items, quests, events) — data-driven |
| PWA | `vite-plugin-pwa` (installable, offline cache) |
| Hosting | Azure Static Web Apps (or any static host) → e.g. `visahunter.nghiapham.org` |

Performance targets (mid-range phone): 60 fps goal, 30 fps minimum, clamp DPR to max 2,
instanced meshes for repeated props, lazy-load each scene, total initial download < 10 MB.

## 4. Controls

**Mobile**
- Virtual joystick bottom-left (move)
- Context action buttons bottom-right: 1–4 round buttons with icon + label, they appear only
  near an interactable (e.g. near a resident in the care home: "Đút ăn", "Lau miệng", "Trò chuyện", "Dỗ dành")
- Tap on NPC/object also triggers interaction
- Top HUD: settings, music toggle, day/night, money, energy, mood, camera/screenshot button

**Desktop**
- WASD / arrow keys to move, E to interact, 1–4 for context actions, Esc for menu, mouse drag to rotate camera

## 5. Core systems

1. **Player stats**: money (VND in Vietnam, EUR in Germany, exchange rate in config),
   energy, mood, German level (A1→C1 with XP), skills per profession, reputation
2. **Time system**: day/week calendar, actions cost time + energy; sleeping restores energy and advances the day
3. **Task / mini-game framework** (most important, reuse everywhere):
   - A `WorkStation` = location + list of actions + success meter + reward
   - Example: care home resident → actions raise "Độ hài lòng" meter → payout + skill XP
   - Each task type is defined in data: `{ id, scene, actions[], durationSec, pay, energyCost, skill, xp }`
4. **Quest system**: main story quests (chapters) + side quests, with checklist UI
5. **Economy & shop**: buy clothes/hairstyles, room furniture, bike, phone, gifts, food (restores energy)
6. **Inventory & customization**: outfits shown on the character model
7. **Random events**: "Brief vom Amt" (letter from the authorities), train delayed, rent increase,
   Termin suddenly available, exam result, homesickness call from family
8. **Save/Load**: autosave to localStorage; export/import save code; cloud save later
9. **Achievements**: e.g. "Termin Hunter" (got an appointment on the first try), "Pfandkönig" (1,000 bottles)

## 6. Game flow (chapters)

### Chapter 1 — Vietnam: learning German + earning money
- Scenes: home, language center, café, street (delivery), small factory
- Learning tasks (mini-games): vocabulary quiz, **der/die/das sorting game**, listening, sentence building,
  mock speaking with NPC teacher → German level XP
- Part-time jobs: café barista, motorbike delivery driver, English/math tutoring, factory line, street food stall
- Goals: pay language course fees, pass Goethe/telc A1→B1 exam (exam = boss mini-game), save money

### Chapter 2 — The visa journey
- Choose path: **Studium** or **Ausbildung** (affects requirements and Chapter 3)
- Document checklist mini-game (collect, translate, notarize)
- Study path: APS certificate step; Ausbildung path: find a training contract
- Blocked account (Sperrkonto) / proof of finances — required amount set in config, not hardcoded
- **Termin hunting** mini-game: refresh + tap timing at the embassy booking page
- Interview mini-game: answer questions, mood/stress meter
- Waiting period with random events; visa approved → farewell scene at the airport

### Chapter 3 — Arrival in Germany
- Scenes: airport, city street, Bürgeramt, bank, WG room, supermarket (closed on Sunday!)
- Tasks: Anmeldung, open bank account, health insurance, find housing (WG viewing mini-game)
- Survival mechanics: rent, food, transport ticket, weather

### Chapter 4A — Studium
- University campus, lectures (quiz), exams, group projects, library
- Werkstudent jobs: office helper, IT support, lab assistant

### Chapter 4B — Ausbildung (each profession = its own scene + station set)
- **Pflege** (care home): feed, wipe mouth, chat, comfort, help with wheelchair → satisfaction meter
- **Koch / Gastronomie**: prep, cook, plate orders on time
- **Hotelfach**: check-in guests, make beds
- **Mechatroniker / Elektroniker**: fix machines (wire/puzzle mini-game)
- **Bau** (construction): carry materials, assemble scaffolding
- Berufsschule days: quizzes; Zwischenprüfung and Abschlussprüfung as boss mini-games

### Side hustles (available from Chapter 3)
- **Pfand collection**: walk around the city, pick up bottles, return them at the machine for cents
- Food delivery by bike, restaurant helper, Minijob at the supermarket, tutoring other students

### Chapter 5 — After graduation
- Job hunting, interview, first full-time job, salary, promotions
- Life goals: own apartment, car, trip home to Vietnam, permanent residence, citizenship (endgame)
- Endless mode after main story: keep working, decorating, collecting

## 7. Project structure

```
src/
  main.tsx
  game/
    scenes/           # one folder per scene (VietnamHome, LanguageCenter, CareHome, ...)
    components/       # Player, NPC, Interactable, WorkStation, CameraRig
    systems/          # time, economy, quests, events, save
    minigames/        # DerDieDas, TerminHunt, Interview, PfandCollect, CareTask ...
  ui/                 # HUD, Joystick, ActionButtons, Dialog, Shop, QuestLog, Menu
  store/              # Zustand stores (player, world, inventory, quests)
  data/               # jobs.ts, tasks.ts, items.ts, quests.ts, events.ts, vocab.ts
  i18n/               # vi.json, de.json, en.json
  assets/             # models (.glb), textures, audio
```

Rule for the agent: **new jobs, items, quests and vocabulary must be addable by editing `data/` only**,
without touching engine code.

## 8. Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Project setup + one small scene (Vietnamese street/home), chibi player from primitives, joystick + WASD movement, follow camera, top HUD | Player walks around smoothly on phone and desktop |
| M2 | Interaction system + context action buttons + first WorkStation (café job) | Approaching the counter shows buttons; completing the task pays money |
| M3 | Stats, time/day system, energy, save/load, simple shop | Progress survives page reload |
| M4 | German learning mini-games (vocab quiz, der/die/das), language level + exam | Player can reach A1→B1 |
| M5 | Visa chapter: path choice, checklist, Termin hunt, interview | Visa can be approved or rejected |
| M6 | Germany arrival scenes + Anmeldung/housing quests | Player lives in a WG with rent |
| M7 | First Ausbildung profession (Pflege care home) with full station set | One full workday playable |
| M8 | Pfand side hustle + shop expansion + customization | Earn and spend EUR |
| M9 | Polish: audio, particles, day/night, achievements, PWA, performance pass | Lighthouse mobile performance ≥ 80 |
| M10 | Deploy to Azure Static Web Apps + custom subdomain | Public URL works on iOS Safari and Android Chrome |
| Later | More professions, Studium path, cloud save, leaderboards, multiplayer café | — |

## 9. Rules for the AI coding agent

- Implement one milestone per request; keep the game runnable after every step
- TypeScript strict mode; small components; no giant files
- Mobile first: test touch controls, safe-area insets (iPhone notch), portrait and landscape
- All texts via i18n keys; all balancing numbers (pay, prices, energy costs) in `data/config.ts`
- Use only CC0/own assets and document their source in `assets/CREDITS.md`
- After each milestone: update `docs/CHANGELOG.md` and list what to test manually

## 10. First prompt to paste

```
You are building a mobile-first 3D web game called "Visa Hunter". Read docs/PLAN.md fully.
Implement Milestone M1 only:
- Vite + React + TypeScript + React Three Fiber + drei + Rapier + Zustand + Tailwind
- A small cute low-poly scene (Vietnamese street corner with a house and a café), pastel colors, soft shadows
- A chibi player built from primitives (big head, small body) with idle/walk bobbing animation
- Virtual joystick bottom-left on touch devices, WASD on desktop, third-person follow camera
- Top HUD bar: settings, music toggle, money, energy (static values for now)
- Follow the project structure in section 7.
When done, tell me how to run it and what to test on my phone.
```
