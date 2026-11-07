import { TASKS } from '../../../data/tasks'
import { useWork } from '../../../store/workStore'
import { InteractableHitArea, InteractMarker } from '../../components/Interactable'
import { RecipeCup } from '../../components/RecipeCup'
import { WorkCustomers } from '../../components/WorkCustomers'
import { WorkStation } from '../../components/WorkStation'
import type { PointXZ, ZoneXZ } from '../../systems/playerState'
import { CAFE, CAFE_INTERIOR, cafeToWorld } from './layout'

const TASK = TASKS.cafeBarista
const STATION_ID = 'cafe-counter'
const { counter, workSpot, customerSpot, door, aisleX, aisleFrontZ } = CAFE_INTERIOR

/** Around the counter (front and back), including the aisle at its left end. */
const ZONE: ZoneXZ = (() => {
  const minX = -1.8
  const maxX = 2.9
  const minZ = -2.4
  const maxZ = 1.7
  const c = cafeToWorld({ x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 })
  return { x: c.x, z: c.z, halfX: (maxX - minX) / 2, halfZ: (maxZ - minZ) / 2 }
})()

const SPOT = cafeToWorld(workSpot)

/** Walk around the counter's left end instead of through it. */
function approachCounter(from: PointXZ): PointXZ[] {
  const lx = from.x - CAFE.x
  const lz = from.z - CAFE.z
  const backZ = counter.z - counter.d / 2 - 0.1
  const counterLeft = counter.x - counter.w / 2 - 0.1
  const path: PointXZ[] = []
  if (lz > backZ) {
    if (lx > counterLeft) path.push({ x: aisleX, z: Math.min(0.6, Math.max(aisleFrontZ, lz)) })
    path.push({ x: aisleX, z: workSpot.z })
  }
  path.push(workSpot)
  return path.map(cafeToWorld)
}

/** The barista part-time job at the café counter (M2's first WorkStation). */
export function CafeJob() {
  const idle = useWork((s) => s.session === null)

  return (
    <>
      <WorkStation
        task={TASK}
        id={STATION_ID}
        nameKey="interact.cafeCounter"
        zone={ZONE}
        spot={SPOT}
        approach={approachCounter}
        faceYaw={0}
        // 3/4 view from the front-left: barista and customer both in frame.
        cameraYaw={-0.75}
      />
      <group position={[CAFE.x, 0, CAFE.z]}>
        <InteractableHitArea id={STATION_ID} position={[counter.x, 0.65, counter.z]} size={[counter.w + 0.2, 1.3, 1.0]} />
        <InteractMarker id={STATION_ID} position={[workSpot.x, 1.9, counter.z]} visible={idle} />
        {/* A second pin above the sign so the job is visible from the street. */}
        <InteractMarker id={STATION_ID} position={[0, 5.15, 2.9]} visible={idle} />
        <RecipeCup task={TASK} position={[workSpot.x, 1.08, counter.z + 0.05]} />
        <WorkCustomers taskId={TASK.id} door={door} spot={customerSpot} />
      </group>
    </>
  )
}
