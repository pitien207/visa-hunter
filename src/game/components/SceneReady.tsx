import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useUI } from '../../store/uiStore'

/**
 * Mounted inside the same <Suspense> as the scene. Flags the scene as ready after
 * a few rendered frames (shader compilation happens on the first ones), which
 * lets the loading screen fade out over a scene that is already moving smoothly.
 */
export function SceneReady({ frames = 3 }: { frames?: number }) {
  const count = useRef(0)
  useFrame(() => {
    if (count.current > frames) return
    count.current++
    if (count.current === frames) useUI.getState().markSceneReady()
  })
  return null
}
