import { useMemo } from 'react'
import { CONFIG } from '../../../data/config'
import type { ContextAction, InteractableDef } from '../../../store/interactionStore'
import { useTime } from '../../../store/timeStore'
import { InteractMarker, useInteractable } from '../../components/Interactable'
import { runAction } from '../../systems/actions'
import { BUILDING_FRONT_Z, HOME, HOME_DOOR_ZONE } from './layout'

/** The family home's door: go inside (bed, study desk, family). */
export function HomeDoor() {
  const halfHour = useTime((s) => Math.floor(s.minutes / 30))
  const hour = halfHour / 2
  const late = hour >= 21 || hour < CONFIG.time.wakeHour

  const actions = useMemo<ContextAction[]>(
    () => [{ id: 'enter', labelKey: 'action.goInside', icon: 'door', primary: true, onPress: () => runAction('home.enter') }],
    [],
  )
  const def = useMemo<InteractableDef>(
    () => ({ id: 'home', nameKey: 'interact.home', zone: HOME_DOOR_ZONE, actions, priority: 1 }),
    [actions],
  )
  useInteractable(def)

  // At night a pin over the door says "time to go home".
  return <InteractMarker id="home" position={[HOME.x, 2.55, BUILDING_FRONT_Z + 0.7]} visible={late} />
}
