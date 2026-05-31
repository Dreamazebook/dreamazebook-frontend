import { WEBSITE_CDN_URL } from '@/constants/cdn';
import { getBirthdayCoverSeasonFromCharacterLike } from '@/utils/birthdayPersonalizeHelpers';

/** 封面资源目录：PICBOOK_GOODNIGHT3 → PICBOOK_GOODNIGHT */
export function normalizeSpuForCover(spu: string): string {
  const u = String(spu || '').trim();
  if (u === 'PICBOOK_GOODNIGHT3') return 'PICBOOK_GOODNIGHT';
  return u;
}

/**
 * R2：`products/picbooks/{SPU}/covers/cover_{id}/base.webp`
 * PICBOOK_BIRTHDAY + cover_1/2：按生日季节使用 `{season}.webp`
 */
export function getPicbookCoverOptionImageUrl(
  spuCode: string | null | undefined,
  coverId: string = '1',
  attributes?: Record<string, unknown> | null,
): string {
  const raw = String(spuCode || '').trim();
  if (!raw) return '';

  const normalized = normalizeSpuForCover(raw);
  const id = String(coverId || '1');
  const attrs = attributes || {};

  const birthdaySeason =
    normalized.toUpperCase() === 'PICBOOK_BIRTHDAY' && ['1', '2'].includes(id)
      ? getBirthdayCoverSeasonFromCharacterLike({
          birthday: attrs.birthday as string | undefined,
          birthSeason: attrs.birth_season as string | undefined,
          attributes: attrs,
        })
      : null;

  const coverBaseFile = birthdaySeason ? `${birthdaySeason}.webp` : 'base.webp';

  return `${WEBSITE_CDN_URL}products/picbooks/${encodeURIComponent(
    normalized,
  )}/covers/cover_${encodeURIComponent(id)}/${coverBaseFile}`;
}
