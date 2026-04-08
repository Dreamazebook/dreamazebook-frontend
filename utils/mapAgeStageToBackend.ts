/**
 * 将前端 ageStage（枚举）转为接口 attributes.age_stage。
 */
export function mapAgeStageUiToBackend(v: string | undefined | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (/^\d+-\d+$/.test(s) || s === '6+') return s;
  const map: Record<string, string> = {
    infant: '0-3',
    toddler: '1-3',
    preschooler: '3-6',
    early_school_age: '6+',
  };
  return map[s] ?? s;
}
