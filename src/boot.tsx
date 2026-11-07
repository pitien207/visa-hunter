import App from './App'
import { initAudio, setMusicTheme } from './game/systems/audio'
import './game/systems/gameplay'
import { loadGame, startAutosave } from './game/systems/save'
import { startWatchers } from './game/systems/watchers'
import { SCENES } from './game/scenes/registry'
import { useWorld } from './store/worldStore'

/**
 * The game itself, loaded after the title screen (keeps the first paint light).
 * Module side effects run once, on first import.
 */

// Restore progress before the first render, then keep saving automatically.
loadGame()
startAutosave()
startWatchers()
initAudio()

// Background music follows the place you're in.
const applyMusic = () => {
  const scene = SCENES[useWorld.getState().scene]
  setMusicTheme(scene.indoor ? 'indoor' : scene.country)
}
applyMusic()
useWorld.subscribe(applyMusic)

export default App
