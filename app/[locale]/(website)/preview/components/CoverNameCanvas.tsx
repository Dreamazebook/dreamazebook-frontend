'use client';

import React, { useRef, useEffect } from 'react';
import { aLittleMonster, batamy, caslonAntique, notoSansSC } from '@/app/fonts';

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

    const resolveFontFamily = (rawFont?: string) => {
      const f = (rawFont || '').trim();
      const key = f.toLowerCase().replace(/[\s_-]/g, '');
      if (!key) {
        return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      }
      if (key.includes('batamy')) return batamy.style.fontFamily;
      if (key.includes('caslonantique') || key === 'caslon') return caslonAntique.style.fontFamily;
      if (key.includes('notosanssc') || key.includes('notosans')) return notoSansSC.style.fontFamily;
      if (key.includes('alittlemonster')) return aLittleMonster.style.fontFamily;
      // 兜底：尝试使用 page_properties 里的字体名（假设已通过 CSS/字体文件加载）
      return `"${f}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    };

    const loadFontIfNeeded = async (font: string, weight: string, sizePx: number) => {
      try {
        // document.fonts.load 的 family 参数需要是单个 family（不要带逗号后的 fallback）
        const family = String(font).split(',')[0].trim().replace(/^"(.+)"$/, '$1');
        const fontsAny = (document as any)?.fonts;
        if (!fontsAny?.load) return;
        await Promise.race([
          fontsAny.load(`${weight} ${Math.max(1, Math.floor(sizePx))}px "${family}"`),
          new Promise((resolve) => setTimeout(resolve, 800)), // 避免首次加载卡太久
        ]);
      } catch {
        // 忽略字体加载失败，继续用 fallback
      }
    };

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

        // 确保涉及到的字体在绘制前已加载（否则 Canvas 会先用 fallback 字体渲染）
        const dynamicTexts = texts.filter((t) => t && t.type === 'dynamic');
        await Promise.all(
          dynamicTexts.map((t) => {
            const rawSize = typeof t.fontSize === 'number' ? t.fontSize : 70;
            const fontSizePx = rawSize * (300 / 72);
            const fontFamily = resolveFontFamily(t.font);
            const fontWeight = t.fontWeight === 'bold' ? 'bold' : 'normal';
            return loadFontIfNeeded(fontFamily, fontWeight, fontSizePx);
          }),
        );
        if (cancelled) return;

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
          const fontFamily = resolveFontFamily(t.font);
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

