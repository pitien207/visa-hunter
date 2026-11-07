import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CONFIG } from '../data/config'
import { setJoystick } from '../game/systems/input'
import { useT } from '../i18n'
import { useUI } from '../store/uiStore'
import { useIsTouch } from './useIsTouch'

/**
 * Virtual joystick, bottom-left, touch devices only (plan §4).
 * The knob is moved via direct style writes — no React re-render per touch move.
 */
export function Joystick() {
  const isTouch = useIsTouch()
  const t = useT()
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const activePointer = useRef<number | null>(null)
  const [engaged, setEngaged] = useState(false)
  // Hidden while the game moves the player (e.g. working behind the counter).
  const locked = useUI((s) => s.movementLocked)

  useEffect(() => () => setJoystick(0, 0), [])
  useEffect(() => {
    if (!locked) return
    activePointer.current = null
    setEngaged(false)
    setJoystick(0, 0)
  }, [locked])

  if (!isTouch || locked) return null

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current
    const knob = knobRef.current
    if (!base || !knob) return
    const rect = base.getBoundingClientRect()
    let dx = clientX - (rect.left + rect.width / 2)
    let dy = clientY - (rect.top + rect.height / 2)
    const { radiusPx, deadZone } = CONFIG.joystick
    const len = Math.hypot(dx, dy)
    if (len > radiusPx) {
      dx *= radiusPx / len
      dy *= radiusPx / len
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`

    // Normalise, apply the dead zone and rescale so output still reaches 1.
    let x = dx / radiusPx
    let y = -dy / radiusPx // screen up = forward
    const mag = Math.hypot(x, y)
    if (mag < deadZone) {
      x = y = 0
    } else {
      const scaled = (mag - deadZone) / (1 - deadZone)
      x = (x / mag) * scaled
      y = (y / mag) * scaled
    }
    setJoystick(x, y)
  }

  const release = () => {
    activePointer.current = null
    setEngaged(false)
    setJoystick(0, 0)
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== null) return
    activePointer.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    setEngaged(true)
    update(e.clientX, e.clientY)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId === activePointer.current) update(e.clientX, e.clientY)
  }
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId === activePointer.current) release()
  }

  return (
    <div
      role="application"
      aria-label={t('joystick.label')}
      className="pointer-events-auto absolute z-20 grid h-44 w-44 touch-none place-items-center select-none"
      style={{
        left: 'max(0.25rem, env(safe-area-inset-left))',
        bottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={baseRef}
        className={`relative h-32 w-32 rounded-full border-4 border-gold/80 bg-paper/40 shadow-lg backdrop-blur-sm transition-opacity ${
          engaged ? 'opacity-100' : 'opacity-75'
        }`}
      >
        <div
          ref={knobRef}
          className={`absolute top-1/2 left-1/2 -mt-7 -ml-7 h-14 w-14 rounded-full border-4 border-gold-light bg-lacquer shadow-[0_4px_0_var(--color-lacquer-dark)] ${
            engaged ? '' : 'transition-transform duration-150'
          }`}
        />
      </div>
    </div>
  )
}
