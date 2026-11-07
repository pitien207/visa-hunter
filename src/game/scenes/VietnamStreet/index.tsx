import { memo } from 'react'
import { PALETTE as P } from '../shared/palette'
import { PowerLines } from '../shared/PowerLines'
import { Backdrop } from './Backdrop'
import { HoGuom } from './HoGuom'
import { Boundaries } from './Boundaries'
import { Cafe } from './Cafe'
import { CafeJob } from './CafeJob'
import {
  BUILDING_CENTER_Z,
  BUILDING_DEPTH,
  CAFE,
  HOME,
  NEIGHBOR,
  POLE_DROPS,
  POLE_SPANS,
  POLES,
} from './layout'
import { StreetGround } from './StreetGround'
import { StoryPlaces } from './StoryPlaces'
import { StreetLife } from './StreetLife'
import { StreetProps } from './StreetProps'
import type { SignOptions } from '../shared/textures'
import { TubeHouse, type HousePalette } from './TubeHouse'

/** "Vàng Hà Nội": ochre walls, green wooden shutters, dark green ironwork. */
const HOME_PALETTE: HousePalette = {
  wall: '#f2c46d',
  trim: '#fff3d6',
  shutter: '#3f7d5c',
  railing: '#2c5c43',
  accent: '#c8322b',
}

const GROCERY_SIGN: SignOptions = {
  title: 'TẠP HÓA CÔ LIÊN',
  subtitle: 'Bia · Nước ngọt · Mì tôm · Bánh kẹo',
  background: '#d4473b',
  border: '#f4c04e',
  color: '#ffe08a',
  accent: '#ffffff',
  aspect: 7,
}

const NEIGHBOR_PALETTE: HousePalette = {
  wall: '#f4dfae',
  trim: P.cream,
  shutter: '#4f8a8b',
  railing: '#2f5f60',
  accent: P.butter,
}

/** Distant Old Quarter blocks: ochre, cream and faded pastel walls under tiled roofs. */
const HANOI_BACKDROP = ['#f2c46d', '#f4dfae', '#e8b04a', '#f6e7c4', '#d9c6a1', '#f0b9a0', '#cfe0c8']

/**
 * Chapter 1 hub: a Vietnamese street corner with the family tube house and a café.
 * Memoized with no props, so HUD/settings changes never rebuild the scene.
 */
export const VietnamStreet = memo(function VietnamStreet() {
  return (
    <group>
      <StreetGround />
      <TubeHouse
        position={[HOME.x, 0, BUILDING_CENTER_Z]}
        width={HOME.width}
        depth={BUILDING_DEPTH}
        floors={HOME.floors}
        palette={HOME_PALETTE}
        oldQuarter
        flag
        bougainvillea
        airCon
      />
      <TubeHouse
        position={[NEIGHBOR.x, 0, BUILDING_CENTER_Z]}
        width={NEIGHBOR.width}
        depth={BUILDING_DEPTH}
        floors={NEIGHBOR.floors}
        palette={NEIGHBOR_PALETTE}
        oldQuarter
        flag
        roofTank
        airCon
        grocery
        sign={GROCERY_SIGN}
      />
      <Cafe position={[CAFE.x, 0, CAFE.z]} />
      <CafeJob />
      <StreetProps />
      <StreetLife />
      <StoryPlaces />
      <PowerLines poles={POLES} spans={POLE_SPANS} drops={POLE_DROPS} />
      <Boundaries />
      <HoGuom />
      <Backdrop lake colors={HANOI_BACKDROP} roof="#c8653d" />
    </group>
  )
})

export default VietnamStreet
