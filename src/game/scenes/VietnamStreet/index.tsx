import { memo } from 'react'
import { PALETTE as P } from '../shared/palette'
import { PowerLines } from '../shared/PowerLines'
import { Backdrop } from './Backdrop'
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

const HOME_PALETTE: HousePalette = {
  wall: '#ffe3a3',
  trim: P.white,
  shutter: '#8fd3c1',
  railing: '#5f9e8f',
  accent: P.coral,
}

const GROCERY_SIGN: SignOptions = {
  title: 'TẠP HÓA CÔ BA',
  subtitle: 'Bia · Nước ngọt · Mì gói · Bánh kẹo',
  background: '#d4473b',
  border: '#f4c04e',
  color: '#ffe08a',
  accent: '#ffffff',
  aspect: 7,
}

const NEIGHBOR_PALETTE: HousePalette = {
  wall: '#ffc9d2',
  trim: P.cream,
  shutter: '#a9c8f5',
  railing: '#7b8fc4',
  accent: P.butter,
}

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
        roofTank
        bougainvillea
        airCon
      />
      <TubeHouse
        position={[NEIGHBOR.x, 0, BUILDING_CENTER_Z]}
        width={NEIGHBOR.width}
        depth={BUILDING_DEPTH}
        floors={NEIGHBOR.floors}
        palette={NEIGHBOR_PALETTE}
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
      <Backdrop />
    </group>
  )
})

export default VietnamStreet
