import type { Localized } from '../i18n/localized'
import { CONFIG } from './config'
import { SHOPS } from './shops'

/**
 * Opening hours shown in the clock panel (only places whose hours the game enforces).
 * Weekdays: 0 = Monday … 6 = Sunday.
 */
export interface PlaceHours {
  id: string
  icon: string
  name: Localized
  country: 'vn' | 'de'
  hours: [number, number]
  closedDays?: number[]
}

const shopHours = (id: keyof typeof SHOPS): [number, number] => ((SHOPS[id] as { hours?: [number, number] }).hours ?? [0, 24])

export const SCHEDULE: PlaceHours[] = [
  { id: 'cafe', icon: '☕', country: 'vn', name: { vi: 'Cà phê Phố Cổ (làm ca)', en: 'Old Quarter café (shifts)', de: 'Altstadt-Café (Schichten)' }, hours: [CONFIG.jobs.cafeBarista.openHour, CONFIG.jobs.cafeBarista.closeHour] },
  { id: 'school', icon: '🏫', country: 'vn', name: { vi: 'Trung tâm tiếng Đức', en: 'German centre', de: 'Deutschzentrum' }, hours: CONFIG.school.hours },
  { id: 'embassy', icon: '🛂', country: 'vn', name: { vi: 'Đại sứ quán Đức', en: 'German Embassy', de: 'Deutsche Botschaft' }, hours: CONFIG.visa.embassyHours },
  { id: 'buergeramt', icon: '🏛️', country: 'de', name: { vi: 'Bürgeramt', en: 'Bürgeramt', de: 'Bürgeramt' }, hours: CONFIG.germany.officeHours, closedDays: [5, 6] },
  { id: 'supermarkt', icon: '🛒', country: 'de', name: { vi: 'Siêu thị', en: 'Supermarket', de: 'Supermarkt' }, hours: shopHours('supermarkt'), closedDays: [6] },
  { id: 'baeckerei', icon: '🥨', country: 'de', name: { vi: 'Tiệm bánh', en: 'Bakery', de: 'Bäckerei' }, hours: shopHours('baeckerei') },
  { id: 'imbiss', icon: '🥙', country: 'de', name: { vi: 'Quán Döner', en: 'Döner stand', de: 'Dönerladen' }, hours: shopHours('imbiss') },
  { id: 'care', icon: '🩺', country: 'de', name: { vi: 'Vào ca ở viện dưỡng lão', en: 'Care-home shift start', de: 'Schichtbeginn Pflegeheim' }, hours: CONFIG.care.startHours },
]

export function isOpen(place: PlaceHours, weekday: number, hour: number) {
  if (place.closedDays?.includes(weekday)) return false
  return hour >= place.hours[0] && hour < place.hours[1]
}
