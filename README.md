# Visa Hunter

A cute, mobile-first 3D life-sim about learning German in Vietnam and building a life in Germany.
Design and milestones: [docs/VISA_HUNTER_PLAN.md](docs/VISA_HUNTER_PLAN.md) · Progress: [docs/CHANGELOG.md](docs/CHANGELOG.md) ·
Deploy: [docs/DEPLOY.md](docs/DEPLOY.md)

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (also prints a Network URL for your phone)
```

Other scripts: `npm run typecheck`, `npm run build` (outputs `dist/`, incl. the service worker), `npm run preview`
(test the production build: title screen, PWA install, offline).

In dev builds the browser console has helpers (`window.__vh`):

| Helper | What |
|---|---|
| `__vh.teleport(5.7, -6.7)` | move the player (here: in front of the café counter) |
| `__vh.travel('germany')` | change scene: `vietnam`, `embassy`, `airport`, `germany`, `buergeramt`, `wg`, `careHome` |
| `__vh.action('german.lesson')` | run any game action by id (see `registerActions` calls) |
| `__vh.talk('thayMinh')`, `__vh.choose(0)` | open a conversation, pick a choice |
| `__vh.time.getState().setTime(1, 19 * 60)` | jump to day 1, 19:00 |
| `__vh.stats.getState().setMoney(5_000_000, 'VND')` | set money |
| `__vh.setFlag('de.wg', 1)`, `__vh.flags.getState()` | story flags |
| `__vh.renderInfo()` | draw calls / triangles |

## Where things live

| Folder | What |
|---|---|
| `src/main.tsx`, `src/boot.tsx` | Entry (title screen only) → the game, loaded after "▶ Chơi" |
| `src/game/scenes/` | One folder per scene + `registry.ts` (spawns, lazy loading). `shared/` has merged low-poly shapes, props, materials, `Room` (interiors) |
| `src/game/components/` | Player, ChibiModel, CameraRig, Lighting (day/night/rain), Weather (particles), ActionSpot, Interactable, WorkStation… |
| `src/game/components/npc/` | NPC (walk/sit/talk), Traffic (motorbikes, cars, bikes), ChatterDirector, SpeechBubble, NpcMarker |
| `src/game/minigames/` | Vocabulary, der/die/das, sentence builder, exam, Termin hunt, Q&A interview |
| `src/game/systems/` | Input, camera/player state, travel, time, daylight, weather, dialogue, actions + conditions, quests/achievements watchers, german / visa / germany / pfand / wardrobe rules, audio, save/load, dev helpers |
| `src/ui/` | DOM overlay: HUD, TitleScreen, Joystick, ActionButtons, DialogueBox, panels (shop, bag, clothes, quests, visa, care, work), Toasts, Settings |
| `src/store/` | Zustand stores (player, time, world, inventory, flags, dialogue, minigame, care, pfand, settings, ui, interaction, work, toasts) |
| `src/data/config.ts` | Every tunable number (prices, fees, pay, energy, timings, weather, graphics) |
| `src/data/` | Content: `npcs`, `dialogues/` (street, story, germany), `chatter`, `quests`, `achievements`, `events`, `vocab`, `interviews`, `visa`, `care`, `clothes`, `items`, `shops`, `tasks` |
| `src/i18n/` | `vi.json` (default), `en.json`, `de.json` |
| `pwa/` | App icon source and the service-worker template (filled in by `vite.config.ts` at build time) |
| `public/` | Manifest, icons, `staticwebapp.config.json` (Azure) |
