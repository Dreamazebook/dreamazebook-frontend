'use client';

import React from 'react';
import { DreamazeWordmarkRainbowLoader } from './DreamazeFaceSwapLoadingBar';

export type DreamazeLogoRainbowLoaderProps = {
  /** 视觉尺度：控制 DREAMAZE 字标显示宽度 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 彩虹映射在 DREAMAZE loading 字标上并持续流动（无进度裁剪、无百分比）。
 */
export default function DreamazeLogoRainbowLoader({
  size = 60,
  className = '',
  style,
}: DreamazeLogoRainbowLoaderProps) {
  const logoW = Math.min(292, Math.round(size * 4.8));
  return (
    <div
      className={`inline-flex max-w-full justify-center ${className}`}
      style={{ ...style, width: logoW, maxWidth: '100%' }}
      role="status"
      aria-label="Loading"
    >
      <DreamazeWordmarkRainbowLoader className="w-full" />
    </div>
  );
}
