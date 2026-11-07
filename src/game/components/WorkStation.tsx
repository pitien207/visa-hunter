import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONFIG } from '../../data/config'
import type { TaskDef } from '../../data/tasks'
import type { I18nKey } from '../../i18n'
import type { ContextAction, InteractableDef } from '../../store/interactionStore'
import { usePlayer } from '../../store/playerStore'
import { pushToast } from '../../store/toastStore'
import { useUI } from '../../store/uiStore'
import { useTime } from '../../store/timeStore'
import { useWork } from '../../store/workStore'
import { focusCamera, resetCameraFocus } from '../systems/cameraState'
import { playerState, releasePlayer, walkTo, type PointXZ, type ZoneXZ } from '../systems/playerState'
import { useInteractable } from './Interactable'

export interface WorkStationProps {
  task: TaskDef
  id: string
  nameKey: I18nKey
  /** Where the "start" button is offered (world XZ). */
  zone: ZoneXZ
  /** Where the player stands while working (world XZ). */
  spot: PointXZ
  /** Waypoints from the player's position to the spot (default: straight there). */
  approach?: (from: PointXZ) => PointXZ[]
  /** Player facing while working (0 = +Z). */
  faceYaw: number
  /** Camera yaw while working. */
  cameraYaw: number
}

/**
 * Generic job station (plan §5.3): location + actions + success meter + reward.
 * Offers "start shift" in its zone, walks the player into position, then exposes
 * the task's actions as context buttons until the shift ends.
 */
export function WorkStation({ task, id, nameKey, zone, spot, approach, faceYaw, cameraYaw }: WorkStationProps) {
  const phase = useWork((s) => (s.task?.id === task.id ? (s.session?.phase ?? null) : null))
  const tired = usePlayer((s) => s.energy < task.energyCost)
  const [approaching, setApproaching] = useState(false)
  const holdsPlayer = useRef(false)

  const start = useCallback(() => {
    if (useWork.getState().session || holdsPlayer.current) return
    const hour = useTime.getState().minutes / 60
    if (hour < task.openHour || hour >= task.closeHour) {
      pushToast('toast.cafeClosed', 'info', { open: task.openHour, close: task.closeHour })
      return
    }
    if (usePlayer.getState().energy < task.energyCost) {
      pushToast('toast.tooTired', 'bad')
      return
    }
    holdsPlayer.current = true
    setApproaching(true)
    const from = { x: playerState.position.x, z: playerState.position.z }
    walkTo(approach ? approach(from) : [spot], () => {
      playerState.faceYaw = faceYaw
      focusCamera(cameraYaw, CONFIG.camera.workZoom)
      setApproaching(false)
      useWork.getState().start(task)
    })
  }, [task, approach, spot, faceYaw, cameraYaw])

  // Give control back once the pay has been collected.
  useEffect(() => {
    if (phase === null && !approaching && holdsPlayer.current) {
      holdsPlayer.current = false
      releasePlayer()
      resetCameraFocus()
    }
  }, [phase, approaching])

  // If the station unmounts mid-shift, don't leave the player stuck.
  useEffect(
    () => () => {
      if (holdsPlayer.current) {
        releasePlayer()
        resetCameraFocus()
      }
    },
    [],
  )

  useFrame((_, dt) => {
    if (phase !== 'working' || useUI.getState().settingsOpen) return
    useWork.getState().tick(Math.min(dt, 0.1))
  })

  const actions = useMemo<ContextAction[]>(() => {
    if (approaching || phase === 'finished') return []
    if (phase === 'working') {
      return task.actions.map((a) => ({
        id: a.id,
        labelKey: a.labelKey,
        icon: a.icon,
        onPress: () => useWork.getState().act(a.id),
      }))
    }
    return [
      {
        id: 'start',
        labelKey: tired ? 'action.tooTired' : 'action.startShift',
        icon: 'start',
        primary: true,
        muted: tired,
        onPress: start,
      },
    ]
  }, [approaching, phase, task, tired, start])

  const def = useMemo<InteractableDef>(() => ({ id, nameKey, zone, actions, priority: 1 }), [id, nameKey, zone, actions])
  useInteractable(def)

  return null
}
