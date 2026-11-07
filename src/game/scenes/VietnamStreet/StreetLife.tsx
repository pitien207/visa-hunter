import { useMemo } from 'react'
import { CONFIG } from '../../../data/config'
import { NPCS } from '../../../data/npcs'
import type { ContextAction } from '../../../store/interactionStore'
import { useUI } from '../../../store/uiStore'
import { ChatterDirector } from '../../components/npc/ChatterDirector'
import { DaCauKids } from '../../components/npc/DaCauKids'
import { NPC } from '../../components/npc/NPC'
import { Traffic } from '../../components/npc/Traffic'
import { PALETTE as P } from '../shared/palette'
import { place, stoolShapes } from '../shared/props'
import { Shapes } from '../shared/Shapes'
import { HomeDoor } from './HomeDoor'
import { GROCERY, KIDS, TRAFFIC_LANES, VENDOR_PATH, WALKER_PATHS } from './layout'
import { TraDaStall } from './TraDaStall'

const STOOL_TOP = 0.33

const SHOP_ACTION: ContextAction[] = [
  { id: 'shop', labelKey: 'action.shop', icon: 'shop', onPress: () => useUI.getState().openPanel({ type: 'shop', shopId: 'taphoa' }) },
]

const COBA_STOOL = [place(stoolShapes(P.coral), [GROCERY.coBa.x, 0, GROCERY.coBa.z])]

/** Everyone who makes the street feel alive. */
export function StreetLife() {
  const coBaStool = useMemo(() => COBA_STOOL, [])

  return (
    <>
      <TraDaStall />
      <HomeDoor />

      {/* Cô Liên fans herself in front of her grocery */}
      <Shapes shapes={coBaStool} />
      <NPC def={NPCS.coBa} at={GROCERY.coBa} yaw={0.15} seatY={STOOL_TOP} activity="fan" zone={GROCERY.zone} extraActions={SHOP_ACTION} />

      {/* Chú Bình strolls with his shoulder pole of bánh mì */}
      <NPC
        def={NPCS.chuBay}
        at={VENDOR_PATH[0]}
        carry="pole"
        path={{ points: VENDOR_PATH, speed: CONFIG.npc.vendorSpeed, pauseSec: [2.5, 6] }}
      />

      {/* Passers-by */}
      <NPC def={NPCS.coHoa} at={WALKER_PATHS.coHoa[0]} path={{ points: WALKER_PATHS.coHoa, pauseSec: [0.5, 3] }} />
      <NPC def={NPCS.anhKhoa} at={WALKER_PATHS.anhKhoa[1]} path={{ points: WALKER_PATHS.anhKhoa, pauseSec: [1, 4] }} />
      <NPC def={NPCS.chiLan} at={WALKER_PATHS.chiLan[0]} path={{ points: WALKER_PATHS.chiLan, pauseSec: [0.5, 2.5] }} />

      <DaCauKids a={KIDS.a} b={KIDS.b} kidA={NPCS.beTi} kidB={NPCS.beNa} />
      <Traffic lanes={TRAFFIC_LANES} perLane={2} />

      <ChatterDirector groups={['traDa']} solos={['chuBay', 'coBa', 'coHoa', 'anhKhoa', 'chiLan']} />
    </>
  )
}
