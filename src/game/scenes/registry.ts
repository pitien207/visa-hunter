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
  /** Each scene is its own code chunk, loaded on first visit (plan §3: lazy-load each scene). */
  load: () => Promise<{ default: ComponentType }>
}

export const SCENES: Record<SceneId, SceneInfo> = {
  vietnam: {
    id: 'vietnam',
    country: 'vn',
    indoor: false,
    name: { vi: 'Phố nhà mình', en: 'Home street', de: 'Heimatstraße' },
    spawns: {
      default: { x: -5.5, z: -2.6, yaw: 0 },
      xeOm: { x: 8.4, z: 0.6, yaw: 0 },
    },
    load: () => import('./VietnamStreet'),
  },
  embassy: {
    id: 'embassy',
    country: 'vn',
    indoor: true,
    name: { vi: 'Đại sứ quán Đức', en: 'German Embassy', de: 'Deutsche Botschaft' },
    spawns: { default: { x: 0, z: 2.6, yaw: 0 } },
    cameraZoom: 0.8,
    load: () => import('./Embassy'),
  },
  airport: {
    id: 'airport',
    country: 'vn',
    indoor: true,
    name: { vi: 'Sân bay Tân Sơn Nhất', en: 'Tân Sơn Nhất Airport', de: 'Flughafen Tân Sơn Nhất' },
    spawns: { default: { x: 0, z: 2.8, yaw: 0 } },
    cameraZoom: 0.85,
    load: () => import('./Airport'),
  },
  germany: {
    id: 'germany',
    country: 'de',
    indoor: false,
    name: { vi: 'Lindenstraße, nước Đức', en: 'Lindenstraße, Germany', de: 'Lindenstraße' },
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
    spawns: { default: { x: 0, z: 2.6, yaw: 0 } },
    cameraZoom: 0.8,
    load: () => import('./Buergeramt'),
  },
  wg: {
    id: 'wg',
    country: 'de',
    indoor: true,
    name: { vi: 'Căn hộ WG', en: 'The flat-share (WG)', de: 'Die WG' },
    spawns: { default: { x: 1.5, z: 2.4, yaw: 0 } },
    cameraZoom: 0.78,
    load: () => import('./WgRoom'),
  },
  careHome: {
    id: 'careHome',
    country: 'de',
    indoor: true,
    name: { vi: 'Viện dưỡng lão Sonnenhof', en: 'Sonnenhof care home', de: 'Pflegeheim Sonnenhof' },
    spawns: { default: { x: 0, z: 3.0, yaw: 0 } },
    cameraZoom: 0.85,
    load: () => import('./CareHome'),
  },
}
