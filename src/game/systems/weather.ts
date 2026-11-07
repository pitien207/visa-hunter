import { CONFIG } from '../../data/config'

export type Country = 'vn' | 'de'

/** Smoothed weather values (0–1), written by <Lighting /> every frame and read by effects. */
export const weatherState = {
  /** Rain on screen (0 indoors). */
  rain: 0,
  /** Rain outside, also while indoors (for the muffled sound). */
  rainOutside: 0,
  /** Falling petals in Vietnam. */
  petals: 0,
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Deterministic per day, so a reload doesn't change the weather. */
export function isRainyDay(day: number, country: Country) {
  return hash(day * 7 + (country === 'de' ? 3 : 1)) < CONFIG.weather.rainChance[country]
}

/** Is it raining right now? German rain lasts all day, Hà Nội gets a morning drizzle (mưa phùn). */
export function isRaining(day: number, minutes: number, country: Country) {
  if (!isRainyDay(day, country)) return false
  if (country === 'de') return true
  const h = minutes / 60
  const [from, to] = CONFIG.weather.vnShowerHours
  return h >= from && h < to
}

export function petalsWanted(minutes: number, country: Country, raining: boolean) {
  const h = minutes / 60
  const [from, to] = CONFIG.weather.petalHours
  return country === 'vn' && !raining && h >= from && h < to
}
