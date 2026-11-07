import type { I18nKey } from '../i18n'

/** Profession skills that jobs give XP in (plan §5.1). Add new skills here. */
export const SKILLS = {
  barista: { nameKey: 'skill.barista' },
  pflege: { nameKey: 'skill.pflege' },
} satisfies Record<string, { nameKey: I18nKey }>

export type SkillId = keyof typeof SKILLS
