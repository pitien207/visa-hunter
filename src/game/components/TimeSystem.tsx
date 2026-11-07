import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONFIG } from '../../data/config'
import { useTime } from '../../store/timeStore'
import { passOut } from '../systems/effects'
import { applyNeeds, isLateNight, isTimePaused } from '../systems/time'

/**
 * Runs the in-game clock (plan §5.2): CONFIG.time.minutesPerSecond game minutes per
 * real second while you roam. Energy drains a little; mood drifts; stay up past 02:00
 * and you fall asleep on the street.
 */
export function TimeSystem() {
  const acc = useRef(0)

  useFrame((_, rawDt) => {
    if (isTimePaused()) return
    acc.current += Math.min(rawDt, 0.1) * CONFIG.time.minutesPerSecond
    if (acc.current < 1) return
    const minutes = Math.floor(acc.current)
    acc.current -= minutes
    useTime.getState().advance(minutes)
    applyNeeds(minutes)
    if (isLateNight(useTime.getState().minutes)) passOut()
  })

  return null
}
