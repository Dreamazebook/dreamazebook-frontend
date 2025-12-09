'use client';

import React, { useRef, useEffect } from 'react';
import { batamy } from '@/app/fonts';

export interface CoverTextProperty {
  type?: string;
  font?: string;
  fontWeight?: string;
  fontSize?: number;
  color?: string;
  position?: { x: number; y: number };
  alignment?: string;
}

interface CoverNameCanvasProps {
  src: string;
  name: string;
  texts: CoverTextProperty[];
  className?: string;
  onRendered?: (dataUrl: string) => void;
}

/**
 * 封面名字 Canvas 组件：在 R2 封面图上根据 page_properties.json 绘制用户姓名
 */
const CoverNameCanvas: React.FC<CoverNameCanvasProps> = ({
  src,
  name,
  texts,
  className,
  onRendered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadImageWithCorsFallback = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        // 优先尝试 CORS，失败后降级为普通加载
        const corsImg = new (window as any).Image();
        corsImg.crossOrigin = 'anonymous';
        corsImg.onload = () => resolve(corsImg);
        corsImg.onerror = () => {
          const img = new (window as any).Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        };
        corsImg.src = url;
      });
    };

    const draw = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = await loadImageWithCorsFallback(src);
        if (cancelled) return;

        const w = img.naturalWidth || (img as any).width;
        const h = img.naturalHeight || (img as any).height;
        if (!w || !h) return;

        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        if (!name.trim()) return;
        if (!Array.isArray(texts) || texts.length === 0) return;

        // 只处理 type === 'dynamic' 的配置
        texts.forEach((t) => {
          if (!t || t.type !== 'dynamic') return;
          const pos = t.position || { x: 0, y: 0 };
          const x = pos.x || 0;
          const y = pos.y || 0;

          ctx.fillStyle = t.color || '#0c1f3e';
          // page_properties 中的 fontSize 按 300dpi 下的 pt 存储，这里换算为像素：
          // px = pt * 300 / 72
          const rawSize = typeof t.fontSize === 'number' ? t.fontSize : 70;
          const fontSizePx = rawSize * (300 / 72);
          const isBatamy = (t.font || '').toLowerCase() === 'batamy';
          const fontFamily = isBatamy
            ? batamy.style.fontFamily
            : (t.font
              ? `"${t.font}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
              : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
          const fontWeight = t.fontWeight === 'bold' ? 'bold' : 'normal';
          ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

          const alignment = (t.alignment || 'left').toLowerCase();
          if (alignment === 'center') {
            ctx.textAlign = 'center';
          } else if (alignment === 'right') {
            ctx.textAlign = 'right';
          } else {
            ctx.textAlign = 'left';
          }
          ctx.textBaseline = 'top';

          ctx.fillText(name, x, y);
        });

        // 通知外部：当前封面已完成合成，返回 DataURL 以便缓存（避免重复绘制）
        if (onRendered) {
          try {
            const url = canvas.toDataURL('image/png');
            onRendered(url);
          } catch {
            // 忽略 DataURL 生成失败
          }
        }
      } catch (e) {
        console.warn('Failed to draw cover canvas:', e);
      }
    };

    draw();

    return () => {
      cancelled = true;
    };
  }, [src, name, texts, onRendered]);

  return (
    <canvas
      ref={canvasRef}
      className={className || "w-full h-auto block"}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
};

export default CoverNameCanvas;

