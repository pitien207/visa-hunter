import type { I18nKey } from '../i18n'
import { CONFIG } from './config'
import type { SkillId } from './skills'

/**
 * WorkStation tasks (plan §5.3). A task is pure data: the engine
 * (game/systems/work.ts + components/WorkStation.tsx) runs any task defined here.
 *
 * How a shift works: customers arrive one at a time with a request. Pressing the
 * actions the request needs fulfils it (order doesn't matter); a wrong action spills
 * the drink. Each outcome moves the satisfaction meter, which scales the wage.
 */

export type ActionIconName =
  | 'start'
  | 'coffee'
  | 'milk'
  | 'ice'
  | 'salt'
  | 'talk'
  | 'shop'
  | 'sleep'
  | 'save'
  | 'feed'
  | 'wipe'
  | 'comfort'
  | 'wheel'
  | 'door'
  | 'book'
  | 'passport'
  | 'ticket'
  | 'tram'
  | 'bottle'
  | 'hanger'
  | 'laptop'
  | 'number'

export interface TaskAction {
  id: string
  labelKey: I18nKey
  icon: ActionIconName
  /** Colour of this ingredient's layer in the cup on the counter. */
  color: string
}

export interface TaskRequest {
  id: string
  labelKey: I18nKey
  /** Action ids needed (a multiset: repeat an id to need it twice). */
  needs: string[]
  /** Relative chance of being ordered (default 1). */
  weight?: number
}

export type JobBalance = (typeof CONFIG.jobs)[keyof typeof CONFIG.jobs]

export interface TaskDef extends JobBalance {
  id: string
  scene: 'VietnamStreet'
  nameKey: I18nKey
  skill: SkillId
  actions: TaskAction[]
  requests: TaskRequest[]
}

export const TASKS = {
  cafeBarista: {
    id: 'cafe-barista',
    scene: 'VietnamStreet',
    nameKey: 'task.cafeBarista',
    skill: 'barista',
    ...CONFIG.jobs.cafeBarista,
    actions: [
      { id: 'coffee', labelKey: 'action.coffee', icon: 'coffee', color: '#6b4226' },
      { id: 'milk', labelKey: 'action.milk', icon: 'milk', color: '#f6e4c0' },
      { id: 'ice', labelKey: 'action.ice', icon: 'ice', color: '#c9ecff' },
      { id: 'salt', labelKey: 'action.salt', icon: 'salt', color: '#ffffff' },
    ],
    requests: [
      { id: 'den-da', labelKey: 'drink.denDa', needs: ['coffee', 'ice'] },
      { id: 'nau-nong', labelKey: 'drink.nauNong', needs: ['coffee', 'milk'] },
      { id: 'sua-da', labelKey: 'drink.suaDa', needs: ['coffee', 'milk', 'ice'], weight: 2 },
      { id: 'bac-xiu', labelKey: 'drink.bacXiu', needs: ['milk', 'milk', 'coffee', 'ice'] },
      { id: 'muoi', labelKey: 'drink.muoi', needs: ['coffee', 'milk', 'salt', 'ice'] },
    ],
  },
} satisfies Record<string, TaskDef>

export type TaskId = keyof typeof TASKS
