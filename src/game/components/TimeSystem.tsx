import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONFIG } from '../../data/config'
import { useSettings } from '../../store/settingsStore'
import { useTime } from '../../store/timeStore'
import { useUI } from '../../store/uiStore'
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
    const dt = Math.min(rawDt, 0.1)
    // Waiting: spin the clock until the requested time has passed.
    const ff = useUI.getState().fastForward
    if (ff) {
      const step = Math.min(ff.remaining, dt * CONFIG.time.fastForwardPerSecond)
      useTime.getState().advance(step)
      applyNeeds(step)
      const remaining = ff.remaining - step
      if (remaining <= 0.01) {
        useUI.getState().setFastForward(null)
        ff.onDone?.()
      } else {
        useUI.getState().setFastForward({ ...ff, remaining })
      }
      return
    }
    if (isTimePaused()) return
    acc.current += dt * CONFIG.time.minutesPerSecond * CONFIG.time.speeds[useSettings.getState().timeSpeed]
    if (acc.current < 1) return
    const minutes = Math.floor(acc.current)
    acc.current -= minutes
    useTime.getState().advance(minutes)
    applyNeeds(minutes)
    if (isLateNight(useTime.getState().minutes)) passOut()
  })

  return null
}
