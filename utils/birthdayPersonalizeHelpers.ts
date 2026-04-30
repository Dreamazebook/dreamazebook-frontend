/** 北半球：按出生月划分季节（用于「Born in …」） */
export type BirthSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export function getBirthSeasonFromDate(d: Date): BirthSeason {
  const m = d.getMonth() + 1; // 1–12
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

/** 预览/购物车：从角色对象解析封面用季节（spring～winter） */
export function getBirthdayCoverSeasonFromCharacterLike(ch: any | null | undefined): BirthSeason {
  if (!ch) return 'spring';
  const iso = ch.birthday || ch.attributes?.birthday;
  const d = parseBirthDateIso(typeof iso === 'string' ? iso : '');
  if (d) return getBirthSeasonFromDate(d);
  const raw = String(ch.birthSeason || ch.attributes?.birth_season || '').toLowerCase();
  if (raw === 'spring' || raw === 'summer' || raw === 'autumn' || raw === 'winter') return raw;
  return 'spring';
}

export function birthSeasonLabel(season: BirthSeason): string {
  switch (season) {
    case 'spring':
      return 'spring';
    case 'summer':
      return 'summer';
    case 'autumn':
      return 'autumn';
    default:
      return 'winter';
  }
}

export function birthSeasonEmoji(season: BirthSeason): string {
  switch (season) {
    case 'spring':
      return '🌸';
    case 'summer':
      return '☀️';
    case 'autumn':
      return '🍂';
    default:
      return '❄️';
  }
}

/** 以「下一次生日」时的周岁（与当年生日日期对齐），用于 Turning n */
export function getTurningAgeOnNextBirthday(birth: Date, ref: Date = new Date()): number {
  let y = ref.getFullYear();
  let next = new Date(y, birth.getMonth(), birth.getDate());
  if (next < ref) {
    y += 1;
    next = new Date(y, birth.getMonth(), birth.getDate());
  }
  return next.getFullYear() - birth.getFullYear();
}

export function formatBirthDateIso(d: Date | null): string | undefined {
  if (!d || Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseBirthDateIso(iso: string | undefined | null): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** 顺序即后端 traits_1 … traits_n 的编号（与 UI 一致） */
export const BIRTHDAY_PERSONALITY_TRAITS = [
  { id: 'curious', label: 'Curious', description: "Always asking 'why?'" },
  { id: 'creative', label: 'Creative', description: 'Loves to imagine and make' },
  { id: 'caring', label: 'Caring', description: 'Looks out for others' },
  { id: 'expressive', label: 'Expressive', description: 'Shows feelings openly' },
  { id: 'brave', label: 'Brave', description: 'Tries even when unsure' },
  { id: 'fair_kind', label: 'Fair and kind', description: "Tries to do what's right" },
  { id: 'confident', label: 'Confident', description: 'Believes in who they are' },
  { id: 'thoughtful', label: 'Thoughtful', description: 'Notices the little things' },
] as const;

export type BirthdayPersonalityTraitId = (typeof BIRTHDAY_PERSONALITY_TRAITS)[number]['id'];

/** UI 特质 id → 接口 attributes.character_traits：traits_1 … traits_8 */
export function mapPersonalityTraitIdsToCharacterTraits(uiIds: string[]): string[] {
  return uiIds
    .map(id => {
      const idx = BIRTHDAY_PERSONALITY_TRAITS.findIndex(t => t.id === id);
      if (idx < 0) return null;
      return `traits_${idx + 1}`;
    })
    .filter((x): x is string => x != null);
}
