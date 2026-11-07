import { Color } from 'three'

/**
 * Sky and light colours over the day, as keyframes by hour. Night stays bright enough
 * to play: a soft moonlit blue, with lamps and string lights standing out.
 */

interface SkyKey {
  h: number
  sky: string
  fog: string
  hemiSky: string
  hemiGround: string
  hemi: number
  sun: string
  sunI: number
}

const NIGHT: Omit<SkyKey, 'h'> = {
  sky: '#2c3a6b',
  fog: '#34437a',
  hemiSky: '#8a98dc',
  hemiGround: '#40395a',
  hemi: 1.25,
  sun: '#a9b8ff',
  sunI: 0.55,
}
const DAY: Omit<SkyKey, 'h'> = {
  sky: '#bfe3ff',
  fog: '#d8ecff',
  hemiSky: '#fff6ea',
  hemiGround: '#d6c8ff',
  hemi: 2.1,
  sun: '#fff0dc',
  sunI: 2.6,
}

const KEYS: SkyKey[] = [
  { h: 0, ...NIGHT },
  { h: 4.8, ...NIGHT },
  { h: 5.25, sky: '#7d78b8', fog: '#8f86c0', hemiSky: '#c2b4e8', hemiGround: '#5a4c78', hemi: 1.4, sun: '#ffc0a0', sunI: 0.5 },
  { h: 6.2, sky: '#ffc9b0', fog: '#ffd9c4', hemiSky: '#ffe2cc', hemiGround: '#c9b8e8', hemi: 1.7, sun: '#ffc896', sunI: 1.5 },
  { h: 8, ...DAY },
  { h: 16, ...DAY },
  { h: 17.6, sky: '#ffc49b', fog: '#ffd6b8', hemiSky: '#ffe2c6', hemiGround: '#d9b8d8', hemi: 1.9, sun: '#ffb070', sunI: 2.2 },
  { h: 18.75, sky: '#d58aa0', fog: '#d9a0b4', hemiSky: '#e8b8d0', hemiGround: '#6a5480', hemi: 1.5, sun: '#e89ab0', sunI: 0.5 },
  { h: 19.6, sky: '#6a64a8', fog: '#7670b0', hemiSky: '#a8a0e0', hemiGround: '#4a4068', hemi: 1.3, sun: '#b0b0f0', sunI: 0.5 },
  { h: 21, ...NIGHT },
  { h: 24, ...NIGHT },
]

const toColors = (k: SkyKey) => ({
  h: k.h,
  sky: new Color(k.sky),
  fog: new Color(k.fog),
  hemiSky: new Color(k.hemiSky),
  hemiGround: new Color(k.hemiGround),
  hemi: k.hemi,
  sun: new Color(k.sun),
  sunI: k.sunI,
})
const COLOR_KEYS = KEYS.map(toColors)

export interface SkyState {
  sky: Color
  fog: Color
  hemiSky: Color
  hemiGround: Color
  hemi: number
  sun: Color
  sunI: number
  /** Light position (sun by day, moon by night). */
  lightPos: [number, number, number]
}

/** Writes the sky for `hour` (0–24) into `out` (reused every frame, no allocations). */
export function skyAt(hour: number, out: SkyState): SkyState {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < COLOR_KEYS.length - 2 && COLOR_KEYS[i + 1].h <= h) i++
  const a = COLOR_KEYS[i]
  const b = COLOR_KEYS[i + 1]
  const t = (h - a.h) / Math.max(1e-6, b.h - a.h)
  out.sky.lerpColors(a.sky, b.sky, t)
  out.fog.lerpColors(a.fog, b.fog, t)
  out.hemiSky.lerpColors(a.hemiSky, b.hemiSky, t)
  out.hemiGround.lerpColors(a.hemiGround, b.hemiGround, t)
  out.sun.lerpColors(a.sun, b.sun, t)
  out.hemi = a.hemi + (b.hemi - a.hemi) * t
  out.sunI = a.sunI + (b.sunI - a.sunI) * t

  // Sun arcs east → west from 05:15 to 18:45; the moon takes over at night.
  // The swap happens when the light is dim, so the shadow jump is hard to notice.
  const isDay = h >= 5.25 && h < 18.75
  const u = isDay ? (h - 5.25) / 13.5 : (((h - 18.75 + 24) % 24) / 10.5)
  const angle = u * Math.PI
  out.lightPos[0] = Math.cos(angle) * 14
  out.lightPos[1] = Math.max(Math.sin(angle), 0.32) * 20
  out.lightPos[2] = 9
  return out
}

export function createSkyState(): SkyState {
  return {
    sky: new Color(),
    fog: new Color(),
    hemiSky: new Color(),
    hemiGround: new Color(),
    hemi: 1,
    sun: new Color(),
    sunI: 1,
    lightPos: [0, 20, 9],
  }
}
