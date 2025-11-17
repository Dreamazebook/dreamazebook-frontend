/** @jsxImportSource react */
'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AvatarCanvasProps {
  bookId: string;
  skinColor: string;
  hairstyle: string;
  hairColor: string;
  gender?: '' | 'boy' | 'girl';
  width?: number;
  height?: number;
}

interface PageProperties {
  skinToneFilter?: {
    [key: string]: {
      saturate?: string;
      hue?: string;
      brightness?: string;
      contrast?: string;
    };
  };
  hairColorFilter?: {
    [key: string]: {
      saturate?: string;
      hue?: string;
      brightness?: string;
      contrast?: string;
    };
  };
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  bookId,
  skinColor,
  hairstyle,
  hairColor,
  gender,
  width = 270,
  height = 203,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageProperties, setPageProperties] = useState<PageProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [bgAspect, setBgAspect] = useState<number | null>(null); // width / height
  // 用于避免异步绘制竞态：只保留最后一次 drawAvatar 的结果
  const drawVersionRef = useRef(0);

  // 加载 page_properties.json，包含多路径尝试与无缓存
  useEffect(() => {
    let cancelled = false;
    const loadPageProperties = async () => {
      setIsLoading(true);
      const cacheBuster = `ts=${Date.now()}`;
      const candidatePaths = [
        `/products/picbooks/${bookId}/avatar/skin_properties.json?${cacheBuster}`,
        // 回退为默认 SPU 资源
        `/products/picbooks/PICBOOK_GOODNIGHT/avatar/skin_properties.json?${cacheBuster}`,
      ];

      for (const path of candidatePaths) {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (res.ok) {
            const props = await res.json();
            if (!cancelled) {
              setPageProperties(props);
              setIsLoading(false);
            }
            return;
          }
        } catch (err) {
          console.warn('Failed to fetch skin_properties from', path, err);
        }
      }

      // 所有路径均失败时，提供一个安全的默认配置
      const fallbackProperties: PageProperties = {
        skinToneFilter: {
          brown: { saturate: '+2', hue: '-4', brightness: '-31' },
          dark: { brightness: '-80', contrast: '-30' },
        },
        hairColorFilter: {
          blone: { saturate: '+27', hue: '+12', brightness: '+10' },
          dark: { brightness: '-40', contrast: '-18' },
        },
      };
      if (!cancelled) {
        console.warn('Using fallback skin_properties configuration');
        setPageProperties(fallbackProperties);
        setIsLoading(false);
      }
    };

    loadPageProperties();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // 监听容器宽度，做自适应
  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const update = () => setContainerWidth(Math.round(el.clientWidth));
    update();
    const RO = (window as any).ResizeObserver;
    const ro = RO ? new RO((entries: any[]) => {
      for (const e of entries) {
        setContainerWidth(Math.round(e.contentRect.width));
      }
    }) : null;
    if (ro && el) ro.observe(el);
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    return () => {
      try { if (ro && el) ro.unobserve(el); } catch {}
      try { if (ro) ro.disconnect(); } catch {}
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // 预加载背景以获取原始宽高比
  useEffect(() => {
    let cancelled = false;
    const loadBg = async () => {
      try {
        const ts = Date.now();
        // 对于 birthday 书籍，根据性别选择不同的背景图层
        const candidates: string[] = [];
        if (bookId === 'PICBOOK_BIRTHDAY') {
          // Birthday 书籍：如果选择了性别，使用性别特定背景图；否则默认使用男孩背景图
          const genderBg = gender === 'girl' ? 'layer_background_girl.png' : 'layer_background_boy.png';
          candidates.push(`/products/picbooks/${bookId}/avatar/${genderBg}?ts=${ts}`);
        } else {
          // 其他书籍：使用原有逻辑
          candidates.push(
            `/products/picbooks/${bookId}/avatar/layer_background.png?ts=${ts}`,
            `/products/picbooks/PICBOOK_GOODNIGHT/avatar/layer_background.png?ts=${ts}`
          );
        }
        for (const src of candidates) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((res, rej) => { img.onload = res as any; img.onerror = rej; img.src = src; });
            const w = (img as any).naturalWidth || img.width;
            const h = (img as any).naturalHeight || img.height;
            if (!cancelled && w > 0 && h > 0) {
              setBgAspect(w / h);
              return;
            }
          } catch {}
        }
      } catch {}
    };
    loadBg();
    return () => { cancelled = true; };
  }, [bookId, gender]);

  // 标准像素级滤镜处理
  // 复用脚本中的 normalizeNumber 与 applyFilterToImageData
  const normalizeNumber = (val: number | string | undefined, fallback = 0): number => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'number') return val;
    const s = String(val).trim();
    if (s.endsWith('deg')) return parseFloat(s.replace('deg', '')) || fallback;
    return parseFloat(s.replace('+', '')) || fallback;
  };

  const applyFilterToImageData = (imageData: ImageData, filter?: any): ImageData => {
    if (!filter) return imageData;
    const data = imageData.data;

    const B = Math.max(-100, Math.min(100, normalizeNumber(filter.brightness, 0)));
    const C = Math.max(-100, Math.min(100, normalizeNumber((filter as any).contrast ?? (filter as any).contract, 0)));
    const S = Math.max(-100, Math.min(100, normalizeNumber(filter.saturate, 0)));
    const H = normalizeNumber(filter.hue, 0);

    const bAdd = 255 * (B / 100);
    const cMul = 1 + (C / 100);

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness + Contrast
      r = ((r + bAdd) - 128) * cMul + 128;
      g = ((g + bAdd) - 128) * cMul + 128;
      b = ((b + bAdd) - 128) * cMul + 128;

      // Saturation + Hue (HSL)
      if (S !== 0 || H !== 0) {
        let rN = r / 255;
        let gN = g / 255;
        let bN = b / 255;

        const max = Math.max(rN, gN, bN);
        const min = Math.min(rN, gN, bN);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const delta = max - min;
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
          switch (max) {
            case rN:
              h = (gN - bN) / delta + (gN < bN ? 6 : 0);
              break;
            case gN:
              h = (bN - rN) / delta + 2;
              break;
            default:
              h = (rN - gN) / delta + 4;
              break;
          }
          h /= 6;
        }

        const sScale = 1 + (S / 100);
        h = (h + (H / 360)) % 1;
        if (h < 0) h += 1;
        s = Math.max(0, Math.min(1, s * sScale));

        let r2: number, g2: number, b2: number;
        if (s === 0) {
          r2 = g2 = b2 = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p2 = 2 * l - q;
          const hue2rgb = (p: number, qv: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (qv - p) * 6 * t;
            if (t < 1 / 2) return qv;
            if (t < 2 / 3) return p + (qv - p) * (2 / 3 - t) * 6;
            return p;
          };
          r2 = hue2rgb(p2, q, h + 1 / 3);
          g2 = hue2rgb(p2, q, h);
          b2 = hue2rgb(p2, q, h - 1 / 3);
        }

        r = r2 * 255;
        g = g2 * 255;
        b = b2 * 255;
      }

      data[i] = r < 0 ? 0 : (r > 255 ? 255 : r | 0);
      data[i + 1] = g < 0 ? 0 : (g > 255 ? 255 : g | 0);
      data[i + 2] = b < 0 ? 0 : (b > 255 ? 255 : b | 0);
      data[i + 3] = a;
    }

    return imageData;
  };

  const applyPixelFilter = (ctx: CanvasRenderingContext2D, filterConfig: any, x: number, y: number, w: number, h: number) => {
    if (!filterConfig) return;
    try {
      const imageData = ctx.getImageData(x, y, w, h);
      const processed = applyFilterToImageData(imageData, filterConfig);
      ctx.putImageData(processed, x, y);
    } catch (error) {
      console.error('Error applying pixel filter:', error);
    }
  };

  // CSS滤镜备用方案
  const applyCSSFilter = (ctx: CanvasRenderingContext2D, filterConfig: any) => {
    if (!filterConfig) {
      ctx.filter = 'none';
      return;
    }

    const filters = [];
    
    if (filterConfig.brightness) {
      const value = parseInt(filterConfig.brightness.replace('+', ''));
      const percentage = Math.max(0, 100 + value);
      filters.push(`brightness(${percentage}%)`);
    }
    
    if (filterConfig.contrast) {
      const value = parseInt(filterConfig.contrast.replace('+', ''));
      const percentage = Math.max(0, 100 + value);
      filters.push(`contrast(${percentage}%)`);
    }
    
    if (filterConfig.saturate) {
      const value = parseInt(filterConfig.saturate.replace('+', ''));
      const percentage = Math.max(0, 100 + value);
      filters.push(`saturate(${percentage}%)`);
    }
    
    if (filterConfig.hue) {
      const value = parseInt(filterConfig.hue.replace('+', ''));
      filters.push(`hue-rotate(${value}deg)`);
    }

    const filterString = filters.length > 0 ? filters.join(' ') : 'none';
    ctx.filter = filterString;
    console.log('Applied CSS filter:', filterString);
  };

  // 绘制avatar
  const drawAvatar = async () => {
    // 为本次绘制生成版本号，如果期间参数变化会触发新的绘制，
    // 旧版本在真正落盘前会被丢弃，避免“叠影/双重头像”问题
    const currentVersion = ++drawVersionRef.current;
    const isBirthday = bookId === 'PICBOOK_BIRTHDAY';

    const canvas = canvasRef.current;
    if (!canvas) return;
    // 动态确定画布尺寸（按容器宽度与背景比例）
    const targetW = Math.max(1, Math.round((containerWidth || width)));
    const aspect = bgAspect || (width / height) || 1;
    const targetH = Math.max(1, Math.round(targetW / aspect));
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, targetW, targetH);

    try {
      // 获取肤色滤镜配置
      // 与 skin_properties.json 的键保持一致（white/black）。中间色不加滤镜。
      const skinColorMapping: { [key: string]: 'white' | 'black' | null } = {
        '#FFE2CF': 'white',
        '#DCB593': null,
        '#665444': 'black',
      };
      const skinFilterKey = skinColorMapping[skinColor];
      
      console.log('Skin color debug:', {
        inputSkinColor: skinColor,
        mappedKey: skinFilterKey,
        availableFilters: Object.keys(pageProperties?.skinToneFilter || {}),
        shouldApplyFilter: !!skinFilterKey
      });
      
      const skinFilter = (skinFilterKey && pageProperties?.skinToneFilter?.[skinFilterKey])
        ? pageProperties.skinToneFilter[skinFilterKey] : null;

      // 获取发色滤镜配置
      console.log('Hair color debug:', {
        inputHairColor: hairColor,
        availableFilters: Object.keys(pageProperties?.hairColorFilter || {}),
        shouldApplyFilter: hairColor && hairColor !== 'light'
      });
      
      const hairColorKey = hairColor === 'light' ? 'blone' : hairColor; // 与 skin_properties.json 保持一致（light -> blone）
      const hairFilter = (hairColorKey && pageProperties?.hairColorFilter?.[hairColorKey]) 
        ? pageProperties.hairColorFilter[hairColorKey] : null;

      // 帮助函数：将图层绘制到离屏画布并应用滤镜后再合成
      const drawLayerWithFilter = async (imgSrcs: string[], filter: any | null, layerName: string) => {
        // 如果有更新的绘制任务，直接放弃本次图层绘制
        if (currentVersion !== drawVersionRef.current) return;

        console.log(`=== DRAWING ${layerName} ===`);
        console.log('Image candidates:', imgSrcs);
        console.log('Filter to apply:', filter);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // 依次尝试候选地址
        let lastErr: any = null;
        for (const src of imgSrcs) {
          try {
            await new Promise((resolve, reject) => {
              img.onload = resolve as any;
              img.onerror = () => reject(new Error(`Image load error for ${src}`));
              img.src = src;
            });
            console.log(`${layerName} loaded from`, src);
            lastErr = null;
            break;
          } catch (e) {
            console.warn(`${layerName} failed from`, src, e);
            lastErr = e;
          }
        }
        if (lastErr) throw lastErr;

        console.log(`${layerName} image loaded:`, img.width, 'x', img.height);

        // 计算 contain 等比缩放参数
        const srcW = (img as any).naturalWidth || img.width;
        const srcH = (img as any).naturalHeight || img.height;
        const scale = Math.min(targetW / srcW, targetH / srcH);
        const destW = Math.max(1, Math.round(srcW * scale));
        const destH = Math.max(1, Math.round(srcH * scale));
        // 默认水平居中
        let dx = Math.round((targetW - destW) / 2);
        let dy = Math.round((targetH - destH) / 2);
        // 仅针对 Birthday 书籍：整体头像向左轻微偏移，让人物更靠近画布左侧
        if (isBirthday) {
          dx = Math.round(dx - targetW * 0.25); // 左移约 6% 画布宽度
          dy = Math.round(dy - targetH * 0.05);
        }
        
        // 离屏画布（按目标尺寸绘制，避免拉伸）
        const offscreen = document.createElement('canvas');
        offscreen.width = destW;
        offscreen.height = destH;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        offCtx.clearRect(0, 0, destW, destH);
        offCtx.drawImage(img, 0, 0, destW, destH);

        if (filter) {
          console.log(`Applying filter to ${layerName}:`, filter);
          applyPixelFilter(offCtx as any, filter, 0, 0, destW, destH);
        } else {
          console.log(`No filter applied to ${layerName}`);
        }

        // 再次确认版本号，避免旧任务在新任务之后把旧图层画上来
        if (currentVersion !== drawVersionRef.current) return;

        // 合成到主画布（居中摆放）
        ctx.drawImage(offscreen, dx, dy, destW, destH);
        console.log(`${layerName} composited to main canvas at`, { dx, dy, destW, destH });
      };

      // 0. 背景层（最底层，不应用滤镜）
      {
        const ts = Date.now();
        // 对于 birthday 书籍，根据性别选择不同的背景图层
        const candidates: string[] = [];
        if (bookId === 'PICBOOK_BIRTHDAY') {
          // Birthday 书籍：如果选择了性别，使用性别特定背景图；否则默认使用男孩背景图
          const genderBg = gender === 'girl' ? 'layer_background_girl.png' : 'layer_background_boy.png';
          candidates.push(`/products/picbooks/${bookId}/avatar/${genderBg}?ts=${ts}`);
        } else {
          // 其他书籍：使用原有逻辑
          candidates.push(
            `/products/picbooks/${bookId}/avatar/layer_background.png?ts=${ts}`,
            `/products/picbooks/PICBOOK_GOODNIGHT/avatar/layer_background.png?ts=${ts}`
          );
        }
        await drawLayerWithFilter(candidates, null, 'BACKGROUND');
      }

      // 1. 皮肤层（Fair 不用滤镜；Medium/Dark 使用 skinToneFilter）
      {
        const ts = Date.now();
        await drawLayerWithFilter([
          `/products/picbooks/${bookId}/avatar/layer_skin.png?ts=${ts}`,
          `/products/picbooks/1/avatar/layer_skin.png?ts=${ts}`,
        ], skinFilter, 'SKIN');
      }

      // 2. 发型层（Light 不用滤镜；Brown/Dark 使用 hairColorFilter）
      if (hairstyle) {
        const ts = Date.now();
        await drawLayerWithFilter([
          `/products/picbooks/${bookId}/avatar/layer_${hairstyle}.png?ts=${ts}`,
          `/products/picbooks/1/avatar/layer_${hairstyle}.png?ts=${ts}`,
        ], hairFilter, 'HAIR');
      }

      // 3. 眼睛层（不应用滤镜）
      {
        const ts = Date.now();
        await drawLayerWithFilter([
          `/products/picbooks/${bookId}/avatar/layer_eyes.png?ts=${ts}`,
          `/products/picbooks/1/avatar/layer_eyes.png?ts=${ts}`,
        ], null, 'EYES');
      }

      // 4. 瞳孔层（使用 skinToneFilter）
      {
        const ts = Date.now();
        await drawLayerWithFilter([
          `/products/picbooks/${bookId}/avatar/layer_pupils.png?ts=${ts}`,
          `/products/picbooks/1/avatar/layer_pupils.png?ts=${ts}`,
        ], skinFilter, 'PUPILS');
      }

    } catch (error) {
      console.error('Error drawing avatar:', error instanceof Error ? error.message : error);
      // 如果绘制失败，显示占位符
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Avatar Preview', width / 2, height / 2);
    }
  };

  // 当参数变化时重新绘制
  useEffect(() => {
    console.log('Avatar params changed:', { 
      isLoading, 
      skinColor, 
      hairstyle, 
      hairColor, 
      hasPageProperties: !!pageProperties 
    });
    
    // 确保有默认值也能正常工作
    const hasValidParams = !isLoading && 
      (skinColor || '#FFE2CF') && 
      (hairstyle || 'hair_1') && 
      (hairColor || 'light');
    
    if (hasValidParams) {
      drawAvatar();
    }
  }, [bookId, skinColor, hairstyle, hairColor, gender, pageProperties, isLoading, width, height, containerWidth, bgAspect]);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width, height }}
      >
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
      style={{ width: 'auto', height: '200px', display: 'block' }}
    />
  );
};

export default AvatarCanvas;
