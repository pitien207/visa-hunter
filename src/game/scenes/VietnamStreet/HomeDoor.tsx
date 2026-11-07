import { useMemo } from 'react'
import { CONFIG } from '../../../data/config'
import type { ContextAction, InteractableDef } from '../../../store/interactionStore'
import { usePlayer } from '../../../store/playerStore'
import { useTime } from '../../../store/timeStore'
import { InteractMarker, useInteractable } from '../../components/Interactable'
import { goToSleep, saveNow } from '../../systems/effects'
import { runAction } from '../../systems/actions'
import { BUILDING_FRONT_Z, HOME, HOME_DOOR_ZONE } from './layout'

/** The family home's door: sleep (ends the day, restores energy) and save. */
export function HomeDoor() {
  // Re-evaluate every half hour of game time, not every minute.
  const halfHour = useTime((s) => Math.floor(s.minutes / 30))
  const lowEnergy = usePlayer((s) => s.energy < CONFIG.time.sleepIfEnergyBelow)
  const hour = halfHour / 2
  const sleepy = lowEnergy || hour >= CONFIG.time.sleepFromHour || hour < CONFIG.time.wakeHour
  const late = hour >= 21 || hour < CONFIG.time.wakeHour

  const actions = useMemo<ContextAction[]>(
    () => [
      {
        id: 'sleep',
        labelKey: sleepy ? 'action.sleep' : 'action.notSleepy',
        icon: 'sleep',
        primary: true,
        muted: !sleepy,
        onPress: goToSleep,
      },
      { id: 'study', labelKey: 'action.selfStudy', icon: 'book', onPress: () => runAction('german.selfStudy') },
      { id: 'save', labelKey: 'action.save', icon: 'save', onPress: saveNow },
    ],
    [sleepy],
  )
  const def = useMemo<InteractableDef>(
    () => ({ id: 'home', nameKey: 'interact.home', zone: HOME_DOOR_ZONE, actions, priority: 1 }),
    [actions],
  )
  useInteractable(def)

  // At night a pin over the door says "time to go home".
  return <InteractMarker id="home" position={[HOME.x, 2.55, BUILDING_FRONT_Z + 0.7]} visible={late} />
}
