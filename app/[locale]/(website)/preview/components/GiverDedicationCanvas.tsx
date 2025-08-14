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

    const drawDouble = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });

      // 使用原图分辨率，保证高精度（近似 300dpi 来源自图像像素）
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 左右半区
      const halfW = canvas.width / 2;
      const padding = Math.round(canvas.width * 0.03); // 基于宽度的内边距

      // Giver（根据语言动态选择：中文→思源黑体；非中文→Roboto）
      ctx.save();
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${giverPx}px ${giverFontFamily}`;
      const giverMaxWidth = halfW - padding * 2;
      const giverLines = wrapText(ctx, (giverText || '').trim(), giverMaxWidth);
      const giverLineHeight = Math.round(giverPx * 1.25);
      const giverTotalHeight = giverLines.length * giverLineHeight;
      let giverY = canvas.height / 2 - giverTotalHeight / 2;
      for (const line of giverLines) {
        ctx.fillText(line, halfW / 2, giverY + giverLineHeight / 2, giverMaxWidth);
        giverY += giverLineHeight;
      }
      ctx.restore();

      // Dedication（根据语言动态选择：中文→思源黑体；非中文→Philosopher）
      ctx.save();
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${dedicationPx}px ${dedicationFontFamily}`;
      const rightCenterX = halfW + halfW / 2;
      const dedicationMaxWidth = halfW - padding * 2;
      const dedicationLines = wrapText(
        ctx,
        (dedicationText || '').trim(),
        dedicationMaxWidth
      );
      const dedicationLineHeight = Math.round(dedicationPx * 1.25);
      const dedicationTotalHeight = dedicationLines.length * dedicationLineHeight;
      let dedicationY = canvas.height / 2 - dedicationTotalHeight / 2;
      for (const line of dedicationLines) {
        ctx.fillText(line, rightCenterX, dedicationY + dedicationLineHeight / 2, dedicationMaxWidth);
        dedicationY += dedicationLineHeight;
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

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });

      // 左右各自画半张（裁剪）
      const fullW = img.naturalWidth;
      const fullH = img.naturalHeight;
      const halfW = Math.floor(fullW / 2);

      // 左页
      leftCanvas.width = halfW;
      leftCanvas.height = fullH;
      lctx.clearRect(0, 0, halfW, fullH);
      lctx.drawImage(img, 0, 0, halfW, fullH, 0, 0, halfW, fullH);
      lctx.save();
      lctx.fillStyle = '#222222';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.font = `${giverPx}px ${giverFontFamily}`;
      const padding = Math.round(halfW * 0.06);
      const lMaxW = halfW - padding * 2;
      const lLines = wrapText(lctx, (giverText || '').trim(), lMaxW);
      const lLH = Math.round(giverPx * 1.25);
      const lTotalH = lLines.length * lLH;
      let lY = fullH / 2 - lTotalH / 2;
      for (const line of lLines) {
        lctx.fillText(line, halfW / 2, lY + lLH / 2, lMaxW);
        lY += lLH;
      }
      lctx.restore();

      // 右页
      rightCanvas.width = halfW;
      rightCanvas.height = fullH;
      rctx.clearRect(0, 0, halfW, fullH);
      // 源图右半裁剪
      rctx.drawImage(img, halfW, 0, halfW, fullH, 0, 0, halfW, fullH);
      rctx.save();
      rctx.fillStyle = '#222222';
      rctx.textAlign = 'center';
      rctx.textBaseline = 'middle';
      rctx.font = `${dedicationPx}px ${dedicationFontFamily}`;
      const rMaxW = halfW - padding * 2;
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

    if (mode === 'double') {
      drawDouble();
    } else {
      drawSingle();
    }
  }, [ready, imageUrl, mode, giverText, dedicationText, giverPx, dedicationPx]);

  if (mode === 'double') {
    return (
      <div className={className}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-8">
        <div className="w-full flex flex-col items-center gap-4">
          <canvas ref={leftCanvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
          {leftBelow}
        </div>
        <div className="w-full flex flex-col items-center gap-4">
          <canvas ref={rightCanvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
          {rightBelow}
        </div>
      </div>
    </div>
  );
}

