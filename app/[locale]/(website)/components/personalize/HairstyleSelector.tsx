/** @jsxImportSource react */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
// Use native <img> to avoid next/image constraints for local public assets

interface HairstyleSelectorProps {
	bookId: string;
	selectedHairstyle: string;
	onChange: (hairstyle: string) => void;
	onBlur?: () => void;
	error?: string;
	touched?: boolean;
  // Optional: backend-driven hair style values, e.g. ["1","2","3","4"].
  // UI remains the same; values are mapped to internal ids: hair_1..hair_4
  hairStyleValues?: string[];
  // Optional: override asset spu code for icon images (defaults to PICBOOK_GOODNIGHT)
  assetSpuCode?: string;
  // Current selected hair color key: light | brown | dark
  currentHairColor?: string;
}

const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({
	bookId,
	selectedHairstyle,
	onChange,
	onBlur,
	error,
	touched,
  hairStyleValues,
  assetSpuCode,
  currentHairColor,
}) => {
	// 根据bookId动态生成发型选项，支持后端传值（数量与顺序跟随后端）
  const ids = (hairStyleValues && hairStyleValues.length > 0)
		? hairStyleValues.map(v => `hair_${v}`)
		: ['hair_1','hair_2','hair_3','hair_4'];

  // 优先用当前书籍 id 对应的公共资源，如不存在则回退到指定 spu 资源
  const primaryBase = `/products/picbooks/${bookId}/avatar`;
  const fallbackBase = `/products/picbooks/${assetSpuCode || 'PICBOOK_GOODNIGHT'}/avatar`;
  const hairstyles = ids.map(id => {
    const number = id.replace('hair_', '');
    return {
      id,
      image: `${primaryBase}/hairstyle/${number}.png`,
      fallbackImage: `${fallbackBase}/hairstyle/${number}.png`,
    } as { id: string; image: string; fallbackImage: string };
  });

  // skin_properties: to derive hairColorFilter
  const [pageProperties, setPageProperties] = useState<any | null>(null);
  // 使用稳定的 key 作为依赖，避免依赖数组长度或顺序在热更新时变化
  const skinPropsKey = `${primaryBase}|${fallbackBase}`;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const ts = Date.now();
        // 先尝试 bookId 目录下的配置，不存在则回退到 spu 目录
        const primaryUrl = `${primaryBase}/skin_properties.json?ts=${ts}`;
        const fallbackUrl = `${fallbackBase}/skin_properties.json?ts=${ts}`;
        let res = await fetch(primaryUrl, { cache: 'no-store' });
        if (!res.ok) {
          res = await fetch(fallbackUrl, { cache: 'no-store' });
        }
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setPageProperties(json);
        }
      } catch {}
    };
    load();
    return () => { cancelled = true };
  }, [skinPropsKey]);

  const buildCssFilter = (filterConfig: any): string => {
    if (!filterConfig) return 'none';
    const filters: string[] = [];
    if (filterConfig.brightness) {
      const value = parseInt(String(filterConfig.brightness).replace('+',''));
      const pct = Math.max(0, 100 + value);
      filters.push(`brightness(${pct}%)`);
    }
    if (filterConfig.contrast) {
      const value = parseInt(String(filterConfig.contrast).replace('+',''));
      const pct = Math.max(0, 100 + value);
      filters.push(`contrast(${pct}%)`);
    }
    if (filterConfig.saturate) {
      const value = parseInt(String(filterConfig.saturate).replace('+',''));
      const pct = Math.max(0, 100 + value);
      filters.push(`saturate(${pct}%)`);
    }
    if (filterConfig.hue) {
      const value = parseInt(String(filterConfig.hue).replace('+',''));
      filters.push(`hue-rotate(${value}deg)`);
    }
    return filters.length ? filters.join(' ') : 'none';
  };

  // map UI hair color to filter key in skin_properties
  const hairFilterKey = (currentHairColor === 'light') ? 'blone' : currentHairColor;
  const hairFilterCfg = (hairFilterKey)
    ? pageProperties?.hairColorFilter?.[hairFilterKey]
    : null;
  const hairCssFilter = buildCssFilter(hairFilterCfg);
  const hairFilterStableKey = hairFilterKey || 'none';
  // 当 skin_properties.json 加载完成后，使键变化一次，触发缩略图重绘以应用滤镜
  const filterReady = !!(pageProperties && pageProperties.hairColorFilter && hairFilterKey && pageProperties.hairColorFilter[hairFilterKey]);
  const compositeFilterKey = `${hairFilterStableKey}:${filterReady ? 'ready' : 'init'}`;

  // Canvas thumb that applies pixel filter like AvatarCanvas
  // stable in-memory cache to prevent recompute and flicker across re-mounts
  const thumbCacheRef = (HairstyleSelector as any)._thumbCache || ((HairstyleSelector as any)._thumbCache = new Map<string, string>());

  const HairThumbBase: React.FC<{ src: string; fallbackSrc?: string; alt: string; filterConfig: any; filterKey: string }> = ({ src, fallbackSrc, alt, filterConfig, filterKey }) => {
    const [dataUrl, setDataUrl] = useState<string>('');
    const [resolvedSrc, setResolvedSrc] = useState<string>(src);

    const applyFilterToImageData = (imageData: ImageData, cfg: any) => {
      if (!cfg) return imageData;
      const data = imageData.data;
      const B = cfg.brightness ? parseInt(String(cfg.brightness).replace('+','')) : 0;
      const C = cfg.contrast ? parseInt(String(cfg.contrast).replace('+','')) : 0;
      const S = cfg.saturate ? parseInt(String(cfg.saturate).replace('+','')) : 0;
      const H = cfg.hue ? parseInt(String(cfg.hue).replace('+','')) : 0;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const a = data[i + 3];

        // brightness
        if (B) {
          r = Math.min(255, Math.max(0, r + B));
          g = Math.min(255, Math.max(0, g + B));
          b = Math.min(255, Math.max(0, b + B));
        }

        // contrast
        if (C) {
          const f = (259 * (C + 255)) / (255 * (259 - C));
          r = Math.min(255, Math.max(0, f * (r - 128) + 128));
          g = Math.min(255, Math.max(0, f * (g - 128) + 128));
          b = Math.min(255, Math.max(0, f * (b - 128) + 128));
        }

        // to HSL
        const rN = r / 255, gN = g / 255, bN = b / 255;
        const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
            case gN: h = (bN - rN) / d + 2; break;
            default: h = (rN - gN) / d + 4; break;
          }
          h /= 6;
        }

        const sScale = 1 + (S / 100);
        h = (h + (H / 360)) % 1; if (h < 0) h += 1;
        s = Math.max(0, Math.min(1, s * sScale));

        let r2: number, g2: number, b2: number;
        if (s === 0) {
          r2 = g2 = b2 = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p2 = 2 * l - q;
          const hue2rgb = (p: number, qv: number, t: number) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1/6) return p + (qv - p) * 6 * t;
            if (t < 1/2) return qv;
            if (t < 2/3) return p + (qv - p) * (2/3 - t) * 6;
            return p;
          };
          r2 = hue2rgb(p2, q, h + 1/3);
          g2 = hue2rgb(p2, q, h);
          b2 = hue2rgb(p2, q, h - 1/3);
        }

        data[i] = Math.max(0, Math.min(255, (r2 * 255) | 0));
        data[i+1] = Math.max(0, Math.min(255, (g2 * 255) | 0));
        data[i+2] = Math.max(0, Math.min(255, (b2 * 255) | 0));
        data[i+3] = a;
      }
      return imageData;
    };

    useEffect(() => {
      let cancelled = false;
      const run = async () => {
        const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.onload = () => resolve(im);
          im.onerror = () => reject(new Error('image load error'));
          im.src = url;
        });

        // 使用最终可用的资源地址作为缓存 key，避免重复处理
        const tryKeys = [src, fallbackSrc].filter(Boolean) as string[];
        const cacheKey = `${tryKeys.join('||')}|${filterKey}`;
        const cached = thumbCacheRef.get(cacheKey);
        if (cached) { setDataUrl(cached); return; }
        try {
          let img: HTMLImageElement | null = null;
          let usedSrc = src;
          try {
            img = await loadImage(src);
          } catch (e) {
            if (fallbackSrc) {
              img = await loadImage(fallbackSrc);
              usedSrc = fallbackSrc;
            } else {
              throw e;
            }
          }
          if (cancelled) return;
          // draw into high-res canvas to avoid blur after CSS scale
          const baseSize = 56; // logical button content size
          const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
          const visualScale = 2.5; // CSS scale used outside
          const scaleFactor = Math.max(2, Math.ceil(dpr * visualScale));
          const size = baseSize * scaleFactor;
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.imageSmoothingEnabled = true;
          try { (ctx as any).imageSmoothingQuality = 'high'; } catch {}
          // contain fit
          const srcW = (img as any).naturalWidth || img.width;
          const srcH = (img as any).naturalHeight || img.height;
          const scale = Math.min(size / srcW, size / srcH);
          const dw = Math.max(1, Math.round(srcW * scale));
          const dh = Math.max(1, Math.round(srcH * scale));
          const dx = Math.round((size - dw) / 2);
          const dy = Math.round((size - dh) / 2);
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, dx, dy, dw, dh);
          if (filterConfig) {
            const imgData = ctx.getImageData(0, 0, size, size);
            const processed = applyFilterToImageData(imgData, filterConfig);
            ctx.putImageData(processed, 0, 0);
          }
          const url = canvas.toDataURL('image/png');
          if (!cancelled) {
            thumbCacheRef.set(cacheKey, url);
            setDataUrl(url);
            setResolvedSrc(usedSrc);
          }
        } catch {}
      };
      run();
      return () => { cancelled = true };
    }, [src, fallbackSrc, filterKey]);

    return (
      <img
        src={dataUrl || resolvedSrc}
        alt={alt}
        width={56}
        height={56}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          transform: 'translateY(5px) scale(1.5)',
          transformOrigin: 'center',
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    );
  };

  const HairThumb = React.memo(HairThumbBase, (prev, next) => (
    prev.src === next.src && prev.filterKey === next.filterKey
  ));

  const hairstylesMemo = useMemo(() => hairstyles, [bookId, assetSpuCode, hairStyleValues]);

	const handleHairstyleSelect = (hairstyleId: string) => {
		onChange(hairstyleId);
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-0" tabIndex={0} onBlur={onBlur}>
        <div className="flex flex-col">
          <label className="font-medium">Hairstyle</label>
          <p className="text-[#999999] text-[16px] leading-[24px] tracking-[0.5px] max-w-[250px]">Pick the closest one, the final style will come from your photo.</p>
        </div>
				<div className="flex flex-wrap gap-1 flex-1 justify-end md:ml-4">
					{hairstylesMemo.map((hairstyle) => {
						const isActive = selectedHairstyle === hairstyle.id;
						return (
							<div
								key={hairstyle.id}
								className={`w-12 h-12 md:w-14 md:h-14 rounded-[35px] p-1 flex items-center justify-center border ${
									isActive ? 'bg-[#FCF2F2] border-[#012CCE]' : 'bg-[#F8F8F8] border-transparent'
								}`}
							>
            <button
									type="button"
									className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ${
										isActive ? 'bg-white' : ''
									}`}
									style={{ boxShadow: '9px 31px 64px 0px #A6ABE114' }}
									onClick={() => handleHairstyleSelect(hairstyle.id)}
									aria-pressed={isActive}
								>
                <HairThumb
                  key={hairstyle.id}
                  src={hairstyle.image}
                  fallbackSrc={hairstyle.fallbackImage}
                  alt={hairstyle.id}
                  filterConfig={hairFilterCfg}
                  filterKey={compositeFilterKey}
                />
								</button>
							</div>
						);
					})}
				</div>
			</div>
			{touched && error && (
				<p className="text-red-500 text-sm mt-1">{error}</p>
			)}
		</div>
	);
};

export default HairstyleSelector;