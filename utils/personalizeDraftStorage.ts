import {
  clearPersonalizeDraftPhotos,
  collectPhotoUrls,
  hydratePersonalizeDraftFormData,
  savePersonalizeDraftPhotos,
} from '@/utils/personalizeDraftPhotosStorage';
import { normalizeBirthDateForStorage } from '@/utils/birthdayPersonalizeHelpers';

const STORAGE_PREFIX = 'personalizeDraft:';
const CLEARED_FLAG_PREFIX = 'personalizeDraftCleared:';
const DRAFT_VERSION = 1;

const AGE_STAGES = new Set(['', 'infant', 'toddler', 'preschooler', 'early_school_age']);

export type PersonalizeDraftInitialData = {
  fullName?: string;
  gender?: '' | 'boy' | 'girl';
  skinColor?: string;
  hairstyle?: string;
  hairColor?: string;
  ageStage?: '' | 'infant' | 'toddler' | 'preschooler' | 'early_school_age';
  fromWhom?: string;
  birthDate?: string;
  personalityTraitIds?: string[];
  momCallsMe?: string;
  momMakesBest?: string;
  momSkinColor?: string;
  dadTitle?: string;
  dadSkinColor?: string;
  dadQuestionAnswers?: Record<string, string>;
  relationship?: string;
  consent?: boolean;
  birthSeason?: string;
  dob?: string | null;
  photo?: { path: string };
  photos?: string[];
};

export type PersonalizeDraftPayload = {
  version: typeof DRAFT_VERSION;
  formType: 'SINGLE1' | 'SINGLE2';
  useForm3: boolean;
  currentStep: number;
  formData: Record<string, unknown>;
  savedAt: number;
};

export function getPersonalizeDraftStorageKey(bookId: string): string {
  return `${STORAGE_PREFIX}${String(bookId).trim()}`;
}

function getPersonalizeDraftClearedKey(bookId: string): string {
  return `${CLEARED_FLAG_PREFIX}${String(bookId).trim()}`;
}

/** 用户主动离开 personalize（回详情页 / fresh=1）时标记，避免 previewStore 兜底恢复旧数据 */
export function markPersonalizeDraftUserCleared(bookId: string): void {
  if (typeof window === 'undefined' || !bookId) return;
  try {
    sessionStorage.setItem(getPersonalizeDraftClearedKey(bookId), '1');
  } catch {
    // ignore
  }
}

export function isPersonalizeDraftUserCleared(bookId: string): boolean {
  if (typeof window === 'undefined' || !bookId) return false;
  try {
    return sessionStorage.getItem(getPersonalizeDraftClearedKey(bookId)) === '1';
  } catch {
    return false;
  }
}

export function resetPersonalizeDraftUserCleared(bookId: string): void {
  if (typeof window === 'undefined' || !bookId) return;
  try {
    sessionStorage.removeItem(getPersonalizeDraftClearedKey(bookId));
  } catch {
    // ignore
  }
}

function serializeFormData(formData: Record<string, unknown>): Record<string, unknown> {
  const normalizedBirthDate = normalizeBirthDateForStorage(formData.birthDate);
  return {
    ...formData,
    birthDate: normalizedBirthDate ?? null,
    photo:
      formData.photo && typeof formData.photo === 'object' && formData.photo !== null && 'path' in formData.photo
        ? { path: String((formData.photo as { path?: unknown }).path || '') }
        : null,
  };
}

export function clearPersonalizeDraft(bookId: string): void {
  void clearPersonalizeDraftAsync(bookId);
}

export async function clearPersonalizeDraftAsync(bookId: string): Promise<void> {
  if (typeof window === 'undefined' || !bookId) return;
  try {
    localStorage.removeItem(getPersonalizeDraftStorageKey(bookId));
  } catch {
    // ignore
  }
  await clearPersonalizeDraftPhotos(bookId);
}

export function loadPersonalizeDraft(bookId: string): PersonalizeDraftPayload | null {
  if (typeof window === 'undefined' || !bookId) return null;
  try {
    const raw = localStorage.getItem(getPersonalizeDraftStorageKey(bookId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalizeDraftPayload;
    if (parsed?.version !== DRAFT_VERSION || !parsed.formData) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadPersonalizeDraftWithPhotos(bookId: string): Promise<PersonalizeDraftPayload | null> {
  const draft = loadPersonalizeDraft(bookId);
  if (!draft) return null;
  return {
    ...draft,
    formData: await hydratePersonalizeDraftFormData(bookId, draft.formData),
  };
}

function stripPhotosFromDraft(formData: Record<string, unknown>): Record<string, unknown> {
  const next = { ...formData };
  delete next.photos;
  delete next.photo;
  return next;
}

export async function savePersonalizeDraftAsync(
  bookId: string,
  draft: Omit<PersonalizeDraftPayload, 'version' | 'savedAt'>,
): Promise<boolean> {
  if (typeof window === 'undefined' || !bookId) return false;

  const serialized = serializeFormData(draft.formData);
  const photos = collectPhotoUrls(serialized);
  resetPersonalizeDraftUserCleared(bookId);
  await savePersonalizeDraftPhotos(bookId, photos);

  const payload: PersonalizeDraftPayload = {
    version: DRAFT_VERSION,
    ...draft,
    formData: stripPhotosFromDraft(serialized),
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(getPersonalizeDraftStorageKey(bookId), JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[personalizeDraft] Failed to save draft metadata:', error);
    return false;
  }
}

export function savePersonalizeDraft(bookId: string, draft: Omit<PersonalizeDraftPayload, 'version' | 'savedAt'>): boolean {
  if (typeof window === 'undefined' || !bookId) return false;

  const serialized = serializeFormData(draft.formData);
  const photos = collectPhotoUrls(serialized);
  resetPersonalizeDraftUserCleared(bookId);
  void savePersonalizeDraftPhotos(bookId, photos);

  const payload: PersonalizeDraftPayload = {
    version: DRAFT_VERSION,
    ...draft,
    formData: stripPhotosFromDraft(serialized),
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(getPersonalizeDraftStorageKey(bookId), JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[personalizeDraft] Failed to save draft metadata:', error);
    return false;
  }
}

export function draftFormDataToInitialData(formData: Record<string, unknown>): PersonalizeDraftInitialData {
  const photoPath =
    formData.photo && typeof formData.photo === 'object' && formData.photo !== null && 'path' in formData.photo
      ? String((formData.photo as { path?: unknown }).path || '')
      : '';
  const photos = Array.isArray(formData.photos)
    ? formData.photos.filter((p): p is string => typeof p === 'string' && !!p)
    : undefined;
  const genderRaw = formData.gender;
  const gender =
    genderRaw === 'boy' || genderRaw === 'girl' || genderRaw === ''
      ? genderRaw
      : undefined;
  const ageStageRaw = formData.ageStage;
  const ageStage =
    typeof ageStageRaw === 'string' && AGE_STAGES.has(ageStageRaw)
      ? (ageStageRaw as PersonalizeDraftInitialData['ageStage'])
      : undefined;

  return {
    fullName: typeof formData.fullName === 'string' ? formData.fullName : undefined,
    gender,
    skinColor: typeof formData.skinColor === 'string' ? formData.skinColor : undefined,
    hairstyle: typeof formData.hairstyle === 'string' ? formData.hairstyle : undefined,
    hairColor: typeof formData.hairColor === 'string' ? formData.hairColor : undefined,
    ageStage,
    fromWhom: typeof formData.fromWhom === 'string' ? formData.fromWhom : undefined,
    birthDate: normalizeBirthDateForStorage(formData.birthDate),
    personalityTraitIds: Array.isArray(formData.personalityTraitIds)
      ? formData.personalityTraitIds.filter((id): id is string => typeof id === 'string')
      : undefined,
    momCallsMe: typeof formData.momCallsMe === 'string' ? formData.momCallsMe : undefined,
    momMakesBest: typeof formData.momMakesBest === 'string' ? formData.momMakesBest : undefined,
    momSkinColor: typeof formData.momSkinColor === 'string' ? formData.momSkinColor : undefined,
    dadTitle: typeof formData.dadTitle === 'string' ? formData.dadTitle : undefined,
    dadSkinColor: typeof formData.dadSkinColor === 'string' ? formData.dadSkinColor : undefined,
    dadQuestionAnswers:
      formData.dadQuestionAnswers && typeof formData.dadQuestionAnswers === 'object'
        ? { ...(formData.dadQuestionAnswers as Record<string, string>) }
        : undefined,
    relationship: typeof formData.relationship === 'string' ? formData.relationship : undefined,
    consent: typeof formData.consent === 'boolean' ? formData.consent : undefined,
    birthSeason: typeof formData.birthSeason === 'string' ? formData.birthSeason : undefined,
    dob: typeof formData.dob === 'string' ? formData.dob : formData.dob === null ? null : undefined,
    photo: photoPath ? { path: photoPath } : undefined,
    photos,
  };
}

const SKIN_COLORS = ['#FFE2CF', '#DCB593', '#665444'];

function skinCodeToColor(code: unknown): string | undefined {
  const n = Number(code);
  if (Number.isFinite(n) && n >= 1 && n <= 3) return SKIN_COLORS[n - 1];
  return undefined;
}

function hairCodeToStyle(code: unknown): string | undefined {
  const n = Number(code);
  if (Number.isFinite(n) && n > 0) return `hair_${n}`;
  if (typeof code === 'string' && code.startsWith('hair_')) return code;
  return undefined;
}

function hairCodeToColor(code: unknown): string | undefined {
  const n = Number(code);
  if (n === 1) return 'light';
  if (n === 2) return 'brown';
  if (n === 3) return 'dark';
  return undefined;
}

/** previewStore 兜底：从 preview 返回且 localStorage 写入失败时使用 */
export function previewUserDataToInitialData(userData: any): PersonalizeDraftInitialData | null {
  const ch = userData?.characters?.[0];
  if (!ch) return null;

  const attrs = ch.attributes || {};
  const photos = Array.isArray(ch.photos)
    ? ch.photos.filter((p: unknown): p is string => typeof p === 'string' && !!p)
    : ch.photo
      ? [String(ch.photo)]
      : undefined;

  return draftFormDataToInitialData({
    fullName: ch.full_name || '',
    gender: ch.gender === 'boy' || ch.gender === 'girl' ? ch.gender : '',
    skinColor: skinCodeToColor(ch.skincolor),
    hairstyle: hairCodeToStyle(ch.hairstyle ?? attrs.hair_style),
    hairColor: hairCodeToColor(ch.haircolor ?? attrs.hair_color),
    ageStage: attrs.age_stage,
    fromWhom: ch.giver_name || '',
    birthDate: normalizeBirthDateForStorage(attrs.birthday),
    momCallsMe: attrs.mom_calls_me,
    momMakesBest: attrs.mom_makes_best,
    momSkinColor: skinCodeToColor(attrs.mom_skin_tone),
    dadTitle: attrs.dad_name,
    dadSkinColor: skinCodeToColor(attrs.dad_skin_tone),
    dadQuestionAnswers: Object.fromEntries(
      Object.entries(attrs).filter(([key]) => key.startsWith('dad_question_') || key.startsWith('dad_q_')),
    ),
    relationship: ch.relationship,
    photos,
    photo: photos?.[0] ? { path: photos[0] } : null,
  });
}
