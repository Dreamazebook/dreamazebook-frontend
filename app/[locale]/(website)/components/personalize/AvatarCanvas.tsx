/** @jsxImportSource react */
'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AvatarCanvasProps {
  bookId: string;
  skinColor: string;
  hairstyle: string;
  hairColor: string;
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
  width = 200,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageProperties, setPageProperties] = useState<PageProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载 page_properties.json，包含多路径尝试与无缓存
  useEffect(() => {
    let cancelled = false;
    const loadPageProperties = async () => {
      setIsLoading(true);
      const cacheBuster = `ts=${Date.now()}`;
      const candidatePaths = [
        `/picbooks/${bookId}/avatar/page_properties.json?${cacheBuster}`,
        // 回退为 bookId=1
        `/picbooks/1/avatar/page_properties.json?${cacheBuster}`,
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
          console.warn('Failed to fetch page_properties.json from', path, err);
        }
      }

      // 所有路径均失败时，提供一个安全的默认配置
      const fallbackProperties: PageProperties = {
        skinToneFilter: {
          brown: { saturate: '+2', hue: '-4', brightness: '-31' },
          dark: { brightness: '-80', contrast: '-30' },
        },
        hairColorFilter: {
          brown: { saturate: '+2', hue: '-4', brightness: '-31' },
          dark: { brightness: '-80', contrast: '-30' },
        },
      };
      if (!cancelled) {
        console.warn('Using fallback page_properties configuration');
        setPageProperties(fallbackProperties);
        setIsLoading(false);
      }
    };

    loadPageProperties();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // 标准像素级滤镜处理
  const applyPixelFilter = (ctx: CanvasRenderingContext2D, filterConfig: any, x: number, y: number, w: number, h: number) => {
    if (!filterConfig) return;

    try {
      const imageData = ctx.getImageData(x, y, w, h);
      const data = imageData.data;

      // 解析滤镜参数
      let brightnessValue = 0;
      let contrastValue = 0;
      let saturateValue = 0;
      let hueValue = 0;
      
      if (filterConfig.brightness) {
        brightnessValue = parseInt(filterConfig.brightness.replace('+', ''));
      }
      
      if (filterConfig.contrast) {
        contrastValue = parseInt(filterConfig.contrast.replace('+', ''));
      }
      
      if (filterConfig.saturate) {
        saturateValue = parseInt(filterConfig.saturate.replace('+', ''));
      }

      if (filterConfig.hue) {
        hueValue = parseInt(filterConfig.hue.replace('+', ''));
      }

      console.log('Applying pixel filter with LayerComposer algorithm:', { 
        brightnessValue: `${brightnessValue} (direct add/subtract)`,
        contrastValue: `${contrastValue} (standard formula)`,
        saturateValue: `${saturateValue} (gray + value * (color - gray))`,
        hueValue: `${hueValue} degrees (rotation matrix)`
      });

      // 处理每个像素 - 参考LayerComposer算法
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const a = data[i + 3];

        // 只对有像素的部分（非透明区域）应用滤镜
        if (a > 0) {
          // 1. 应用饱和度调整
          if (saturateValue !== 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = Math.min(255, Math.max(0, gray + saturateValue * (r - gray)));
            g = Math.min(255, Math.max(0, gray + saturateValue * (g - gray)));
            b = Math.min(255, Math.max(0, gray + saturateValue * (b - gray)));
          }

          // 2. 应用色相调整
          if (hueValue !== 0) {
            const hueRad = hueValue * Math.PI / 180;
            const newR = r * Math.cos(hueRad) - g * Math.sin(hueRad);
            const newG = r * Math.sin(hueRad) + g * Math.cos(hueRad);
            r = Math.min(255, Math.max(0, newR));
            g = Math.min(255, Math.max(0, newG));
            // b 保持不变
          }

          // 3. 应用亮度调整 (直接加减法)
          if (brightnessValue !== 0) {
            r = Math.min(255, Math.max(0, r + brightnessValue));
            g = Math.min(255, Math.max(0, g + brightnessValue));
            b = Math.min(255, Math.max(0, b + brightnessValue));
          }

          // 4. 应用对比度调整 (标准公式)
          if (contrastValue !== 0) {
            const factor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
          }

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
          // 保持原始alpha值不变
          data[i + 3] = a;
        }
        // 透明区域保持原样，不应用滤镜
      }

      ctx.putImageData(imageData, x, y);
      console.log('Filter applied successfully to', (data.length / 4), 'pixels');
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    try {
      // 获取肤色滤镜配置
      const skinColorMapping: { [key: string]: string } = {
        '#FFE2CF': 'light',  // light 不需要滤镜，保持原色
        '#DCB593': 'brown', 
        '#665444': 'dark'
      };
      const skinFilterKey = skinColorMapping[skinColor];
      
      console.log('Skin color debug:', {
        inputSkinColor: skinColor,
        mappedKey: skinFilterKey,
        availableFilters: Object.keys(pageProperties?.skinToneFilter || {}),
        shouldApplyFilter: skinFilterKey && skinFilterKey !== 'light'
      });
      
      const skinFilter = (skinFilterKey && skinFilterKey !== 'light' && pageProperties?.skinToneFilter?.[skinFilterKey]) 
        ? pageProperties.skinToneFilter[skinFilterKey] : null;

      // 获取发色滤镜配置
      console.log('Hair color debug:', {
        inputHairColor: hairColor,
        availableFilters: Object.keys(pageProperties?.hairColorFilter || {}),
        shouldApplyFilter: hairColor && hairColor !== 'light'
      });
      
      const hairFilter = (hairColor && hairColor !== 'light' && pageProperties?.hairColorFilter?.[hairColor]) 
        ? pageProperties.hairColorFilter[hairColor] : null;

      // 帮助函数：将图层绘制到离屏画布并应用滤镜后再合成
      const drawLayerWithFilter = async (imgSrc: string, filter: any | null, layerName: string) => {
        console.log(`=== DRAWING ${layerName} ===`);
        console.log('Image source:', imgSrc);
        console.log('Filter to apply:', filter);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve as any;
          img.onerror = reject as any;
          img.src = imgSrc;
        });

        console.log(`${layerName} image loaded:`, img.width, 'x', img.height);

        // 离屏画布
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;
        
        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(img, 0, 0, width, height);
        
        if (filter) {
          console.log(`Applying filter to ${layerName}:`, filter);
          
          // 测试：在应用滤镜前后获取一个像素样本来验证变化
          const sampleData = offCtx.getImageData(100, 100, 1, 1).data;
          console.log(`${layerName} pixel before filter:`, Array.from(sampleData));
          
          applyPixelFilter(offCtx, filter, 0, 0, width, height);
          
          const sampleDataAfter = offCtx.getImageData(100, 100, 1, 1).data;
          console.log(`${layerName} pixel after filter:`, Array.from(sampleDataAfter));
          console.log(`Filter applied to ${layerName}`);
        } else {
          console.log(`No filter applied to ${layerName}`);
        }
        
        // 合成到主画布
        ctx.drawImage(offscreen, 0, 0, width, height);
        console.log(`${layerName} composited to main canvas`);
      };

      // 1. 皮肤层（Fair 不用滤镜；Medium/Dark 使用 skinToneFilter）
      await drawLayerWithFilter(`/picbooks/${bookId}/avatar/layer_skin.png`, skinFilter, 'SKIN');

      // 2. 发型层（Light 不用滤镜；Brown/Dark 使用 hairColorFilter）
      if (hairstyle) {
        await drawLayerWithFilter(`/picbooks/${bookId}/avatar/layer_${hairstyle}.png`, hairFilter, 'HAIR');
      }

      // 3. 眼睛层（不应用滤镜）
      await drawLayerWithFilter(`/picbooks/${bookId}/avatar/layer_eyes.png`, null, 'EYES');

      // 4. 瞳孔层（使用 skinToneFilter）
      await drawLayerWithFilter(`/picbooks/${bookId}/avatar/layer_pupils.png`, skinFilter, 'PUPILS');

    } catch (error) {
      console.error('Error drawing avatar:', error);
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
  }, [bookId, skinColor, hairstyle, hairColor, pageProperties, isLoading, width, height]);

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
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        transform: 'scale(1.5)',
        transformOrigin: 'center'
      }}
    />
  );
};

export default AvatarCanvas;
