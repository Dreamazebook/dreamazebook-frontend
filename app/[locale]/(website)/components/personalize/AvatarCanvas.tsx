/** @jsxImportSource react */
'use client';

import React from 'react';
import { PICBOOK_PERSONALIZE_AVATAR_URL } from '@/constants/cdn';

interface AvatarCanvasProps {
  bookId: string;
  skinColor: string;
  /** 保留以兼容既有表单；预览图为 CDN 整图时不再参与合成 */
  hairstyle: string;
  hairColor: string;
  gender?: '' | 'boy' | 'girl';
  width?: number;
  height?: number;
}

const skinHexToToneKey = (skinColor: string): 'white' | 'tan' | 'black' => {
  const h = (skinColor || '').toUpperCase();
  if (h === '#DCB593') return 'tan';
  if (h === '#665444') return 'black';
  return 'white';
};

/**
 * - PICBOOK_MELODY：`layer_white.png` / `layer_tan.png` / `layer_black.png`
 * - 其余书：`{boy|girl}-{white|tan|black}.png`（如 Santa `boy-black.png`、MOM `girl-black.png`）
 */
const personalizeAvatarFilename = (
  bookId: string,
  skinColor: string,
  gender?: '' | 'boy' | 'girl'
): string => {
  const bid = String(bookId || '').trim().toUpperCase();
  const tone = skinHexToToneKey(skinColor);

  if (bid === 'PICBOOK_MELODY') {
    const layer = tone === 'tan' ? 'layer_tan' : tone === 'black' ? 'layer_black' : 'layer_white';
    return `${layer}.png`;
  }

  const g = gender === 'girl' ? 'girl' : 'boy';
  return `${g}-${tone}.png`;
};

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  bookId,
  skinColor,
  gender,
  width,
  height,
}) => {
  const filename = personalizeAvatarFilename(bookId, skinColor, gender);
  const src = PICBOOK_PERSONALIZE_AVATAR_URL(bookId, filename);

  return (
    <img
      src={src}
      alt=""
      className="rounded-lg h-[180px] md:h-[220px] w-auto block m-0 max-w-full"
      width={width}
      height={height}
      loading="eager"
      decoding="async"
    />
  );
};

export default AvatarCanvas;
