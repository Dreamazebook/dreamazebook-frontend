/**
 * 按书籍 SPU 划分 Age stage 策略（与 BasicInfoForm / SingleCharacterForm1 三档 UI 一致）。
 * - full：0–6+ 全段（Good night / Santa）
 * - three_plus：更偏 3+（Birthday / Bravery / Mother’s day）
 * - zero_to_three：更偏 0–3（Melody）
 */

export type PersonalizeAgeStagePolicy = 'full' | 'three_plus' | 'zero_to_three';

type FormAgeStage = 'infant' | 'preschooler' | 'early_school_age';

export function getPersonalizeAgeStagePolicy(bookId: string | undefined | null): PersonalizeAgeStagePolicy {
  const u = String(bookId || '')
    .trim()
    .toUpperCase();
  if (!u) return 'full';

  if (u === 'PICBOOK_MOM') return 'three_plus';

  if (u.includes('MELODY')) return 'zero_to_three';

  if (u.includes('BIRTHDAY')) return 'three_plus';
  if (u.includes('BRAVE') || u.includes('BRAVEY')) return 'three_plus';

  if (u.includes('MOTHER')) return 'three_plus';

  if (u.includes('GOODNIGHT')) return 'full';
  if (u.includes('SANTA') || u.includes('SANTALETTER')) return 'full';

  return 'full';
}

/** 无 initialData.ageStage 时的默认选中（全段维持原逻辑 infant） */
export function getDefaultAgeStageForPersonalize(bookId: string | undefined | null): FormAgeStage {
  const policy = getPersonalizeAgeStagePolicy(bookId);
  if (policy === 'three_plus') return 'preschooler';
  if (policy === 'zero_to_three') return 'infant';
  return 'infant';
}

export interface AgeStageMismatchHint {
  headline: string;
  detail: string;
}

/**
 * 用户所选与本书推荐年龄段不一致时的提示（仍可继续选，仅提示）。
 */
export function getAgeStageMismatchHint(
  policy: PersonalizeAgeStagePolicy,
  selected: string | undefined | null
): AgeStageMismatchHint | null {
  const v = selected as FormAgeStage | '' | undefined;
  if (policy === 'zero_to_three') {
    if (v && v !== 'infant') {
      return {
        headline: 'Best for ages 0–3',
        detail: 'Features baby-style characters',
      };
    }
    return null;
  }
  if (policy === 'three_plus') {
    if (v === 'infant') {
      return {
        headline: 'Best for ages 3+',
        detail: 'May be a bit advanced for younger kids',
      };
    }
    return null;
  }
  return null;
}
