import type { CSSProperties } from 'react';

export function resolveCoverNumericId(option: {
  id?: number | string;
  option_key?: string | null;
}): string {
  const raw = String(option.option_key ?? option.id ?? '').trim();
  if (/^\d+$/.test(raw)) return raw;
  const match = raw.match(/(\d+)/);
  if (match) return match[1];
  return String(option.id ?? '1');
}

/** cover_3/4 缩略图按 cover_1 宽高比裁切；cover_1/2 不切图 */
export function shouldCropCoverRightHalf(coverId: string): boolean {
  return coverId === '3' || coverId === '4';
}

export function getCoverDisplayDimensions(
  aspectRatio: number,
  displayWidth = 400,
): { width: number; height: number } {
  const safeRatio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  return {
    width: displayWidth,
    height: Math.round(displayWidth / safeRatio),
  };
}

/** cover_3/4 在固定宽高比框内铺满 */
export const coverSpreadImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

/** cover_1/2 按原图比例展示 */
export const coverNaturalImageClass = 'block w-full h-auto';

/** cover_3/4 在 cover_1 同比例框内 object-cover，宽图取右侧 */
export const coverFitFrameImageClass = 'block h-full w-full object-cover object-right';
