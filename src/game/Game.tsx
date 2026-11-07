import { lazy, Suspense, useMemo, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { CONFIG } from '../data/config'
import { useSettings } from '../store/settingsStore'
import { useWorld, type SceneId } from '../store/worldStore'
import { CameraRig } from './components/CameraRig'
import { InteractionSystem } from './components/Interactable'
import { Lighting } from './components/Lighting'
import { Player } from './components/Player'
import { SceneReady } from './components/SceneReady'
import { TimeSystem } from './components/TimeSystem'
import { Weather } from './components/Weather'
import { PALETTE } from './scenes/shared/palette'
import { SCENES } from './scenes/registry'
import { DebugBridge } from './systems/debug'

/** Physics steps after the player sets its velocity (-100) and before the camera (0). */
const PHYSICS_PRIORITY = -50

const SCENE_COMPONENTS = Object.fromEntries(
  Object.values(SCENES).map((s) => [s.id, lazy(s.load)]),
) as Record<SceneId, LazyExoticComponent<ComponentType>>

/** The current location, loaded on demand. */
function SceneRoot() {
  const scene = useWorld((s) => s.scene)
  const Scene = SCENE_COMPONENTS[scene]
  return (
    <Suspense fallback={null}>
      <Scene key={scene} />
    </Suspense>
  )
}

/** A floor that's always there, so the player never falls while a scene is loading. */
function GlobalGround() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[120, 0.5, 120]} position={[0, -0.5, 0]} />
    </RigidBody>
  )
}

export function Game() {
  const quality = useSettings((s) => s.quality)
  const playerVisual = useRef<Group>(null)
  // Lowered automatically if the device can't hold its frame rate.
  const [dprCap, setDprCap] = useState(Number.POSITIVE_INFINITY)
  const maxDpr = Math.min(dprCap, CONFIG.graphics[quality].maxDpr)
  const camera = useMemo(() => ({ fov: CONFIG.camera.fov, near: 0.5, far: 140, position: [0, 10, 12] as [number, number, number] }), [])

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows="percentage"
        flat // no tone mapping: keeps pastel colors exactly as authored
        dpr={[1, maxDpr]}
        camera={camera}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[PALETTE.sky]} />
        <fog attach="fog" args={[PALETTE.fog, 30, 80]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDprCap(1)}
          onIncline={() => setDprCap(Number.POSITIVE_INFINITY)}
          onFallback={() => setDprCap(1)}
        />
        <Lighting />
        <Suspense fallback={null}>
          <Physics gravity={[0, CONFIG.world.gravity, 0]} updatePriority={PHYSICS_PRIORITY}>
            <GlobalGround />
            <SceneRoot />
            <Player visualRef={playerVisual} />
            <CameraRig target={playerVisual} />
            <InteractionSystem />
            <TimeSystem />
          </Physics>
          <Weather />
          <SceneReady />
          {import.meta.env.DEV && <DebugBridge />}
        </Suspense>
      </Canvas>
    </div>
  )
}
