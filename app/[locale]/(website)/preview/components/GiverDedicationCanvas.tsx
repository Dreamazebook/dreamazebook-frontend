'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { roboto, philosopher, notoSansSC } from '@/app/fonts';

type ViewMode = 'single' | 'double';

interface Props {
  imageUrl: string;
  mode: ViewMode;
  giverText: string;
  dedicationText: string;
  giverImageUrl?: string | null;
  className?: string;
  leftBelow?: React.ReactNode;
  rightBelow?: React.ReactNode;
}

/**
 * 将 pt 转换为像素，按打印 300 DPI 计算。
 * 1pt = 1/72 inch → px = pt * 300 / 72
 */
function ptToPxAt300Dpi(pt: number): number {
  return (pt * 300) / 72;
}

/**
 * 文本自动换行到指定宽度，返回行数组
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const words = para.split(/(\s+)/); // 保留空白符用于更自然的换行
    let current = '';
    for (const word of words) {
      const test = current + word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current.trim()) lines.push(current.trim());
        // 长单词超出时强行截断
        if (ctx.measureText(word).width > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            const testChunk = chunk + ch;
            if (ctx.measureText(testChunk).width <= maxWidth) {
              chunk = testChunk;
            } else {
              if (chunk.trim()) lines.push(chunk.trim());
              chunk = ch;
            }
          }
          current = chunk;
        } else {
          current = word.trimStart();
        }
      }
    }
    if (current.trim()) lines.push(current.trim());
  }
  return lines;
}

export default function GiverDedicationCanvas({
  imageUrl,
  mode,
  giverText,
  dedicationText,
  giverImageUrl,
  className,
  leftBelow,
  rightBelow,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const locale = useLocale();
  const isChinese = useMemo(() => locale?.toLowerCase().startsWith('zh'), [locale]);
  const rootClassName = useMemo(() => [className, 'mx-auto'].filter(Boolean).join(' '), [className]);

  // 目标字体（按需求：Philosopher 14pt，Roboto 14pt，300dpi）
  const dedicationPx = useMemo(() => Math.round(ptToPxAt300Dpi(14)), []); // ~58px
  const giverPx = useMemo(() => Math.round(ptToPxAt300Dpi(14)), []);

  const giverFontFamily = useMemo(
    () => (isChinese
      ? `${notoSansSC.style.fontFamily}, system-ui, sans-serif`
      : `${roboto.style.fontFamily}, Arial, system-ui, sans-serif`),
    [isChinese, notoSansSC.style.fontFamily, roboto.style.fontFamily]
  );
  const dedicationFontFamily = useMemo(
    () => (isChinese
      ? `${notoSansSC.style.fontFamily}, system-ui, sans-serif`
      : `${philosopher.style.fontFamily}, Georgia, serif`),
    [isChinese, notoSansSC.style.fontFamily, philosopher.style.fontFamily]
  );

  useEffect(() => {
    let isMounted = true;
    async function loadFonts() {
      try {
        // 等待文档中字体可用（需外部加载 Philosopher 与 Roboto）
        // 尝试主动加载指定大小，提升可靠性
        // 注意：若字体未在全局通过 @font-face 或 next/font 注入，则会退回系统字体
        if ('fonts' in document) {
          // @ts-ignore
          await Promise.all([
            // @ts-ignore
            document.fonts.load(`${giverPx}px ${isChinese ? notoSansSC.style.fontFamily : roboto.style.fontFamily}`),
            // @ts-ignore
            document.fonts.load(`${dedicationPx}px ${isChinese ? notoSansSC.style.fontFamily : philosopher.style.fontFamily}`),
            // @ts-ignore
            document.fonts.ready,
          ]);
        }
      } catch (e) {
        // 忽略字体加载错误，使用回退字体
      }
      if (isMounted) setReady(true);
    }
    loadFonts();
    return () => {
      isMounted = false;
    };
  }, [giverPx, dedicationPx, isChinese]);

  useEffect(() => {
    if (!ready) return;

    // 尝试优先以 CORS 方式加载，失败则降级为非 CORS 加载（允许画布被 taint，只用于显示）
    const loadImageWithCorsFallback = (src: string): Promise<HTMLImageElement> => {
      const shouldBypassCors = (() => {
        try {
          const u = new URL(src, window.location.href);
          return u.hostname.endsWith('.r2.dev');
        } catch {
          return src.includes('.r2.dev');
        }
      })();
      return new Promise((resolve, reject) => {
        // 对于已知未开启 CORS 的源（如 r2.dev），直接跳过 crossOrigin 以避免控制台报错噪音
        if (shouldBypassCors) {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
          return;
        }

        // 其他源优先尝试 CORS，失败后降级
        const corsImg = new Image();
        corsImg.crossOrigin = 'anonymous';
        corsImg.onload = () => resolve(corsImg);
        corsImg.onerror = () => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        };
        corsImg.src = src;
      });
    };

    const drawDouble = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const needOverlay = typeof giverImageUrl === 'string' && !!giverImageUrl.trim();
      const [img, overlay]: [HTMLImageElement, HTMLImageElement | null] = await Promise.all([
        loadImageWithCorsFallback(imageUrl),
        needOverlay
          ? loadImageWithCorsFallback(giverImageUrl as string).catch(() => null)
          : Promise.resolve(null),
      ]);

      // 使用原图分辨率，保证高精度（近似 300dpi 来源自图像像素）
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 左右半区
      const halfW = canvas.width / 2;
      const padding = Math.round(canvas.width * 0.03); // 基于宽度的内边距

      // Giver（调整：现在左侧绘制 Giver；若有头像则优先绘制头像）
      ctx.save();
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const leftMaxWidth = halfW - padding * 2;
      const needOverlayLeft = typeof giverImageUrl === 'string' && !!giverImageUrl.trim();
      // 在双页模式下，左边优先显示头像（与右侧原逻辑对称）
      if (needOverlayLeft) {
        try {
          const overlay = await loadImageWithCorsFallback(giverImageUrl as string);
          const targetSize = Math.min(halfW - padding * 2, canvas.height - padding * 2) * 0.45;
          const targetX = halfW / 2 - targetSize / 2;
          const targetY = canvas.height / 2 - targetSize / 2;
          const srcSize = Math.min(overlay.naturalWidth, overlay.naturalHeight);
          const sx = Math.floor((overlay.naturalWidth - srcSize) / 2);
          const sy = Math.floor((overlay.naturalHeight - srcSize) / 2);
          ctx.drawImage(overlay as CanvasImageSource, sx, sy, srcSize, srcSize, targetX, targetY, targetSize, targetSize);
        } catch (_) {
          ctx.font = `${giverPx}px ${giverFontFamily}`;
          const leftLines = wrapText(ctx, (giverText || '').trim(), leftMaxWidth);
          const leftLineHeight = Math.round(giverPx * 1.25);
          const leftTotalHeight = leftLines.length * leftLineHeight;
          let leftY = canvas.height / 2 - leftTotalHeight / 2;
          for (const line of leftLines) {
            ctx.fillText(line, halfW / 2, leftY + leftLineHeight / 2, leftMaxWidth);
            leftY += leftLineHeight;
          }
        }
      } else {
        ctx.font = `${giverPx}px ${giverFontFamily}`;
        const leftLines = wrapText(ctx, (giverText || '').trim(), leftMaxWidth);
        const leftLineHeight = Math.round(giverPx * 1.25);
        const leftTotalHeight = leftLines.length * leftLineHeight;
        let leftY = canvas.height / 2 - leftTotalHeight / 2;
        for (const line of leftLines) {
          ctx.fillText(line, halfW / 2, leftY + leftLineHeight / 2, leftMaxWidth);
          leftY += leftLineHeight;
        }
      }
      ctx.restore();

      // Dedication（调整：现在右侧绘制 Dedication）
      ctx.save();
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const rightCenterX = halfW + halfW / 2;
      const rightMaxWidth = halfW - padding * 2;
      ctx.font = `${dedicationPx}px ${dedicationFontFamily}`;
      const rightLines = wrapText(ctx, (dedicationText || '').trim(), rightMaxWidth);
      const rightLineHeight = Math.round(dedicationPx * 1.25);
      const rightTotalHeight = rightLines.length * rightLineHeight;
      let rightY = canvas.height / 2 - rightTotalHeight / 2;
      for (const line of rightLines) {
        ctx.fillText(line, rightCenterX, rightY + rightLineHeight / 2, rightMaxWidth);
        rightY += rightLineHeight;
      }
      ctx.restore();
    };

    const drawSingle = async () => {
      const leftCanvas = leftCanvasRef.current;
      const rightCanvas = rightCanvasRef.current;
      if (!leftCanvas || !rightCanvas) return;
      const lctx = leftCanvas.getContext('2d');
      const rctx = rightCanvas.getContext('2d');
      if (!lctx || !rctx) return;

      const needOverlay = typeof giverImageUrl === 'string' && !!giverImageUrl.trim();
      const [loadedImg, overlay]: [HTMLImageElement, HTMLImageElement | null] = await Promise.all([
        loadImageWithCorsFallback(imageUrl),
        needOverlay
          ? loadImageWithCorsFallback(giverImageUrl as string).catch(() => null)
          : Promise.resolve(null),
      ]);
      const img: HTMLImageElement = loadedImg;

      // 左右各自画半张（裁剪）
      const fullW = img.naturalWidth;
      const fullH = img.naturalHeight;
      const halfW = Math.floor(fullW / 2);

      // 左页（Giver；若有头像则优先绘制头像）
      leftCanvas.width = halfW;
      leftCanvas.height = fullH;
      lctx.clearRect(0, 0, halfW, fullH);
      lctx.drawImage(img, 0, 0, halfW, fullH, 0, 0, halfW, fullH);
      lctx.save();
      lctx.fillStyle = '#222222';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      const padding = Math.round(halfW * 0.06);
      const lMaxW = halfW - padding * 2;
      const hasAvatarLeft = !!(needOverlay && overlay && overlay.naturalWidth > 0 && overlay.naturalHeight > 0);
      if (hasAvatarLeft && overlay) {
        const targetSize = Math.min(halfW - padding * 2, fullH - padding * 2) * 0.45;
        const targetX = halfW / 2 - targetSize / 2;
        const targetY = fullH / 2 - targetSize / 2;
        const o = overlay as HTMLImageElement;
        const srcSize = Math.min(o.naturalWidth, o.naturalHeight);
        const sx = Math.floor((o.naturalWidth - srcSize) / 2);
        const sy = Math.floor((o.naturalHeight - srcSize) / 2);
        lctx.drawImage(o, sx, sy, srcSize, srcSize, targetX, targetY, targetSize, targetSize);
      } else {
        lctx.font = `${giverPx}px ${giverFontFamily}`;
        const lLines = wrapText(lctx, (giverText || '').trim(), lMaxW);
        const lLH = Math.round(giverPx * 1.25);
        const lTotalH = lLines.length * lLH;
        let lY = fullH / 2 - lTotalH / 2;
        for (const line of lLines) {
          lctx.fillText(line, halfW / 2, lY + lLH / 2, lMaxW);
          lY += lLH;
        }
      }
      lctx.restore();

      // 右页（Dedication）
      rightCanvas.width = halfW;
      rightCanvas.height = fullH;
      rctx.clearRect(0, 0, halfW, fullH);
      // 源图右半裁剪
      rctx.drawImage(img, halfW, 0, halfW, fullH, 0, 0, halfW, fullH);
      rctx.save();
      rctx.fillStyle = '#222222';
      rctx.textAlign = 'center';
      rctx.textBaseline = 'middle';
      const rMaxW = halfW - padding * 2;
      rctx.font = `${dedicationPx}px ${dedicationFontFamily}`;
      const rLines = wrapText(rctx, (dedicationText || '').trim(), rMaxW);
      const rLH = Math.round(dedicationPx * 1.25);
      const rTotalH = rLines.length * rLH;
      let rY = fullH / 2 - rTotalH / 2;
      for (const line of rLines) {
        rctx.fillText(line, halfW / 2, rY + rLH / 2, rMaxW);
        rY += rLH;
      }
      rctx.restore();
    };

    (async () => {
      try {
        if (mode === 'double') {
          await drawDouble();
        } else {
          await drawSingle();
        }
      } catch (e) {
        console.error('GiverDedicationCanvas draw error:', e);
      }
    })();
  }, [ready, imageUrl, mode, giverText, dedicationText, giverImageUrl, giverPx, dedicationPx]);

  if (mode === 'double') {
    return (
      <div className={rootClassName}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    );
  }
  return (
    <div className={rootClassName}>
      <div className="flex flex-col items-center gap-4">
        {/* 左半：结构与 PreviewPageItem 单页模式保持一致 */}
        <div className="w-full flex justify-center">
          <div className="relative max-w-[500px] w-full rounded-lg overflow-hidden" style={{ aspectRatio: '512/519' }}>
            <canvas ref={leftCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>
        {leftBelow}
        {/* 右半：结构与 PreviewPageItem 单页模式保持一致 */}
        <div className="w-full flex justify-center">
          <div className="relative max-w-[500px] w-full rounded-lg overflow-hidden" style={{ aspectRatio: '512/519' }}>
            <canvas ref={rightCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>
        {rightBelow}
      </div>
    </div>
  );
}

