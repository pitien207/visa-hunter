import { useMemo } from 'react'
import type { Vec3 } from '../../data/config'
import type { Condition } from '../../data/conditions'
import type { ActionIconName } from '../../data/tasks'
import type { I18nKey } from '../../i18n'
import type { Localized } from '../../i18n/localized'
import { useFlags } from '../../store/flagsStore'
import type { ContextAction, InteractableDef } from '../../store/interactionStore'
import { usePlayer } from '../../store/playerStore'
import { useTime } from '../../store/timeStore'
import { runAction } from '../systems/actions'
import { check } from '../systems/conditions'
import type { ZoneXZ } from '../systems/playerState'
import { InteractableHitArea, InteractMarker, useInteractable } from './Interactable'

export interface SpotAction {
  id: string
  labelKey: I18nKey
  icon: ActionIconName
  /** Game action to run (game/systems/actions.ts). */
  action: string
  arg?: string
  primary?: boolean
  /** Only shown when this holds. */
  if?: Condition
}

export interface ActionSpotProps {
  id: string
  nameKey?: I18nKey
  name?: Localized
  zone: ZoneXZ
  actions: SpotAction[]
  /** Optional floating pin, shown when this holds (default: never). */
  marker?: { at: Vec3; when?: Condition }
  /** Optional tap target (world space). */
  hit?: { at: Vec3; size: Vec3 }
  priority?: number
}

/**
 * Any place you can use — a door, a ticket machine, a laptop — described as data:
 * a zone plus buttons that run named game actions, each optionally conditional.
 */
export function ActionSpot({ id, nameKey, name, zone, actions, marker, hit, priority = 1 }: ActionSpotProps) {
  // Re-evaluate conditions when flags change, every half game-hour, and on money/level changes.
  const flags = useFlags((s) => s.flags)
  const halfHour = useTime((s) => Math.floor(s.minutes / 30) + s.day * 48)
  const money = usePlayer((s) => Math.floor(s.money))
  const level = usePlayer((s) => s.german.level)

  const visible = useMemo<ContextAction[]>(
    () =>
      actions
        .filter((a) => check(a.if))
        .map((a) => ({ id: a.id, labelKey: a.labelKey, icon: a.icon, primary: a.primary, onPress: () => runAction(a.action, a.arg) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, flags, halfHour, money, level],
  )
  const def = useMemo<InteractableDef>(() => ({ id, nameKey, name, zone, actions: visible, priority }), [id, nameKey, name, zone, visible, priority])
  useInteractable(def)

  const showMarker = !!marker && check(marker.when)
  return (
    <>
      {hit && <InteractableHitArea id={id} position={hit.at} size={hit.size} />}
      {marker && <InteractMarker id={id} position={marker.at} visible={showMarker} />}
    </>
  )
}
