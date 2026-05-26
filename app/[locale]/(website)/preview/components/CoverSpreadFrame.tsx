'use client';

import React from 'react';

interface CoverSpreadFrameProps {
  /** 是否只展示 spread 右半页（封面正面） */
  cropRightHalf: boolean;
  /** 完整 spread 图的宽高比；未提供时按 4:1 估算 */
  spreadAspectRatio?: number | null;
  className?: string;
  children: React.ReactNode;
}

/**
 * 封面 spread 展示框：cropRightHalf 时裁切并右对齐，只显示右半部分。
 */
export function CoverSpreadFrame({
  cropRightHalf,
  spreadAspectRatio,
  className = 'relative w-full max-w-[400px] overflow-hidden rounded-lg shadow-md',
  children,
}: CoverSpreadFrameProps) {
  if (!cropRightHalf) {
    return <div className={className}>{children}</div>;
  }

  const fullRatio = spreadAspectRatio && spreadAspectRatio > 0 ? spreadAspectRatio : 4;
  const displayRatio = fullRatio / 2;

  return (
    <div className={className} style={{ aspectRatio: String(displayRatio) }}>
      <div className="absolute inset-y-0 right-0 h-full w-[200%]">{children}</div>
    </div>
  );
}

export default CoverSpreadFrame;
