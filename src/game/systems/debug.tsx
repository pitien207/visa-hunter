import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useDialogue } from '../../store/dialogueStore'
import { useFlags } from '../../store/flagsStore'
import { useInteraction } from '../../store/interactionStore'
import { useInventory } from '../../store/inventoryStore'
import { useTime } from '../../store/timeStore'
import { useUI } from '../../store/uiStore'
import { usePlayer } from '../../store/playerStore'
import { useWork } from '../../store/workStore'
import { cameraState } from './cameraState'
import { chooseOption, openDialogue } from './dialogue'
import { playerState, teleportPlayer } from './playerState'
import { npcPositions } from './registry'
import { exportSave, saveGame } from './save'
import { useWorld } from '../../store/worldStore'
import { useCare } from '../../store/careStore'
import { useMinigame } from '../../store/minigameStore'
import { usePfand } from '../../store/pfandStore'
import { useToasts } from '../../store/toastStore'
import { travelTo } from './travel'
import { runAction } from './actions'
import { setFlag } from './conditions'

/**
 * Dev-only console helpers (stripped from production builds):
 *   __vh.teleport(4.5, -6)        move the player
 *   __vh.work.getState()          inspect the current shift
 *   __vh.project(x, y, z)         world point → CSS pixel position on screen
 *   __vh.time.getState().setTime(1, 20 * 60)   jump to 20:00
 *   __vh.travel('germany', 'default')            change scene
 *   __vh.action('german.lesson')                 run a named game action
 */
export function installDebugHooks() {
  if (!import.meta.env.DEV) return
  Object.assign(window, {
    __vh: {
      teleport: teleportPlayer,
      player: playerState,
      camera: cameraState,
      stats: usePlayer,
      work: useWork,
      interaction: useInteraction,
      time: useTime,
      inventory: useInventory,
      flags: useFlags,
      dialogue: useDialogue,
      ui: useUI,
      npcs: npcPositions,
      talk: openDialogue,
      choose: chooseOption,
      save: saveGame,
      exportSave,
      world: useWorld,
      care: useCare,
      minigame: useMinigame,
      pfand: usePfand,
      toasts: useToasts,
      travel: travelTo,
      action: runAction,
      setFlag,
      project: () => null,
    },
  })
}

/** Mount inside <Canvas> (dev only) to give `__vh.project` access to the camera. */
export function DebugBridge() {
  const get = useThree((s) => s.get)
  useEffect(() => {
    const vh = (window as unknown as { __vh?: Record<string, unknown> }).__vh
    if (!vh) return
    vh.renderInfo = () => {
      const { calls, triangles } = get().gl.info.render
      return { calls, triangles }
    }
    vh.project = (x: number, y: number, z: number) => {
      const { camera, size } = get()
      const v = new Vector3(x, y, z).project(camera)
      return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height }
    }
  }, [get])
  return null
}
