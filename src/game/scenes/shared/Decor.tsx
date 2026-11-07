import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { Vec3 } from '../../../data/config'
import { useSettings } from '../../../store/settingsStore'
import { useTime } from '../../../store/timeStore'
import { dateOf } from '../../systems/calendar'
import { weekdayIndex } from '../../systems/time'
import { translate, type I18nKey } from '../../../i18n'
import { Shapes, type ShapeItem } from './Shapes'
import { SignBoard } from './SignBoard'
import type { SignOptions } from './textures'

/** Living details for interiors: things that move with the game clock. */

/** Round wall clock whose hands show the in-game time. Faces +Z. */
export function WallClock({ position, rotation = [0, 0, 0], radius = 0.32 }: { position: Vec3; rotation?: Vec3; radius?: number }) {
  const hour = useRef<Group>(null)
  const minute = useRef<Group>(null)
  const face = useMemo<ShapeItem[]>(() => {
    const s: ShapeItem[] = [
      { cyl: [radius + 0.04, radius + 0.04, 0.06, 24], rot: [Math.PI / 2, 0, 0], color: '#c8322b' },
      { cyl: [radius, radius, 0.07, 24], rot: [Math.PI / 2, 0, 0], at: [0, 0, 0.005], color: '#fffaf2' },
    ]
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const r = radius * 0.82
      s.push({ box: [0.025, i % 3 === 0 ? 0.07 : 0.04, 0.01], at: [Math.sin(a) * r, Math.cos(a) * r, 0.045], rot: [0, 0, -a], color: '#5b4636' })
    }
    return s
  }, [radius])

  useFrame(() => {
    const m = useTime.getState().minutes
    if (hour.current) hour.current.rotation.z = -((m / 60) % 12) * (Math.PI / 6)
    if (minute.current) minute.current.rotation.z = -(m % 60) * (Math.PI / 30)
  })

  return (
    <group position={position} rotation={rotation}>
      <Shapes shapes={face} castShadow={false} />
      <group ref={hour} position={[0, 0, 0.05]}>
        <mesh position={[0, radius * 0.25, 0]}>
          <boxGeometry args={[0.035, radius * 0.5, 0.01]} />
          <meshLambertMaterial color="#5b4636" />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.056]}>
        <mesh position={[0, radius * 0.36, 0]}>
          <boxGeometry args={[0.022, radius * 0.72, 0.01]} />
          <meshLambertMaterial color="#3f7d5c" />
        </mesh>
      </group>
    </group>
  )
}

/** A wall-mounted fan (quạt treo tường), always turning. Faces +Z. */
export function WallFan({ position, rotation = [0, 0, 0] }: { position: Vec3; rotation?: Vec3 }) {
  const blades = useRef<Group>(null)
  const body = useMemo<ShapeItem[]>(
    () => [
      { box: [0.12, 0.12, 0.08], at: [0, 0, -0.08], color: '#e9eef5' },
      { cyl: [0.03, 0.03, 0.18, 8], at: [0, 0, 0.02], rot: [Math.PI / 2, 0, 0], color: '#e9eef5' },
      { cyl: [0.11, 0.13, 0.16, 12], at: [0, 0, 0.14], rot: [Math.PI / 2, 0, 0], color: '#7fb8e8' },
      { torus: [0.3, 0.012, 6, 24], at: [0, 0, 0.24], color: '#f2f6fa' },
      { torus: [0.3, 0.012, 6, 24], at: [0, 0, 0.32], color: '#f2f6fa' },
    ],
    [],
  )
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z -= dt * 14
  })
  return (
    <group position={position} rotation={rotation}>
      <Shapes shapes={body} castShadow={false} />
      <group ref={blades} position={[0, 0, 0.28]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0.25, (i * Math.PI * 2) / 3]} position={[Math.cos((i * Math.PI * 2) / 3) * 0.13, Math.sin((i * Math.PI * 2) / 3) * 0.13, 0]}>
            <boxGeometry args={[0.24, 0.1, 0.01]} />
            <meshLambertMaterial color="#a9d6ff" transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Tear-off wall calendar (lịch bloc) showing today's in-game date. */
export function TearCalendar({ position, rotation = [0, 0, 0], width = 0.42 }: { position: Vec3; rotation?: Vec3; width?: number }) {
  const day = useTime((s) => s.day)
  const language = useSettings((s) => s.language)
  const options = useMemo<SignOptions>(() => {
    const d = dateOf(day)
    const weekday = translate(language, `weekday.${weekdayIndex(day)}` as I18nKey)
    return {
      title: String(d.day),
      subtitle: `${weekday} · ${String(d.month).padStart(2, '0')}/${d.year}`,
      background: '#fffaf2',
      border: weekdayIndex(day) === 6 ? '#c8322b' : '#3f7d5c',
      color: weekdayIndex(day) === 6 ? '#c8322b' : '#2f3a4d',
      accent: '#c8322b',
      aspect: 0.8,
    }
  }, [day, language])
  const back = useMemo<ShapeItem[]>(
    () => [
      { box: [width + 0.08, width / 0.8 + 0.14, 0.03], at: [0, 0.03, -0.02], color: '#c8322b' },
      { box: [width * 0.5, 0.05, 0.035], at: [0, width / 1.6 + 0.08, -0.005], color: '#f4c04e' },
    ],
    [width],
  )
  return (
    <group position={position} rotation={rotation}>
      <Shapes shapes={back} castShadow={false} />
      <SignBoard options={options} width={width} position={[0, 0, 0.002]} />
    </group>
  )
}
