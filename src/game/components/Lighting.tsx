import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, Fog, type DirectionalLight, type HemisphereLight } from 'three'
import { CONFIG } from '../../data/config'
import { useSettings } from '../../store/settingsStore'
import { useTime } from '../../store/timeStore'
import { useWorld } from '../../store/worldStore'
import { SCENES } from '../scenes/registry'
import { createSkyState, skyAt } from '../systems/daylight'
import { setRainAmbience } from '../systems/audio'
import { isRaining, petalsWanted, weatherState } from '../systems/weather'

// Indoors: a warm, fixed light and a dark "diorama" backdrop around the room.
const INDOOR = {
  background: new Color('#2f2938'),
  hemiSky: new Color('#fff3e2'),
  hemiGround: new Color('#c9b8e0'),
  sun: new Color('#fff1e0'),
}

const SHADOW_EXTENT = 22

// Rainy days: a flat grey sky, closer fog, a weaker sun.
const RAIN_SKY = new Color('#a9b4c2')
const RAIN_FOG = new Color('#b9c2cc')

/** Ease weather values toward their targets (minutes-scale changes, not instant). */
function updateWeather(dt: number, indoor: boolean) {
  const { day, minutes } = useTime.getState()
  const country = SCENES[useWorld.getState().scene].country
  const raining = isRaining(day, minutes, country)
  const k = 1 - Math.exp(-dt * 0.8)
  weatherState.rainOutside += ((raining ? 1 : 0) - weatherState.rainOutside) * k
  weatherState.rain += ((raining && !indoor ? 1 : 0) - weatherState.rain) * k
  weatherState.petals += ((!indoor && petalsWanted(minutes, country, raining) ? 1 : 0) - weatherState.petals) * k
  setRainAmbience(weatherState.rainOutside * (indoor ? 0.35 : 1))
}

/** Sun/moon + sky fill, driven by the in-game clock. Shadows are soft and light (toy look). */
export function Lighting() {
  const quality = useSettings((s) => s.quality)
  const mapSize = CONFIG.graphics[quality].shadowMapSize
  const scene = useThree((s) => s.scene)
  const hemi = useRef<HemisphereLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const sky = useRef(createSkyState())

  useFrame((_, rawDt) => {
    const indoor = SCENES[useWorld.getState().scene].indoor
    updateWeather(Math.min(rawDt, 0.1), indoor)
    if (indoor) {
      if (scene.background instanceof Color) scene.background.copy(INDOOR.background)
      if (scene.fog instanceof Fog) {
        scene.fog.color.copy(INDOOR.background)
        scene.fog.near = 22
        scene.fog.far = 45
      }
      if (hemi.current) {
        hemi.current.color.copy(INDOOR.hemiSky)
        hemi.current.groundColor.copy(INDOOR.hemiGround)
        hemi.current.intensity = 2.2
      }
      if (sun.current) {
        sun.current.color.copy(INDOOR.sun)
        sun.current.intensity = 2.0
        sun.current.position.set(5, 16, 11)
      }
      return
    }
    const s = skyAt(useTime.getState().minutes / 60, sky.current)
    const rain = weatherState.rain
    // Darker skies stay dark at night: only blend toward grey as much as the sky is bright.
    const grey = rain * 0.55 * Math.min(1, s.sunI / 1.5)
    if (scene.background instanceof Color) scene.background.copy(s.sky).lerp(RAIN_SKY, grey)
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(s.fog).lerp(RAIN_FOG, grey)
      scene.fog.near = 30 - rain * 8
      scene.fog.far = 80 - rain * 22
    }
    if (hemi.current) {
      hemi.current.color.copy(s.hemiSky)
      hemi.current.groundColor.copy(s.hemiGround)
      hemi.current.intensity = s.hemi * (1 - rain * 0.18)
    }
    if (sun.current) {
      sun.current.color.copy(s.sun)
      sun.current.intensity = s.sunI * (1 - rain * 0.6)
      sun.current.position.set(...s.lightPos)
      sun.current.shadow.intensity = 0.55 * (1 - rain * 0.6)
    }
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff6ea', '#d6c8ff', 2.1]} />
      <directionalLight
        ref={sun}
        // Re-mount when the shadow map size changes so three allocates a new map.
        key={mapSize}
        position={[11, 20, 9]}
        intensity={2.6}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={4}
        shadow-intensity={0.55}
      />
    </>
  )
}
