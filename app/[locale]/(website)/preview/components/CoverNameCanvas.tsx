'use client';

import React, { useEffect, useRef } from 'react';
import {
  canDrawCoverTexts,
  isDrawableCoverTextElement,
  resolveCoverElementText,
  type CoverTextVariables,
} from '@/utils/coverTextVariables';

const registeredCoverFonts = new Set<string>();

export interface CoverTextProperty {
  type?: string;
  text?: string;
  font?: string;
  fontWeight?: string;
  font_weight?: string;
  fontStyle?: string;
  font_style?: string;
  fontSize?: number;
  font_size?: number;
  color?: string;
  theme_colors?: Record<string, { color?: string }>;
  position?: { x: number; y: number };
  alignment?: string;
  syntheticItalic?: boolean;
  italicAngle?: number;
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
  variables?: CoverTextVariables;
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
  variables,
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

    const normalizeFontKey = (rawFont?: string) =>
      String(rawFont || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]/g, '');

    const normalizeFontWeight = (rawWeight?: string) => {
      const w = String(rawWeight || '').trim().toLowerCase();
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

    type KnownFont = {
      family: string;
      urls: {
        normal: string;
        bold?: string;
      };
    };

    const fontRegistry: Record<string, KnownFont> = {
      batamy: { family: 'Batamy', urls: { normal: '/fonts/Batamy-Regular.ttf' } },
      caslonantique: {
        family: 'Caslon Antique',
        urls: { normal: '/fonts/CaslonAntique-Regular.ttf', bold: '/fonts/CaslonAntique-Bold.ttf' },
      },
      marcellus: { family: 'Marcellus', urls: { normal: '/fonts/Marcellus-Regular.ttf' } },
      notosanssc: { family: 'Noto Sans SC', urls: { normal: '/fonts/NotoSansSC-Regular.ttf' } },
      alittlemonster: { family: 'ALittleMonster', urls: { normal: '/fonts/ALittleMonster.ttf' } },
      rowdies: { family: 'Rowdies', urls: { normal: '/fonts/Rowdies-Regular.ttf' } },
    };

    const resolveFontInfo = (rawFont?: string) => {
      const key = normalizeFontKey(rawFont);
      if (!key) return null;
      if (key.includes('batamy')) return fontRegistry.batamy;
      if (key.includes('caslonantique') || key === 'caslon') return fontRegistry.caslonantique;
      if (key.includes('marcellus')) return fontRegistry.marcellus;
      if (key.includes('notosanssc') || key.includes('notosans')) return fontRegistry.notosanssc;
      if (key.includes('alittlemonster')) return fontRegistry.alittlemonster;
      if (key.includes('rowdies')) return fontRegistry.rowdies;
      return null;
    };

    const resolveFontFamily = (rawFont?: string) => {
      const direct = String(rawFont || '').trim();
      const known = resolveFontInfo(rawFont);
      if (known) {
        return known.family;
      }
      if (direct) {
        return direct.replace(/^"(.+)"$/, '$1');
      }
      return 'sans-serif';
    };

    const buildCanvasFont = (
      t: CoverTextProperty,
      fontSizePx: number,
    ) => {
      const fontWeight = normalizeFontWeight(getTextFontWeight(t));
      const fontFamily = resolveFontFamily(t.font);
      const size = Math.max(1, Math.round(fontSizePx));
      // 与 Batamy 等已验证封面一致：仅 weight + size + family，避免 oblique 导致整段回退
      return `${fontWeight} ${size}px "${fontFamily}"`;
    };

    const ensureFontReady = async (t: CoverTextProperty, fontSizePx: number) => {
      const fontsAny = (document as any)?.fonts;
      if (!fontsAny?.load) return;

      const fontString = buildCanvasFont(t, fontSizePx);
      const known = resolveFontInfo(t.font);

      try {
        if (known && typeof (window as any).FontFace === 'function') {
          const fontWeight = normalizeFontWeight(getTextFontWeight(t));
          const url =
            fontWeight === 'bold' && known.urls.bold
              ? known.urls.bold
              : known.urls.normal;

          const faceKey = `${known.family}:${fontWeight}`;

          if (!registeredCoverFonts.has(faceKey)) {
            try {
              const ff = new (window as any).FontFace(known.family, `url(${url})`, {
                weight: fontWeight === 'bold' ? '700' : '400',
                style: 'normal',
              });
              const loaded = await ff.load();
              fontsAny.add(loaded);
              registeredCoverFonts.add(faceKey);
            } catch (err) {
              console.warn(`[CoverNameCanvas] FontFace load failed for ${known.family}:`, err);
            }
          }
        }

        await fontsAny.load(fontString);
        if (!fontsAny.check?.(fontString)) {
          await fontsAny.ready;
          await fontsAny.load(fontString);
        }
      } catch (err) {
        console.warn('[CoverNameCanvas] ensureFontReady failed:', fontString, err);
      }
    };

    const loadImageWithCorsFallback = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
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

    const drawTextAt = (
      ctx: CanvasRenderingContext2D,
      textValue: string,
      x: number,
      y: number,
      t: CoverTextProperty,
    ) => {
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
    };

    const draw = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resolvedVariables: CoverTextVariables = {
          name: String(name || '').trim(),
          full_name: String(name || '').trim(),
          recipient_name: String(name || '').trim(),
          ...(variables || {}),
        };
        if (!resolvedVariables.name) {
          resolvedVariables.name = String(resolvedVariables.full_name || '').trim();
        }
        if (!resolvedVariables.full_name) {
          resolvedVariables.full_name = resolvedVariables.name;
        }

        const drawableTexts = (Array.isArray(texts) ? texts : []).filter((t) => isDrawableCoverTextElement(t));
        if (!canDrawCoverTexts(drawableTexts, resolvedVariables)) return;

        const img = await loadImageWithCorsFallback(src);
        if (cancelled) return;

        const w = img.naturalWidth || (img as any).width;
        const h = img.naturalHeight || (img as any).height;
        if (!w || !h) return;

        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const resolvedValues = drawableTexts.map((t) => resolveCoverElementText(t, resolvedVariables));
        const longestCharCount = Math.max(
          0,
          ...resolvedValues.map((value) => Array.from(value.trim()).length),
        );
        const fontScale = longestCharCount > 10 ? 0.92 : 1;

        await Promise.all(
          drawableTexts.map((t) => {
            const rawSize = getTextFontSize(t);
            const fontSizePx = rawSize * (300 / 72) * fontScale;
            return ensureFontReady(t, fontSizePx);
          }),
        );
        if (cancelled) return;

        drawableTexts.forEach((t, index) => {
          const pos = t.position || { x: 0, y: 0 };
          const x = pos.x || 0;
          const y = pos.y || 0;
          const textValue = resolvedValues[index];
          if (!textValue.trim()) return;

          ctx.save();
          ctx.fillStyle = resolveTextColor(t);

          const rawSize = getTextFontSize(t);
          const fontSizePx = rawSize * (300 / 72) * fontScale;
          ctx.font = buildCanvasFont(t, fontSizePx);

          const alignment = (t.alignment || 'left').toLowerCase();
          if (alignment === 'center') {
            ctx.textAlign = 'center';
          } else if (alignment === 'right') {
            ctx.textAlign = 'right';
          } else {
            ctx.textAlign = 'left';
          }
          ctx.textBaseline = 'top';

          const useSyntheticItalic = t.syntheticItalic === true;
          const italicAngle = Number.isFinite(Number(t.italicAngle)) ? Number(t.italicAngle) : 10;
          if (useSyntheticItalic) {
            const skewX = -Math.tan((italicAngle * Math.PI) / 180);
            ctx.translate(x, y);
            ctx.transform(1, 0, skewX, 1, 0, 0);
            drawTextAt(ctx, textValue, 0, 0, t);
          } else {
            drawTextAt(ctx, textValue, x, y, t);
          }

          ctx.restore();
        });

        if (onRenderedRef.current) {
          try {
            const url = canvas.toDataURL('image/png');
            onRenderedRef.current(url);
          } catch {
            // ignore
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
  }, [src, name, texts, variables]);

  return (
    <canvas
      ref={canvasRef}
      className={className || 'block w-full h-auto'}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
};

export default CoverNameCanvas;
