'use client';

import React, { useRef, useEffect } from 'react';

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

    // 关键：Canvas 的 fillText 不会“自动等待字体下载完成”。
    // 默认封面第一次绘制时，如果字体尚未 ready，会先用 fallback 字体画上去；
    // 后续交互（切 tab / 点 option）触发重绘，才会变成正确字体。
    // 这里用 FontFace + document.fonts 显式确保字体可用后再绘制。

    const normalizeFontKey = (rawFont?: string) =>
      String(rawFont || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]/g, '');

    const normalizeFontWeight = (rawWeight?: string) => {
      const w = String(rawWeight || '').trim().toLowerCase();
      // 兼容 JSON 中可能出现的 'Bold' / '700'
      if (w === 'bold' || w === '700' || w === '800' || w === '900') return 'bold';
      return 'normal';
    };

    type KnownFont = {
      family: string;
      urls: {
        normal: string;
        bold?: string;
      };
    };

    const fontRegistry: Record<string, KnownFont> = {
      batamy: { family: 'Batamy', urls: { normal: '/fonts/Batamy-Regular.ttf' } },
      // 注意：Caslon Antique 有独立 Bold 文件，需要按 weight 选择 url
      caslonantique: {
        family: 'Caslon Antique',
        urls: { normal: '/fonts/CaslonAntique-Regular.ttf', bold: '/fonts/CaslonAntique-Bold.ttf' },
      },
      notosanssc: { family: 'Noto Sans SC', urls: { normal: '/fonts/NotoSansSC-Regular.ttf' } },
      alittlemonster: { family: 'ALittleMonster', urls: { normal: '/fonts/ALittleMonster.ttf' } },
    };

    const resolveFontInfo = (rawFont?: string) => {
      const key = normalizeFontKey(rawFont);
      if (!key) return null;
      if (key.includes('batamy')) return fontRegistry.batamy;
      if (key.includes('caslonantique') || key === 'caslon') return fontRegistry.caslonantique;
      if (key.includes('notosanssc') || key.includes('notosans')) return fontRegistry.notosanssc;
      if (key.includes('alittlemonster')) return fontRegistry.alittlemonster;
      return null;
    };

    const resolveFontFamily = (rawFont?: string) => {
      const direct = String(rawFont || '').trim();
      const known = resolveFontInfo(rawFont);
      if (known) {
        // 让已知字体名排在最前，保证 ctx.font 命中正确 family
        return `"${known.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      }
      if (direct) {
        return `"${direct}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      }
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    };

    const ensureFontReady = async (rawFont: string | undefined, weight: string, sizePx: number) => {
      try {
        const fontsAny = (document as any)?.fonts;
        if (!fontsAny?.load) return;

        const known = resolveFontInfo(rawFont);
        if (known && typeof (window as any).FontFace === 'function') {
          const url =
            weight === 'bold' && known.urls.bold
              ? known.urls.bold
              : known.urls.normal;
          // 如果还未注册该 family，则用 FontFace 主动注册并加载
          const exists = fontsAny.check?.(`${weight} ${Math.max(1, Math.floor(sizePx))}px "${known.family}"`);
          if (!exists) {
            try {
              const ff = new (window as any).FontFace(known.family, `url(${url})`, { weight });
              const loaded = await Promise.race([
                ff.load(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('font load timeout')), 1500)),
              ]);
              fontsAny.add(loaded);
            } catch {
              // ignore
            }
          }
          // 触发浏览器加载并等待 ready
          await Promise.race([
            fontsAny.load(`${weight} ${Math.max(1, Math.floor(sizePx))}px "${known.family}"`),
            fontsAny.ready,
            new Promise((resolve) => setTimeout(resolve, 800)),
          ]);
          return;
        }

        // 未知字体：尽力加载（如果页面上有对应 @font-face，会起作用）
        const family = String(rawFont || '').trim().replace(/^"(.+)"$/, '$1');
        if (!family) return;
        await Promise.race([
          fontsAny.load(`${weight} ${Math.max(1, Math.floor(sizePx))}px "${family}"`),
          fontsAny.ready,
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      } catch {
        // ignore
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
            const fontWeight = normalizeFontWeight(t.fontWeight);
            return ensureFontReady(t.font, fontWeight, fontSizePx);
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
          const fontWeight = normalizeFontWeight(t.fontWeight);
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

