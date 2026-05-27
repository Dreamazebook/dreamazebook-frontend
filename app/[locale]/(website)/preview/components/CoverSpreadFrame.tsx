'use client';

import React from 'react';

interface CoverSpreadFrameProps {
  /** cover_3/4：按 cover_1 宽高比裁切展示框 */
  cropRightHalf: boolean;
  /** 与 cover_1 实测宽高比一致；仅 cropRightHalf 时使用 */
  frameAspectRatio?: number | null;
  className?: string;
  children: React.ReactNode;
}

const fillChildClass =
  '[&_canvas]:block [&_canvas]:h-full [&_canvas]:max-w-none [&_canvas]:w-full [&_img]:block [&_img]:h-full [&_img]:max-w-none [&_img]:w-full';

/**
 * cover_1/2：不裁切，按原图比例展示。
 * cover_3/4：固定为 cover_1 宽高比，子元素 object-cover 从右侧裁切。
 */
export function CoverSpreadFrame({
  cropRightHalf,
  frameAspectRatio,
  className = 'relative w-full max-w-[400px] overflow-hidden rounded-lg shadow-md',
  children,
}: CoverSpreadFrameProps) {
  if (!cropRightHalf) {
    return <div className={className}>{children}</div>;
  }

  const ratio = frameAspectRatio && frameAspectRatio > 0 ? frameAspectRatio : 1;

  return (
    <div className={className} style={{ aspectRatio: String(ratio) }}>
      <div className={`relative h-full w-full overflow-hidden ${fillChildClass}`}>{children}</div>
    </div>
  );
}

export default CoverSpreadFrame;
