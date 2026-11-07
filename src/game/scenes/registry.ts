import type { ComponentType } from 'react'
import type { Localized } from '../../i18n/localized'
import type { SceneId } from '../../store/worldStore'

export interface SpawnPoint {
  x: number
  z: number
  /** Camera yaw on arrival. */
  yaw: number
}

export interface SceneInfo {
  id: SceneId
  country: 'vn' | 'de'
  /** Indoor scenes use fixed warm lighting instead of the day/night sky. */
  indoor: boolean
  name: Localized
  spawns: { default: SpawnPoint } & Record<string, SpawnPoint>
  /** Camera distance multiplier (rooms are viewed a little closer). */
  cameraZoom?: number
  /** Place-name plaque shown when you arrive (street sign style per country). */
  plaque: { style: 'hanoi' | 'german' | 'room'; title: Localized; subtitle?: Localized }
  /** Each scene is its own code chunk, loaded on first visit (plan §3: lazy-load each scene). */
  load: () => Promise<{ default: ComponentType }>
}

export const SCENES: Record<SceneId, SceneInfo> = {
  vietnam: {
    id: 'vietnam',
    country: 'vn',
    indoor: false,
    name: { vi: 'Phố Hàng Gai, Hà Nội', en: 'Hàng Gai Street, Hanoi', de: 'Hàng-Gai-Straße, Hanoi' },
    plaque: { style: 'hanoi', title: { vi: 'PHỐ HÀNG GAI', en: 'HÀNG GAI STREET', de: 'HÀNG-GAI-STRASSE' }, subtitle: { vi: 'Q. Hoàn Kiếm · Hà Nội', en: 'Hoàn Kiếm · Hanoi', de: 'Hoàn Kiếm · Hanoi' } },
    spawns: {
      default: { x: -5.5, z: -2.6, yaw: 0 },
      xeOm: { x: 8.4, z: 0.6, yaw: 0 },
      home: { x: -5.5, z: -3.2, yaw: 0 },
      center: { x: -1.1, z: -11.0, yaw: 0 },
    },
    load: () => import('./VietnamStreet'),
  },
  home: {
    id: 'home',
    country: 'vn',
    indoor: true,
    name: { vi: 'Nhà mình', en: 'Home', de: 'Zuhause' },
    plaque: { style: 'room', title: { vi: 'Nhà mình', en: 'Home', de: 'Zuhause' }, subtitle: { vi: 'Số 12, ngõ Hàng Gai', en: 'No. 12, Hàng Gai lane', de: 'Nr. 12, Hàng-Gai-Gasse' } },
    spawns: { default: { x: 3.4, z: 2.4, yaw: 0 }, bed: { x: -2.2, z: -0.7, yaw: 0 } },
    cameraZoom: 0.8,
    load: () => import('./Home'),
  },
  classroom: {
    id: 'classroom',
    country: 'vn',
    indoor: true,
    name: { vi: 'Lớp tiếng Đức Thầy Minh', en: 'Teacher Minh’s German class', de: 'Deutschkurs bei Lehrer Minh' },
    plaque: { style: 'room', title: { vi: 'Trung tâm Đức ngữ', en: 'German language centre', de: 'Deutsches Sprachzentrum' }, subtitle: { vi: 'Phòng 2 · Lớp Thầy Minh', en: 'Room 2 · Teacher Minh', de: 'Raum 2 · Lehrer Minh' } },
    spawns: { default: { x: 4.6, z: 2.7, yaw: 0 } },
    cameraZoom: 0.82,
    load: () => import('./Classroom'),
  },
  examHall: {
    id: 'examHall',
    country: 'vn',
    indoor: true,
    name: { vi: 'Phòng thi tiếng Đức', en: 'German exam room', de: 'Prüfungsraum' },
    plaque: { style: 'room', title: { vi: 'Phòng thi', en: 'Exam room', de: 'Prüfungsraum' }, subtitle: { vi: 'Kỳ thi tiếng Đức · Deutschprüfung', en: 'German exam · Deutschprüfung', de: 'Deutschprüfung' } },
    spawns: { default: { x: 4.6, z: 2.7, yaw: 0 } },
    cameraZoom: 0.82,
    load: () => import('./ExamHall'),
  },
  embassy: {
    id: 'embassy',
    country: 'vn',
    indoor: true,
    name: { vi: 'Đại sứ quán Đức', en: 'German Embassy', de: 'Deutsche Botschaft' },
    plaque: { style: 'room', title: { vi: 'Đại sứ quán Đức', en: 'German Embassy', de: 'Deutsche Botschaft' }, subtitle: { vi: 'Phòng visa · Hà Nội', en: 'Visa section · Hanoi', de: 'Visastelle · Hanoi' } },
    spawns: { default: { x: 0, z: 2.6, yaw: 0 } },
    cameraZoom: 0.8,
    load: () => import('./Embassy'),
  },
  airport: {
    id: 'airport',
    country: 'vn',
    indoor: true,
    name: { vi: 'Sân bay Nội Bài', en: 'Nội Bài Airport', de: 'Flughafen Nội Bài' },
    plaque: { style: 'room', title: { vi: 'Sân bay Nội Bài', en: 'Nội Bài Airport', de: 'Flughafen Nội Bài' }, subtitle: { vi: 'Ga quốc tế T2', en: 'International terminal T2', de: 'Internationales Terminal T2' } },
    spawns: { default: { x: 0, z: 2.8, yaw: 0 } },
    cameraZoom: 0.85,
    load: () => import('./Airport'),
  },
  germany: {
    id: 'germany',
    country: 'de',
    indoor: false,
    name: { vi: 'Lindenstraße, nước Đức', en: 'Lindenstraße, Germany', de: 'Lindenstraße' },
    plaque: { style: 'german', title: { vi: 'Lindenstraße', en: 'Lindenstraße', de: 'Lindenstraße' }, subtitle: { vi: 'Nước Đức', en: 'Germany', de: 'Mitte' } },
    spawns: {
      default: { x: -1.0, z: -1.2, yaw: 0 },
      wg: { x: -9.5, z: -3.2, yaw: 0 },
      buergeramt: { x: -2.0, z: -3.2, yaw: 0 },
      tram: { x: 3.4, z: 0.4, yaw: 0 },
    },
    load: () => import('./GermanyStreet'),
  },
  buergeramt: {
    id: 'buergeramt',
    country: 'de',
    indoor: true,
    name: { vi: 'Bürgeramt', en: 'Bürgeramt (citizens’ office)', de: 'Bürgeramt' },
    plaque: { style: 'room', title: { vi: 'Bürgeramt', en: 'Bürgeramt', de: 'Bürgeramt' }, subtitle: { vi: 'Phòng đăng ký cư trú', en: 'Citizens’ office', de: 'Bürgerservice' } },
    spawns: { default: { x: 0, z: 2.6, yaw: 0 } },
    cameraZoom: 0.8,
    load: () => import('./Buergeramt'),
  },
  wg: {
    id: 'wg',
    country: 'de',
    indoor: true,
    name: { vi: 'Căn hộ WG', en: 'The flat-share (WG)', de: 'Die WG' },
    plaque: { style: 'room', title: { vi: 'Căn hộ WG', en: 'The WG', de: 'Die WG' }, subtitle: { vi: 'Lindenstraße 12, tầng 3', en: 'Lindenstraße 12, 3rd floor', de: 'Lindenstraße 12, 3. OG' } },
    spawns: { default: { x: 1.5, z: 2.4, yaw: 0 } },
    cameraZoom: 0.78,
    load: () => import('./WgRoom'),
  },
  careHome: {
    id: 'careHome',
    country: 'de',
    indoor: true,
    name: { vi: 'Viện dưỡng lão Sonnenhof', en: 'Sonnenhof care home', de: 'Pflegeheim Sonnenhof' },
    plaque: { style: 'room', title: { vi: 'Pflegeheim Sonnenhof', en: 'Sonnenhof care home', de: 'Pflegeheim Sonnenhof' } },
    spawns: { default: { x: 0, z: 3.0, yaw: 0 } },
    cameraZoom: 0.85,
    load: () => import('./CareHome'),
  },
}
