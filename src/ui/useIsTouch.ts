import { useEffect, useState } from 'react'

function detectTouch() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

/**
 * True on touch-first devices. Also flips to true the first time a finger touches
 * the screen (e.g. touchscreen laptops), so the joystick appears when it's needed.
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(detectTouch)

  useEffect(() => {
    if (isTouch) return
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') setIsTouch(true)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [isTouch])

  return isTouch
}
