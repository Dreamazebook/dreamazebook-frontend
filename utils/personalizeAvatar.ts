import { PICBOOK_PERSONALIZE_AVATAR_URL } from '@/constants/cdn';

export type PersonalizeAvatarTone = 'white' | 'tan' | 'black';
export type PersonalizeAvatarRole = 'child' | 'dad' | 'mom';

export function skinHexToToneKey(skinColor: string): PersonalizeAvatarTone {
  const h = (skinColor || '').toUpperCase();
  if (h === '#DCB593') return 'tan';
  if (h === '#665444') return 'black';
  return 'white';
}

/** PICBOOK_DAD 使用 webp；其余书默认 png */
export function getPersonalizeAvatarExtension(bookId: string): 'webp' | 'png' {
  const bid = String(bookId || '').trim().toUpperCase();
  if (bid === 'PICBOOK_DAD') return 'webp';
  return 'png';
}

export function getPersonalizeAvatarAssetSpu(bookId: string | undefined | null): string {
  const u = String(bookId || '').trim().toUpperCase();
  if (u === 'PICBOOK_BIRTHDAY') return 'PICBOOK_BIRTHDAY';
  if (u === 'PICBOOK_MOM') return 'PICBOOK_MOM';
  if (u === 'PICBOOK_DAD') return 'PICBOOK_DAD';
  return 'PICBOOK_GOODNIGHT';
}

/**
 * - PICBOOK_MELODY：`layer_{tone}.png`
 * - PICBOOK_DAD + role=dad：`dad-{tone}.webp`
 * - PICBOOK_MOM + role=mom：`mom-{tone}.png`
 * - 其余：`{boy|girl}-{tone}.png` / `.webp`
 */
export function getPersonalizeAvatarFilename(
  bookId: string,
  skinColor: string,
  gender?: '' | 'boy' | 'girl',
  role: PersonalizeAvatarRole = 'child',
): string {
  const bid = String(bookId || '').trim().toUpperCase();
  const tone = skinHexToToneKey(skinColor);
  const ext = getPersonalizeAvatarExtension(bid);

  if (bid === 'PICBOOK_MELODY') {
    const layer = tone === 'tan' ? 'layer_tan' : tone === 'black' ? 'layer_black' : 'layer_white';
    return `${layer}.png`;
  }

  if (bid === 'PICBOOK_DAD' && role === 'dad') {
    return `dad-${tone}.${ext}`;
  }

  if (bid === 'PICBOOK_MOM' && role === 'mom') {
    return `mom-${tone}.${ext}`;
  }

  const g = gender === 'girl' ? 'girl' : 'boy';
  return `${g}-${tone}.${ext}`;
}

export function getPersonalizeAvatarUrl(
  bookId: string,
  skinColor: string,
  gender?: '' | 'boy' | 'girl',
  role: PersonalizeAvatarRole = 'child',
): string {
  const assetSpu = getPersonalizeAvatarAssetSpu(bookId);
  const filename = getPersonalizeAvatarFilename(bookId, skinColor, gender, role);
  return PICBOOK_PERSONALIZE_AVATAR_URL(assetSpu, filename);
}
