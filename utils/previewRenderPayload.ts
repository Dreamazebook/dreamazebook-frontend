import { buildPicbookPreviewFacePayload, previewFaceEntriesToRenderValues } from '@/utils/faceImagePayload';
import { buildPicbookDadRenderAttributes } from '@/utils/dadPersonalizeHelpers';
import { isPicbookDad } from '@/utils/isPicbookDad';
import { mapAgeStageUiToBackend } from '@/utils/mapAgeStageToBackend';

function mapGenderToString(g: unknown, genderCode?: unknown): string | null {
  if (g === 'boy' || g === 'girl') return g;
  if (g === 1 || g === '1') return 'boy';
  if (g === 2 || g === '2') return 'girl';
  if (genderCode === 1 || genderCode === '1') return 'boy';
  if (genderCode === 2 || genderCode === '2') return 'girl';
  return null;
}

function toBackendCharacterAttrs(character: Record<string, unknown>): Record<string, unknown> {
  const skinHexes = ['#FFE2CF', '#DCB593', '#665444'];
  const hex = character.skinColor || character.skin_color_hex;
  const idx =
    typeof hex === 'string'
      ? skinHexes.findIndex(h => h === hex)
      : character.skincolor
        ? Number(character.skincolor) - 1
        : -1;
  const skin_tone = idx === 0 ? 'white' : idx === 2 ? 'black' : 'original';
  const hair_style =
    String(character.hairstyle || character.hair_style || '')
      .replace('hair_', '')
      .trim() || String(character.hairstyle || '1');
  const mapHairColor = (v: unknown): string => {
    if (typeof v === 'string') {
      const s = v.toLowerCase();
      if (s === 'light') return 'blone';
      if (s === 'brown' || s === 'original') return 'original';
      if (s === 'dark' || s === 'black') return 'dark';
      return 'dark';
    }
    const n = Number(v) || 1;
    if (n === 1) return 'blone';
    if (n === 2) return 'original';
    if (n === 3) return 'dark';
    return 'dark';
  };
  const hair_color = mapHairColor(character.hairColor || character.haircolor);
  const stored =
    character.attributes && typeof character.attributes === 'object'
      ? (character.attributes as Record<string, unknown>)
      : {};
  const rawAge = stored.age_stage ?? character.age_stage;
  const age_stage = mapAgeStageUiToBackend(
    typeof rawAge === 'string' || rawAge == null ? rawAge : String(rawAge),
  );
  const birthday =
    typeof stored.birthday === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stored.birthday)
      ? stored.birthday
      : undefined;
  const character_traits =
    Array.isArray(stored.character_traits) && stored.character_traits.length > 0
      ? stored.character_traits
      : undefined;

  return {
    skin_tone,
    hair_style,
    hair_color,
    ...(age_stage ? { age_stage } : {}),
    ...(birthday ? { birthday } : {}),
    ...(character_traits ? { character_traits } : {}),
  };
}

function collectFaceImages(character: Record<string, unknown>): string[] {
  const photos = character.photos;
  if (Array.isArray(photos) && photos.length > 0) {
    return photos.map(String).filter(Boolean);
  }
  const photo = character.photo;
  if (photo) return [String(photo)];
  return [];
}

/** POST /products/{spu}/preview/render 请求体（PICBOOK_DAD 与后端文档对齐） */
export function buildPreviewRenderPayload(
  bookId: string,
  character: Record<string, unknown> | null | undefined,
  extraAttributes?: Record<string, unknown>,
): Record<string, unknown> {
  const c = character || {};
  const faceImages = collectFaceImages(c);
  const genderStr = mapGenderToString(c.gender, c.gender_code);
  const giverName = String(c.giver_name || c.created_by || '').trim();
  const storedAttrs =
    c.attributes && typeof c.attributes === 'object'
      ? (c.attributes as Record<string, unknown>)
      : {};

  const fb = buildPicbookPreviewFacePayload(bookId, faceImages);

  if (isPicbookDad(bookId)) {
    const dadFaceAttrs: Record<string, string[]> = {};
    const momImage = previewFaceEntriesToRenderValues(fb.faceAttributes.mom_image);
    const dadImage = previewFaceEntriesToRenderValues(fb.faceAttributes.dad_image);
    if (momImage.length) dadFaceAttrs.mom_image = momImage;
    if (dadImage.length) dadFaceAttrs.dad_image = dadImage;

    return {
      picbook_id: bookId,
      face_images: previewFaceEntriesToRenderValues(fb.face_images),
      full_name: c.full_name,
      language: c.language || 'en',
      gender: genderStr,
      relationship: c.relationship ?? null,
      ...(giverName ? { giver_name: giverName } : {}),
      skincolor: c.skincolor ?? 1,
      attributes: {
        ...toBackendCharacterAttrs(c),
        ...buildPicbookDadRenderAttributes(storedAttrs),
        ...dadFaceAttrs,
        ...(extraAttributes || {}),
      },
    };
  }

  return {
    picbook_id: bookId,
    face_images: fb.face_images,
    full_name: c.full_name,
    language: c.language || 'en',
    gender: genderStr,
    relationship: c.relationship ?? null,
    ...(giverName ? { giver_name: giverName } : {}),
    skincolor: c.skincolor ?? 1,
    attributes: {
      ...toBackendCharacterAttrs(c),
      ...fb.faceAttributes,
      ...(extraAttributes || {}),
    },
  };
}
