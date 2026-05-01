'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';

/** 灰字轨（半透明白/黑叠色） */
const LOADING_SVG = '/images/preview/DREAMAZE-loading.svg';

/** 与 DREAMAZE-loading 同轮廓，不透明白填充；用 data URL 内联，避免外链 mask 在部分环境下整层失效 */
const DREAMAZE_SILHOUETTE_PATH =
  'M292 27.8158L273.268 27.8158L273.073 0.621574L291.611 0.621574L282.381 14.374L292 27.8158ZM255.938 28.3597C249.318 28.3597 244.878 21.8719 244.878 14.2186C244.878 6.56551 249.512 0.310787 256.133 0.310787C262.714 0.310787 267.232 6.56551 267.232 14.2186C267.232 21.8719 262.52 28.3597 255.938 28.3597ZM229.69 28.3597C223.07 28.3597 218.63 21.8719 218.63 14.2186C218.63 6.56551 223.264 0.310787 229.885 0.310787C236.466 0.310787 240.984 6.56551 240.984 14.2186C240.984 21.8719 236.272 28.3597 229.69 28.3597ZM204.377 27.8158H203.598H198.301V0.621574L203.598 0.621574C209.945 0.738119 212.633 4.35115 212.633 8.81871C212.633 10.1007 212.36 11.3439 211.815 12.4316C213.801 14.0632 214.697 16.472 214.697 19.1914C214.697 24.2028 210.88 27.8158 204.377 27.8158ZM180.543 13.9079C180.465 21.6777 180.582 21.9884 180.582 28.0878H180.543C174 28.0489 168.665 21.7165 168.665 13.8302C168.665 5.94393 174 0.23309 180.582 0.23309C187.125 0.23309 192.46 5.94393 192.46 13.8302C192.46 13.9079 180.543 13.8302 180.543 13.9079ZM161.772 22.1438C163.486 23.3093 164.732 24.3582 165.16 27.6216L142.923 27.8158L152.698 6.95399C150.946 6.95399 147.051 7.26478 145.065 5.55545C142.962 3.72957 142.768 2.33103 142.768 0.621574L164.966 0.621574L154.801 21.2115C158.696 21.2115 160.331 21.1726 161.772 22.1438ZM129.799 0.699271L139.652 27.8158L119.908 27.8158L129.799 0.699271ZM96.4245 0L106.511 10.9165L116.247 0.116545V27.6216L96.5024 27.6216L96.4245 0ZM83.5733 0.699271L93.4261 27.8158L73.6814 27.8158L83.5733 0.699271ZM58.2599 13.9079C58.182 21.6777 58.2988 21.9884 58.2988 28.0878H58.2599C51.7173 28.0489 46.3819 21.7165 46.3819 13.8302C46.3819 5.94393 51.7173 0.23309 58.2988 0.23309C64.8415 0.23309 70.1768 5.94393 70.1768 13.8302C70.1768 13.9079 58.2599 13.8302 58.2599 13.9079ZM24.5735 27.8158L24.5735 0.621574L30.493 0.582726C33.8811 0.582726 40.0733 1.24315 40.0733 8.39138C40.0733 11.6546 37.8923 14.3352 33.2191 16.3166L42.8772 27.8158L24.5735 27.8158ZM0 27.9324L0 0.582726C7.59415 0.582726 18.7322 0.621575 18.7322 13.8302C18.7322 28.0489 3.77767 27.9324 0 27.9324Z';

const FLOW_GRADIENT =
  'linear-gradient(90deg, #1125FF 0%, #FF5E46 23%, #0055A2 40%, #229F80 56%, #FAAB57 70%, #1B2BFA 100%)';

function buildSilhouetteMaskDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 292 29"><path fill-rule="evenodd" clip-rule="evenodd" fill="#fff" d="${DREAMAZE_SILHOUETTE_PATH}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type Props = {
  progress: number;
};

type WordmarkProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * 等待态：只显示彩虹映射到 DREAMAZE 轮廓内的横向循环流动，不渲染灰色字轨/浮雕底图。
 */
export function DreamazeWordmarkRainbowLoader({ className = '', style }: WordmarkProps) {
  const maskImage = useMemo(() => `url("${buildSilhouetteMaskDataUrl()}")`, []);

  return (
    <>
      <style>{`
        @keyframes dreamaze-wordmark-rainbow-flow {
          0% { background-position: 200% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div
        className={`relative inline-block h-[29px] max-w-full leading-none ${className}`}
        style={style}
      >
        <div
          className="pointer-events-none absolute inset-0 motion-reduce:animate-none"
          style={{
            animation: 'dreamaze-wordmark-rainbow-flow 3.5s linear infinite',
            backgroundImage: FLOW_GRADIENT,
            backgroundSize: '300% 100%',
            WebkitMaskImage: maskImage,
            maskImage,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
          aria-hidden
        />
      </div>
    </>
  );
}

/**
 * 换脸进度：保持原进度效果，灰色字轨 + 已完成部分的流动彩虹映射。
 */
export function DreamazeFaceSwapLoadingBar({ progress }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)));
  const clipRight = 100 - pct;

  // CSS mask-image 需要 url(...) 形式；直接给 data:image... 在部分浏览器会失效，表现为整块矩形渐变
  const maskImage = useMemo(() => `url("${buildSilhouetteMaskDataUrl()}")`, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block max-w-full leading-none">
        <img
          src={LOADING_SVG}
          alt=""
          width={292}
          height={29}
          className="block h-auto max-w-full select-none"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-0 animate-dreamaze-gradient-flow motion-reduce:animate-none"
          style={{
            backgroundImage: FLOW_GRADIENT,
            backgroundSize: '200% 100%',
            WebkitMaskImage: maskImage,
            maskImage,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            clipPath: `inset(0 ${clipRight}% 0 0)`,
            transition: 'clip-path 200ms ease-out',
          }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-sm text-gray-700">{pct}%</p>
    </div>
  );
}
