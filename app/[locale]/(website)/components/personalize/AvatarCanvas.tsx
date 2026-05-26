/** @jsxImportSource react */
'use client';

import React from 'react';
import {
  getPersonalizeAvatarAssetSpu,
  getPersonalizeAvatarFilename,
  type PersonalizeAvatarRole,
} from '@/utils/personalizeAvatar';
import { PICBOOK_PERSONALIZE_AVATAR_URL } from '@/constants/cdn';

interface AvatarCanvasProps {
  bookId: string;
  skinColor: string;
  /** 保留以兼容既有表单；预览图为 CDN 整图时不再参与合成 */
  hairstyle: string;
  hairColor: string;
  gender?: '' | 'boy' | 'girl';
  /** PICBOOK_DAD：child = boy/girl 预览，dad = 爸爸预览，mom = 妈妈预览 */
  role?: PersonalizeAvatarRole;
  width?: number;
  height?: number;
  className?: string;
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  bookId,
  skinColor,
  gender,
  role = 'child',
  width,
  height,
  className,
}) => {
  const assetSpu = getPersonalizeAvatarAssetSpu(bookId);
  const filename = getPersonalizeAvatarFilename(bookId, skinColor, gender, role);
  const src = PICBOOK_PERSONALIZE_AVATAR_URL(assetSpu, filename);

  return (
    <img
      src={src}
      alt=""
      className={
        className ??
        'rounded-lg h-[180px] md:h-[220px] w-auto block m-0 max-w-full'
      }
      width={width}
      height={height}
      loading="eager"
      decoding="async"
    />
  );
};

export default AvatarCanvas;
