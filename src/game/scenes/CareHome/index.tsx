import { memo, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CARE_ACTIONS, RESIDENTS, type ResidentDef } from '../../../data/care'
import { getNpc, NPCS } from '../../../data/npcs'
import { useCare } from '../../../store/careStore'
import type { ContextAction, InteractableDef } from '../../../store/interactionStore'
import { useUI } from '../../../store/uiStore'
import { ActionIcon } from '../../../ui/ActionIcon'
import { ActionSpot, type SpotAction } from '../../components/ActionSpot'
import { useInteractable } from '../../components/Interactable'
import { NPC } from '../../components/npc/NPC'
import { PALETTE as P } from '../shared/palette'
import { place, plantShapes } from '../shared/props'
import { Room } from '../shared/Room'
import type { ShapeItem } from '../shared/Shapes'
import { SignBoard } from '../shared/SignBoard'
import type { SignOptions } from '../shared/textures'

/** Pflegeheim Sonnenhof (M7): the common room where a care workday happens. */

const W = 11
const D = 8
const STYLE = { wall: '#f6f0e6', wallLow: '#e9dfcf', floor: '#cfe3d4', floorAlt: '#bfd8c6', trim: '#ffffff', window: '#d6eef8' }
const SIGN: SignOptions = {
  title: 'Pflegeheim Sonnenhof',
  subtitle: 'Herzlich willkommen · Chào mừng',
  background: '#fff6e3',
  border: '#f4c04e',
  color: '#2f8c7f',
  accent: '#d4473b',
  aspect: 4.5,
}

function armchair(r: ResidentDef): ShapeItem[] {
  const { x, z } = r.at
  if (r.wheelchair) {
    return [
      { box: [0.55, 0.06, 0.5], at: [x, 0.5, z], color: '#5b7cc4' },
      { box: [0.55, 0.55, 0.06], at: [x - Math.sin(r.yaw) * 0.25, 0.8, z - Math.cos(r.yaw) * 0.25], rot: [0, r.yaw, 0], color: '#5b7cc4' },
      { torus: [0.3, 0.03, 6, 18], at: [x + Math.cos(r.yaw) * 0.32, 0.32, z - Math.sin(r.yaw) * 0.32], rot: [0, r.yaw + Math.PI / 2, 0], color: P.darkSteel },
      { torus: [0.3, 0.03, 6, 18], at: [x - Math.cos(r.yaw) * 0.32, 0.32, z + Math.sin(r.yaw) * 0.32], rot: [0, r.yaw + Math.PI / 2, 0], color: P.darkSteel },
    ]
  }
  return [
    { box: [0.75, 0.3, 0.7], at: [x, 0.3, z], rot: [0, r.yaw, 0], color: '#c97b63' },
    { box: [0.75, 0.6, 0.15], at: [x - Math.sin(r.yaw) * 0.3, 0.7, z - Math.cos(r.yaw) * 0.3], rot: [0, r.yaw, 0], color: '#c97b63' },
  ]
}

function furniture(): ShapeItem[] {
  const s: ShapeItem[] = RESIDENTS.flatMap(armchair)
  // Nurses' station, tables with flowers, TV, shelf
  s.push({ box: [2.4, 1.0, 0.7], at: [3.6, 0.5, -3.1], color: '#a8e6cf' })
  s.push({ box: [2.5, 0.06, 0.8], at: [3.6, 1.02, -3.1], color: P.white })
  for (const [x, z] of [
    [-2.7, 0.2],
    [2.75, 0.05],
  ]) {
    s.push({ cyl: [0.5, 0.5, 0.05, 16], at: [x, 0.7, z], color: P.white })
    s.push({ cyl: [0.05, 0.05, 0.68, 6], at: [x, 0.35, z], color: P.darkSteel })
    s.push({ cyl: [0.07, 0.06, 0.18, 8], at: [x, 0.82, z], color: '#a9d6ff' })
    s.push({ ico: [0.12], at: [x, 0.98, z], color: P.blossom })
  }
  s.push({ box: [1.6, 0.9, 0.08], at: [-0.5, 1.9, -3.95], color: '#2f2f38' })
  s.push({ box: [1.5, 0.8, 0.02], at: [-0.5, 1.9, -3.9], color: '#7fb8e8' })
  s.push({ box: [1.4, 1.6, 0.4], at: [-4.8, 0.8, -3.6], color: P.wood })
  s.push(place(plantShapes(P.leafDark, P.white), [-5.0, 0, 3.0], 0, 1.4))
  return s
}

/** One resident: chibi in their chair, need bubble with a patience ring, care buttons. */
function Resident({ def, index }: { def: ResidentDef; index: number }) {
  const npc = getNpc(def.npc)
  const need = useCare((s) => s.session?.residents[index]?.need ?? null)
  const patience = useCare((s) => {
    const r = s.session?.residents[index]
    return r?.need ? Math.round((r.patience / r.patienceMax) * 20) / 20 : 0
  })
  const mood = useCare((s) => s.session?.residents[index]?.mood ?? null)
  const moodKey = useCare((s) => s.session?.residents[index]?.moodKey ?? 0)
  const working = useCare((s) => s.session?.phase === 'working')

  const actions = useMemo<ContextAction[]>(
    () =>
      working
        ? def.actions.map((a) => ({
            id: a,
            labelKey: CARE_ACTIONS[a].labelKey,
            icon: CARE_ACTIONS[a].icon,
            onPress: () => useCare.getState().act(index, a),
          }))
        : [],
    [working, def, index],
  )
  const zone = useMemo(() => ({ x: def.at.x, z: def.at.z, halfX: 1.15, halfZ: 1.15 }), [def])
  const interactable = useMemo<InteractableDef | null>(
    () => (npc ? { id: `resident:${def.npc}`, name: npc.name, zone, actions, priority: 3 } : null),
    [npc, def.npc, zone, actions],
  )
  useInteractable(interactable)
  if (!npc) return null

  return (
    <>
      <NPC def={{ ...npc, dialogueId: undefined }} at={def.at} yaw={def.yaw} seatY={def.wheelchair ? 0.52 : 0.45} />
      {(need || mood) && (
        <Html position={[def.at.x, 2.15, def.at.z]} center distanceFactor={9} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
          {need ? (
            <div
              className="animate-bubble grid h-14 w-14 place-items-center rounded-full text-[30px] shadow-lg"
              style={{ background: `conic-gradient(${patience > 0.35 ? '#2f8c7f' : '#d4473b'} ${patience * 360}deg, #f1dcb6 0deg)` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white">
                <ActionIcon name={CARE_ACTIONS[need].icon} />
              </span>
            </div>
          ) : (
            <div key={moodKey} className="animate-emote text-3xl">
              {mood === 'happy' ? '💖' : '💢'}
            </div>
          )}
        </Html>
      )}
    </>
  )
}

/** Advances the workday clock while a shift runs (paused by the settings menu). */
function ShiftRunner() {
  useFrame((_, dt) => {
    const s = useCare.getState().session
    if (!s || s.phase !== 'working' || useUI.getState().settingsOpen) return
    useCare.getState().tick(Math.min(dt, 0.1))
  })
  return null
}

const EXIT: SpotAction[] = [{ id: 'tram', labelKey: 'action.tramHome', icon: 'tram', action: 'de.tram', arg: 'germany', primary: true }]

const CareHome = memo(function CareHome() {
  const shapes = useMemo(furniture, [])
  const blockers = useMemo<[number, number, number, number][]>(
    () => [...RESIDENTS.map((r): [number, number, number, number] => [r.at.x, r.at.z, 0.4, 0.4]), [3.6, -3.1, 1.2, 0.4], [-2.7, 0.2, 0.5, 0.5], [2.75, 0.05, 0.5, 0.5], [-4.8, -3.6, 0.7, 0.25]],
    [],
  )
  return (
    <>
      <Room w={W} d={D} style={STYLE} windows={[-3.2, 2.2]} furniture={shapes} blockers={blockers} />
      <SignBoard options={SIGN} width={3.2} position={[2.2, 2.75, -3.98]} />
      <NPC def={NPCS.anna} at={{ x: 3.6, z: -2.4 }} yaw={0} zone={{ x: 3.6, z: -1.5, halfX: 1.5, halfZ: 0.9 }} />
      {RESIDENTS.map((r, i) => (
        <Resident key={r.npc} def={r} index={i} />
      ))}
      <ShiftRunner />
      <ActionSpot id="care-exit" nameKey="interact.tramStop" zone={{ x: -4.6, z: 3.2, halfX: 1.0, halfZ: 0.8 }} actions={EXIT} />
    </>
  )
})

export default CareHome
