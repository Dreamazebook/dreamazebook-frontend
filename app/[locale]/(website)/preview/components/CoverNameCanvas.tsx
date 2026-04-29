'use client';

import React, { useEffect, useRef } from 'react';

export interface CoverTextProperty {
  type?: string;
  font?: string;
  fontWeight?: string;
  font_weight?: string;
  fontSize?: number;
  font_size?: number;
  color?: string;
  theme_colors?: Record<string, { color?: string }>;
  position?: { x: number; y: number };
  alignment?: string;
  shadow_blur?: number;
  shadow_color?: string;
  shadow_opacity?: number;
  shadow_offset_x?: number;
  shadow_offset_y?: number;
  stroke_color?: string;
  stroke_width?: number;
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
  const onRenderedRef = useRef<CoverNameCanvasProps['onRendered']>(onRendered);

  useEffect(() => {
    onRenderedRef.current = onRendered;
  }, [onRendered]);

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

    const getTextFontSize = (t: CoverTextProperty) =>
      typeof t.fontSize === 'number'
        ? t.fontSize
        : typeof t.font_size === 'number'
          ? t.font_size
          : 70;

    const getTextFontWeight = (t: CoverTextProperty) => t.fontWeight || t.font_weight;

    const getCoverThemeKey = () => {
      const raw = src.toLowerCase();
      if (raw.includes('season=autumn') || raw.includes('/autumn.webp')) return 'autumn';
      if (raw.includes('season=winter') || raw.includes('/winter.webp')) return 'winter';
      if (raw.includes('season=spring') || raw.includes('/spring.webp')) return 'spring';
      if (raw.includes('season=summer') || raw.includes('/summer.webp')) return 'summer';
      return '';
    };

    const resolveTextColor = (t: CoverTextProperty) => {
      if (t.color) return t.color;
      const themeKey = getCoverThemeKey();
      const themeColors = t.theme_colors || {};
      return (
        themeColors[themeKey]?.color ||
        ((themeKey === 'spring' || themeKey === 'summer') ? themeColors.green?.color : undefined) ||
        '#0c1f3e'
      );
    };

    const getDynamicTextValue = (type: string | undefined, rawName: string) => {
      const trimmed = rawName.trim();
      if (type === 'dynamic_possessive') {
        return trimmed.endsWith('s') ? `${trimmed}'` : `${trimmed}'s`;
      }
      return trimmed;
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
      // PICBOOK_MELODY 等封面 page_properties 常用
      marcellus: { family: 'Marcellus', urls: { normal: '/fonts/Marcellus-Regular.ttf' } },
      notosanssc: { family: 'Noto Sans SC', urls: { normal: '/fonts/NotoSansSC-Regular.ttf' } },
      alittlemonster: { family: 'ALittleMonster', urls: { normal: '/fonts/ALittleMonster.ttf' } },
    };

    const resolveFontInfo = (rawFont?: string) => {
      const key = normalizeFontKey(rawFont);
      if (!key) return null;
      if (key.includes('batamy')) return fontRegistry.batamy;
      if (key.includes('caslonantique') || key === 'caslon') return fontRegistry.caslonantique;
      if (key.includes('marcellus')) return fontRegistry.marcellus;
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

        // 规则：名字超过 10 个字符时，字号稍微缩小一点点
        // 用 Array.from 兼容 emoji/代理对的长度计算
        const nameCharCount = Array.from(name.trim()).length;
        const fontScale = nameCharCount > 10 ? 0.92 : 1;

        // 确保涉及到的字体在绘制前已加载（否则 Canvas 会先用 fallback 字体渲染）
        const dynamicTexts = texts.filter((t) => t && (t.type === 'dynamic' || t.type === 'dynamic_possessive'));
        await Promise.all(
          dynamicTexts.map((t) => {
            const rawSize = getTextFontSize(t);
            const fontSizePx = rawSize * (300 / 72) * fontScale;
            const fontWeight = normalizeFontWeight(getTextFontWeight(t));
            return ensureFontReady(t.font, fontWeight, fontSizePx);
          }),
        );
        if (cancelled) return;

        // 处理动态名字文本
        texts.forEach((t) => {
          if (!t || (t.type !== 'dynamic' && t.type !== 'dynamic_possessive')) return;
          const pos = t.position || { x: 0, y: 0 };
          const x = pos.x || 0;
          const y = pos.y || 0;
          const textValue = getDynamicTextValue(t.type, name);

          ctx.fillStyle = resolveTextColor(t);
          // page_properties 中的 fontSize 按 300dpi 下的 pt 存储，这里换算为像素：
          // px = pt * 300 / 72
          const rawSize = getTextFontSize(t);
          const fontSizePx = rawSize * (300 / 72) * fontScale;
          const fontFamily = resolveFontFamily(t.font);
          const fontWeight = normalizeFontWeight(getTextFontWeight(t));
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

          const shadowBlur = Number(t.shadow_blur || 0);
          if (shadowBlur > 0) {
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = t.shadow_color || 'rgba(0,0,0,0.25)';
            ctx.shadowOffsetX = Number(t.shadow_offset_x || 0);
            ctx.shadowOffsetY = Number(t.shadow_offset_y || 0);
            if (t.shadow_opacity != null && t.shadow_color) {
              const alpha = Math.max(0, Math.min(1, Number(t.shadow_opacity)));
              ctx.globalAlpha = alpha;
              ctx.fillText(textValue, x, y);
              ctx.globalAlpha = 1;
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }
          }

          const strokeWidth = Number(t.stroke_width || 0);
          if (strokeWidth > 0 && t.stroke_color) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = t.stroke_color;
            ctx.strokeText(textValue, x, y);
          }
          ctx.fillText(textValue, x, y);
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        });

        // 通知外部：当前封面已完成合成，返回 DataURL 以便缓存（避免重复绘制）
        if (onRenderedRef.current) {
          try {
            const url = canvas.toDataURL('image/png');
            onRenderedRef.current(url);
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
  }, [src, name, texts]);

  return (
    <canvas
      ref={canvasRef}
      className={className || "w-full h-auto block"}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
};

export default CoverNameCanvas;

