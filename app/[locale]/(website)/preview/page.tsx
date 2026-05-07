'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams, usePathname } from 'next/navigation';
import { Drawer } from "antd";
import { create } from 'zustand';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';

import Image from 'next/image';
import GiverDedicationCanvas from './components/GiverDedicationCanvas';
import GiverAvatarCropper from './components/GiverAvatarCropper';
import CoverNameCanvas from './components/CoverNameCanvas';
import { DreamazeFaceSwapLoadingBar } from './components/DreamazeFaceSwapLoadingBar';
import DreamazeLogoRainbowLoader from './components/DreamazeLogoRainbowLoader';
import api from '@/utils/api';
import echo from '@/app/config/echo';
import { useTranslations, useLocale } from 'next-intl';
import useImageUpload from '../hooks/useImageUpload';
import useUserStore from '@/stores/userStore';
import usePreviewStore from '@/stores/previewStore';
import { mapAgeStageUiToBackend } from '@/utils/mapAgeStageToBackend';
import { buildPicbookPreviewFacePayload } from '@/utils/faceImagePayload';
import { getApiBaseUrl } from '@/utils/apiBaseUrl';
import { getBirthdayCoverSeasonFromCharacterLike } from '@/utils/birthdayPersonalizeHelpers';
import toast from 'react-hot-toast';
import { PreviewResponse, PreviewCharacter, PreviewPage, FaceSwapBatch, ApiResponse, CartAddRequest, CartAddResponse } from '@/types/api';
import { BaseBook, DetailedBook } from '@/types/book';
import { API_CART_LIST, API_CART_UPDATE } from '@/constants/api';
import DisplayPrice from '../components/component/DisplayPrice';
import { fbTrack, getContentIdBySpu } from '@/utils/track';

// 封面文字配置缓存：避免在同一会话内反复请求 R2
const coverTextsCache: Record<string, Array<{
  type?: string;
  font?: string;
  fontWeight?: string;
  fontSize?: number;
  color?: string;
  position?: { x: number; y: number };
  alignment?: string;
}> | null> = {};

const normalizeCoverTexts = (json: any): Array<any> => {
  const raw = Array.isArray(json?.text)
    ? json.text
    : Array.isArray(json?.elements)
      ? json.elements
      : [];

  return raw.map((t: any) => ({
    ...t,
    fontSize: typeof t?.fontSize === 'number' ? t.fontSize : t?.font_size,
    fontWeight: t?.fontWeight ?? t?.font_weight,
  }));
};

// 叠字后封面的 DataURL 缓存：避免每次进入 Tab 都重新用 Canvas 合成
const coverComposedImageCache: Record<string, string> = {};

const hasMeaningfulFinalImage = (page: any): boolean => {
  const finalRaw = String(page?.final_image_url || '').trim();
  if (!finalRaw) return false;
  const imageRaw = String(page?.image_url || '').trim();
  const baseRaw = String(page?.base_image_url || '').trim();
  const compareBase = baseRaw || (imageRaw && imageRaw !== finalRaw ? imageRaw : '');
  return !compareBase || finalRaw !== compareBase;
};

const getPreviewDisplayImageRaw = (page: any): string => {
  if (hasMeaningfulFinalImage(page)) return String(page?.final_image_url || '');
  return String(page?.base_image_url || page?.image_url || page?.final_image_url || '');
};

const normalizePreviewPageCode = (pageCode: unknown): string =>
  String(pageCode || '').trim().toLowerCase().replace(/_/g, '-');

const MOM_COMPOSITE_PAGE_CODES = new Set(['p5-6', 'p5-p6', 'p27-28', 'p27-p28']);
const MOM_COMPOSITE_IMAGE_PLACEMENTS: Record<'p5-6' | 'p27-28', { x: number; y: number; width: number; height: number }> = {
  'p5-6': { x: 2902, y: 718, width: 1315, height: 840 },
  'p27-28': { x: 1106, y: 639, width: 908, height: 580 },
};

const isMomCompositePageCode = (pageCode: unknown): boolean =>
  MOM_COMPOSITE_PAGE_CODES.has(normalizePreviewPageCode(pageCode));

const toMomCompositeUploadPageCode = (pageCode: unknown): 'p5-6' | 'p27-28' | null => {
  const normalized = normalizePreviewPageCode(pageCode);
  if (normalized === 'p5-6' || normalized === 'p5-p6') return 'p5-6';
  if (normalized === 'p27-28' || normalized === 'p27-p28') return 'p27-28';
  return null;
};

type MomCompositeDefaultGender = 'boy' | 'girl';

const normalizeMomCompositeDefaultGender = (gender: unknown, genderCode?: unknown): MomCompositeDefaultGender | null => {
  const value = String(gender || '').trim().toLowerCase();
  if (value === 'boy' || value === 'male' || value === '1') return 'boy';
  if (value === 'girl' || value === 'female' || value === '2') return 'girl';
  const code = String(genderCode || '').trim().toLowerCase();
  if (code === '1' || code === 'boy' || code === 'male') return 'boy';
  if (code === '2' || code === 'girl' || code === 'female') return 'girl';
  return null;
};

/** `/preview/batches` 返回的 batch.options.gender（无本地 previewUserData 时用于默认手绘图） */
const momCompositeGenderFromBatchOptions = (options: unknown): MomCompositeDefaultGender | null =>
  normalizeMomCompositeDefaultGender((options as { gender?: unknown } | null | undefined)?.gender);

const getMomCompositeDefaultImagePath = (pageCode: 'p5-6' | 'p27-28', gender: MomCompositeDefaultGender): string =>
  `/images/preview/mom-drawing/${pageCode}-${gender}.png`;

type UploadRateLimitError = {
  title: string;
  message: string;
  retryText?: string;
};

const formatUploadRetryAfter = (retryAfterSeconds: unknown, retryAfterMinutes: unknown): string | undefined => {
  const minutes = Number(retryAfterMinutes);
  if (Number.isFinite(minutes) && minutes > 0) {
    const roundedMinutes = Math.ceil(minutes);
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${roundedMinutes}m`;
  }

  const seconds = Number(retryAfterSeconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    return formatUploadRetryAfter(undefined, Math.ceil(seconds / 60));
  }

  return undefined;
};

const getUploadRateLimitError = (error: unknown): UploadRateLimitError | null => {
  const err = error as any;
  const data = err?.response?.data;
  const status = err?.response?.status;
  if (status !== 429 && data?.code !== 'UPLOAD_RATE_LIMITED') return null;

  return {
    title: 'Upload limit reached',
    message:
      'You have reached the guest daily upload limit. Please sign in to continue uploading your images.',
    retryText: formatUploadRetryAfter(data?.retry_after, data?.retry_after_minutes),
  };
};

type MomCompositePreviewPage = PreviewPage & {
  page_code?: string;
  status?: string;
  base_image_url?: string;
  final_image_url?: string;
  composite_image_url?: string;
};

type MomCompositePreviewData = Omit<PreviewResponse, 'preview_data'> & {
  batch_id?: string;
  status?: string;
  preview_data?: MomCompositePreviewPage[];
};

type MomCompositeUploadResponse = {
  data?: {
    image_url?: string;
    final_image_url?: string;
    composite_image_url?: string;
  };
  image_url?: string;
  final_image_url?: string;
  composite_image_url?: string;
};

const buildCanvasSafeImageUrl = (src: string): string => {
  if (!src) return src;
  if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:')) return src;
  try {
    const url = new URL(src, typeof window !== 'undefined' ? window.location.href : undefined);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return src;
    const urlStr = url.toString();
    let hash = 2166136261;
    for (let i = 0; i < urlStr.length; i++) {
      hash ^= urlStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `/api/image-proxy/${(hash >>> 0).toString(16)}?url=${encodeURIComponent(urlStr)}`;
  } catch {
    return src;
  }
};

const loadCanvasImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = buildCanvasSafeImageUrl(src);
  });

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string' && result.startsWith('data:')) {
        resolve(result);
      } else {
        reject(new Error('Invalid image data'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

const normalizePreviewImageUrlForCanvas = (imagePath: string): string => {
  if (!imagePath) return imagePath;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    try {
      return imagePath.startsWith('http') ? encodeURI(imagePath) : imagePath;
    } catch {
      return imagePath;
    }
  }
  let normalized = imagePath.trim();
  if (normalized.startsWith('/public/')) {
    normalized = normalized.replace(/^\/public\//, '/');
  } else if (normalized.startsWith('public/')) {
    normalized = normalized.replace(/^public\//, '');
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
  }
  if (!normalized.startsWith('/')) normalized = '/' + normalized;
  return normalized;
};

const computeCenteredCropForAspectRatio = (
  naturalWidth: number,
  naturalHeight: number,
  aspectRatio: number,
): { sx: number; sy: number; sw: number; sh: number } => {
  const safeAspect = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  const currentAspect = naturalWidth / naturalHeight;
  if (currentAspect > safeAspect) {
    const sw = Math.floor(naturalHeight * safeAspect);
    return { sx: Math.floor((naturalWidth - sw) / 2), sy: 0, sw, sh: naturalHeight };
  }
  const sh = Math.floor(naturalWidth / safeAspect);
  return { sx: 0, sy: Math.floor((naturalHeight - sh) / 2), sw: naturalWidth, sh };
};

const composeMomCompositeImage = async (
  baseImageUrl: string,
  overlayFile: File,
  placement: { x: number; y: number; width: number; height: number },
  overlayMode: 'placement' | 'full-page' = 'placement',
): Promise<string> => {
  const overlayDataUrl = await fileToDataUrl(overlayFile);
  const [baseImage, overlayImage] = await Promise.all([
    loadCanvasImage(baseImageUrl),
    loadCanvasImage(overlayDataUrl),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.naturalWidth || baseImage.width;
  canvas.height = baseImage.naturalHeight || baseImage.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  if (overlayMode === 'full-page') {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }

  const { sx, sy, sw, sh } = computeCenteredCropForAspectRatio(
    overlayImage.naturalWidth || overlayImage.width,
    overlayImage.naturalHeight || overlayImage.height,
    placement.width / placement.height,
  );
  ctx.drawImage(overlayImage, sx, sy, sw, sh, placement.x, placement.y, placement.width, placement.height);
  return canvas.toDataURL('image/png');
};

// 自定义图片组件，支持Next.js Image和原生img的回退
const OptimizedImage = ({ src, alt, width, height, className, style, onError, onLoad, onLoadingComplete, fallbackSrc, ...props }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoadingComplete?: (img: HTMLImageElement) => void;
  fallbackSrc?: string;
  [key: string]: any;
}) => {
  const [useNativeImg, setUseNativeImg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setUseNativeImg(false);
    setImgError(false);
    setHasTriedFallback(false);
  }, [src]);

  const handleNextImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Next.js Image failed, switching to native img:', currentSrc);
    if (fallbackSrc && !hasTriedFallback) {
      console.warn('Trying fallback image:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      setUseNativeImg(true);
      return;
    }
    // 不立即判定失败，切换到原生 img 再尝试一次
    setUseNativeImg(true);
  };

  const handleNativeImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && !hasTriedFallback) {
      console.warn('Native img failed, trying fallback:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      return;
    }
    console.error('Image failed to load finally:', currentSrc);
    setImgError(true);
    if (onError) onError(e);
  };

  if (imgError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`} style={style}>
        <p className="text-gray-500 text-sm">图片加载失败</p>
      </div>
    );
  }

  if (useNativeImg) {
    // 过滤掉 Next/Image 专有或不适用于 <img> 的属性
    const {
      priority: _priority,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      fill: _fill,
      sizes: _sizes,
      quality: _quality,
      onLoadingComplete: _onLoadingComplete,
      unoptimized: _unoptimized,
      ...restProps
    } = props || {};

    return (
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        onError={handleNativeImgError}
        onLoad={onLoad}
        {...restProps}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      unoptimized={src.includes('s3-pro-dre001') || src.includes('s3-pro-dre002') || src.includes('.r2.dev')}
      onError={handleNextImageError}
      onLoad={onLoad}
      onLoadingComplete={onLoadingComplete}
      {...props}
    />
  );
};

// 通过全局注册组件 LdrsRegistry 统一注册，无需在此处重复注册

// Others 标签页中封面选项用的图片组件：
// 如果当前封面在 R2 上存在 page_properties.json，则使用 Canvas 叠加名字；否则回退为普通图片
function CoverOptionImageWithName({
  bookId,
  option,
  baseSrc,
  cropRightHalf,
  recipient,
}: {
  bookId: string | null;
  option: CoverOption;
  baseSrc: string;
  cropRightHalf: boolean;
  recipient: string;
}) {
  const [texts, setTexts] = useState<Array<{
    type?: string;
    font?: string;
    fontWeight?: string;
    fontSize?: number;
    color?: string;
    position?: { x: number; y: number };
    alignment?: string;
  }> | null>(null);
  const [composedUrl, setComposedUrl] = useState<string | null>(null);

  useEffect(() => {
    let upperBookId = (bookId || '').toUpperCase();
    // PICBOOK_GOODNIGHT3 资源目录与 PICBOOK_GOODNIGHT 一致
    if (upperBookId === 'PICBOOK_GOODNIGHT3') {
      upperBookId = 'PICBOOK_GOODNIGHT';
    }
    if (!upperBookId) {
      setTexts(null);
      setComposedUrl(null);
      return;
    }
    const rawCoverKey = option.option_key || String(option.id);
    const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(option.id);

    const cacheKey = `${upperBookId}_${coverId}`;
    // 先尝试使用全局缓存的文字配置
    if (cacheKey in coverTextsCache) {
      setTexts(coverTextsCache[cacheKey] || null);
    }

    let cancelled = false;

    (async () => {
      try {
        const qs = new URLSearchParams({
          bookId: upperBookId,
          coverId,
        });
        const res = await fetch(`/api/cover-page-properties?${qs.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (!cancelled) {
            coverTextsCache[cacheKey] = null;
            setTexts(null);
          }
          return;
        }
        const json = await res.json();
        const arr = normalizeCoverTexts(json);
        if (!cancelled) {
          const next = arr.length ? arr : null;
          coverTextsCache[cacheKey] = next;
          setTexts(next);
        }
      } catch {
        if (!cancelled) {
          coverTextsCache[cacheKey] = null;
          setTexts(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId, option.id, option.option_key]);

  const trimmedName = (recipient || '').trim();
  const canDrawName = !!trimmedName && texts && texts.length > 0;

  // 如果已经有缓存的合成图片，直接使用，避免再次 Canvas 绘制
  const upperBookId = (bookId || '').toUpperCase();
  const rawCoverKey = option.option_key || String(option.id);
  const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(option.id);
  const composedKey = `${upperBookId}_${coverId}_${trimmedName}_${baseSrc}`;
  const handleCoverRendered = useCallback((dataUrl: string) => {
    coverComposedImageCache[composedKey] = dataUrl;
    setComposedUrl(dataUrl);
  }, [composedKey]);

  useEffect(() => {
    if (!trimmedName) {
      setComposedUrl(null);
      return;
    }
    if (coverComposedImageCache[composedKey]) {
      setComposedUrl(coverComposedImageCache[composedKey]);
    }
  }, [composedKey, trimmedName]);

  if (composedUrl) {
    return (
      <Image
        src={composedUrl}
        alt={`Cover ${option.id} - ${option.name}`}
        width={cropRightHalf ? 400 : 200}
        height={200}
        className={`w-full h-auto object-cover ${cropRightHalf ? 'object-right' : 'object-center'}`}
      />
    );
  }

  if (canDrawName) {
    return (
      <CoverNameCanvas
        src={baseSrc}
        name={trimmedName}
        texts={texts as any}
        className="w-full h-auto block"
        onRendered={handleCoverRendered}
      />
    );
  }

  // 无文本配置或没有名字时，回退为普通封面图片
  return (
    <Image
      src={baseSrc}
      alt={`Cover ${option.id} - ${option.name}`}
      width={cropRightHalf ? 400 : 200}
      height={200}
      className={`w-full h-auto object-cover ${cropRightHalf ? 'object-right' : 'object-center'}`}
    />
  );
}

const useStore = create<{
  activeStep: number;
  activeTab: 'Book preview' | 'Others';
  viewMode: 'single' | 'double';
  dedication: string;
  giver: string;
  recipient: string;
  giverImageUrl: string | null;
  editField: 'giver' | 'dedication' | null;
  setActiveStep: (step: number) => void;
  setActiveTab: (tab: 'Book preview' | 'Others') => void;
  setViewMode: (mode: 'single' | 'double') => void;
  setDedication: (dedication: string) => void;
  setGiver: (giver: string) => void;
  setRecipient: (recipient: string) => void;
  setGiverImageUrl: (url: string | null) => void;
  setEditField: (field: 'giver' | 'dedication' | null) => void;
}>((set) => ({
  activeStep: 2,
  activeTab: 'Book preview',
  viewMode: 'single',
  dedication:
    ' ',
  giver: ' ',
  recipient: ' ',
  giverImageUrl: null,
  editField: null,
  setActiveStep: (step: number) => set({ activeStep: step }),
  setActiveTab: (tab: 'Book preview' | 'Others') => set({ activeTab: tab }),
  setViewMode: (mode: 'single' | 'double') => set({ viewMode: mode }),
  setDedication: (dedication: string) => set({ dedication }),
  setGiver: (giver: string) => set({ giver }),
  setRecipient: (recipient: string) => set({ recipient }),
  setGiverImageUrl: (url: string | null) => set({ giverImageUrl: url }),
  setEditField: (field: 'giver' | 'dedication' | null) => set({ editField: field }),
}));

/** 单页换脸/预览失败（如队列爆满）时蒙版内一句提示 */
function PageRenderFailedOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/90 px-4">
      <p className="max-w-md text-center text-sm text-gray-800 leading-relaxed">{message}</p>
    </div>
  );
}

// 记忆化的单页预览组件，尽量只在相关 props 变化时重渲染
const PreviewPageItem = React.memo(function PreviewPageItem({
  pageId,
  pageNumber,
  src,
  viewMode,
  showOverlay,
  progress,
  overlayMode = 'progress',
  content,
  customOverlayContent,
  onImageLoaded,
}: {
  pageId: number;
  pageNumber: number;
  src: string;
  viewMode: 'single' | 'double';
  showOverlay: boolean;
  progress: number;
  overlayMode?: 'progress' | 'loading' | 'failed';
  content?: string | null;
  customOverlayContent?: React.ReactNode;
  onImageLoaded?: (pageId: number) => void;
}) {
  const t = useTranslations('Preview');
  const notifiedRef = useRef(false);
  const handleImageLoad = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    try {
      onImageLoaded?.(pageId);
    } catch {}
  };

  if (viewMode === 'single') {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        {/* 左半部分 */}
        <div className="w-full flex justify-center">
          <div className="relative max-w-[500px] w-full" style={{ aspectRatio: '512/519' }}>
            {showOverlay ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt={`Page ${pageNumber} - Left Half`}
                    className="object-cover rounded-lg"
                    style={{ 
                      objectPosition: 'left center',
                      width: '100%',
                      height: '100%'
                    }}
                    onLoad={handleImageLoad}
                  />
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  {overlayMode === 'failed' ? (
                    <PageRenderFailedOverlay message={t('pageRenderFailedMessage')} />
                  ) : overlayMode === 'progress' ? (
                    <DreamazeFaceSwapLoadingBar progress={progress} />
                  ) : (
                    <div className="text-center">
                      <DreamazeLogoRainbowLoader size={60} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt={`Page ${pageNumber} - Left Half`}
                  className="object-cover rounded-lg"
                  style={{ 
                    objectPosition: 'left center',
                    width: '100%',
                    height: '100%'
                  }}
                  onError={() => {
                    console.error(`图片加载失败: ${src}`);
                  }}
                  onLoad={() => {
                    console.log(`图片加载成功: ${src}`);
                    handleImageLoad();
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 右半部分 */}
        <div className="w-full flex justify-center">
          <div className="relative max-w-[500px] w-full" style={{ aspectRatio: '512/519' }}>
            {showOverlay ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt={`Page ${pageNumber} - Right Half`}
                    className="object-cover rounded-lg"
                    style={{ 
                      objectPosition: 'right center',
                      width: '100%',
                      height: '100%'
                    }}
                    onLoad={handleImageLoad}
                  />
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  {overlayMode === 'failed' ? (
                    <PageRenderFailedOverlay message={t('pageRenderFailedMessage')} />
                  ) : overlayMode === 'progress' ? (
                    <DreamazeFaceSwapLoadingBar progress={progress} />
                  ) : (
                    <div className="text-center">
                      <DreamazeLogoRainbowLoader size={60} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt={`Page ${pageNumber} - Right Half`}
                  className="object-cover rounded-lg"
                  style={{ 
                    objectPosition: 'right center',
                    width: '100%',
                    height: '100%'
                  }}
                  onError={() => {
                    console.error(`图片加载失败: ${src}`);
                  }}
                  onLoad={() => {
                    console.log(`图片加载成功: ${src}`);
                    handleImageLoad();
                  }}
                />
              </div>
            )}
            {customOverlayContent && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {customOverlayContent}
              </div>
            )}
          </div>
        </div>

        {content && (
          <div className="mt-2 p-2 bg-gray-100 rounded w-full max-w-2xl">
            <p className="text-sm">{content}</p>
          </div>
        )}
      </div>
    );
  }

  // double 模式
  return (
    <div className="w-full relative">
      {showOverlay ? (
        <div className="w-full relative">
          <OptimizedImage
            src={src}
            alt={`Page ${pageNumber}`}
            width={1600}
            height={600}
            className="w-full h-auto rounded-lg object-cover"
            onLoad={handleImageLoad}
            onLoadingComplete={() => handleImageLoad()}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            {overlayMode === 'failed' ? (
              <PageRenderFailedOverlay message={t('pageRenderFailedMessage')} />
            ) : overlayMode === 'progress' ? (
              <DreamazeFaceSwapLoadingBar progress={progress} />
            ) : (
              <div className="text-center">
                <DreamazeLogoRainbowLoader size={60} />
              </div>
            )}
          </div>
          {customOverlayContent && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {customOverlayContent}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full relative">
          <OptimizedImage
            src={src}
            alt={`Page ${pageNumber}`}
            width={1600}
            height={600}
            className="w-full h-auto rounded-lg object-cover"
            onError={() => {
              console.error(`图片加载失败: ${src}`);
            }}
            onLoad={() => {
              console.log(`图片加载成功: ${src}`);
              handleImageLoad();
            }}
            onLoadingComplete={() => handleImageLoad()}
          />
          {customOverlayContent && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {customOverlayContent}
            </div>
          )}
        </div>
      )}
      {content && (
        <div className="mt-2 p-2 bg-gray-100 rounded w-full">
          <p className="text-sm">{content}</p>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // 仅在关键展示数据变化时重渲染
  return (
    prev.pageId === next.pageId &&
    prev.pageNumber === next.pageNumber &&
    prev.src === next.src &&
    prev.viewMode === next.viewMode &&
    prev.showOverlay === next.showOverlay &&
    prev.overlayMode === next.overlayMode &&
    Math.round(prev.progress) === Math.round(next.progress) &&
    prev.content === next.content &&
    prev.customOverlayContent === next.customOverlayContent
  );
});

interface CoverOption {
  id: number;
  option_type: string;
  option_key: string;
  name: string;
  description: string | null;
  price: number;
  currency_code: string;
  image_url: string;
  is_default: boolean;
  gender: number;
  skincolor: number;
  has_face: boolean;
  has_text: boolean;
  text_config: {
    color: string;
    title: string;
    position: string;
    font_size: number;
  };
  face_config: {
    positions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  };
}

interface BindingOption {
  id: number;
  option_type: string;
  option_key: string;
  name: string;
  description: string | null;
  price: number;
  currency_code: string;
  image_url?: string | null;
  is_default?: boolean;
}

interface GiftBoxOption {
  id: number;
  option_type?: string;
  option_key?: string;
  name: string;
  description?: string | null;
  price?: number;
  currency_code?: string;
  image_url?: string | null;
  images?: string[];
  is_default?: boolean;
}

interface BookOptions {
  cover_options: Array<CoverOption>;
  binding_options: Array<BindingOption>;
  gift_box_options: Array<GiftBoxOption>;
}

export default function PreviewPageWithTopNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openLoginModal } = useUserStore();
  const t = useTranslations('Preview');
  // 严格以 URL 段判定展示语言，避免受到浏览器/cookie 影响
  const pathname = usePathname?.() as string;
  const urlLocale = (typeof pathname === 'string' && pathname.split('/')[1]) || '';
  const displayLang: 'en' | 'zh' = urlLocale.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  
  // 更新 URL 中的 previewid 参数（使用 window.history 避免触发页面重新加载）
  const updatePreviewIdInUrl = useCallback((newPreviewId: string) => {
    const currentPreviewId = searchParams.get('previewid');
    if (currentPreviewId !== newPreviewId) {
      try {
        const bookId = searchParams.get('bookid');
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('previewid', newPreviewId);
        if (bookId) {
          newSearchParams.set('bookid', bookId);
        }
        // 使用 window.history.replaceState 更新 URL，不触发页面重新加载
        const newUrl = `${pathname}?${newSearchParams.toString()}`;
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', newUrl);
          console.log('[Preview] Updated URL previewid:', currentPreviewId, '->', newPreviewId);
        }
      } catch (e) {
        console.warn('[Preview] Failed to update URL previewid:', e);
      }
    }
  }, [searchParams, pathname]);
  
  const {
    activeTab,
    viewMode,
    dedication,
    giver,
    recipient,
    giverImageUrl,
    editField,
    setActiveTab,
    setViewMode,
    setDedication,
    setGiver,
    setRecipient,
    setGiverImageUrl,
    setEditField,
  } = useStore();

  const previewStoreUserData = usePreviewStore((s) => s.userData);
  const handleGuestRateLimitLogin = useCallback(() => {
    setGuestUploadRateLimitError(null);
    openLoginModal();
  }, [openLoginModal]);

  // KS 流程：通过查询参数关闭 Others 标签
  const isKs = searchParams.get('ks') === '1';
  // 圣诞 bundle：通过查询参数关闭 Others(Options) 标签
  const isHideOptions = searchParams.get('hideOptions') === '1';
  const hideOthers = isKs || isHideOptions;
  // 圣诞 bundle：根据封面类型决定默认封面（cover_type=personalized -> cover_3）
  const coverTypeParam = (searchParams.get('cover_type') || '').toLowerCase();
  const preferCover3AsDefault = isHideOptions && coverTypeParam === 'personalized';
  const bindingTypeParam = (searchParams.get('binding_type') || '').toLowerCase();
  const getFirstNonEmptyString = (...values: any[]) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value;
    }
    return '';
  };
  const getCartGiftMessage = (item: any) =>
    getFirstNonEmptyString(
      item?.attributes?.gift_message,
      item?.customization_data?.attributes?.gift_message,
      item?.preview?.attributes?.gift_message,
      item?.preview?.message,
      item?.preview?.dedication,
      item?.message,
    );
  const findCartItemForPreview = (items: any[], previewId?: string | null, fromCartItemId?: string | null) => {
    const stack = [...items];
    while (stack.length > 0) {
      const item = stack.shift();
      if (!item) continue;
      if (fromCartItemId && String(item.id) === String(fromCartItemId)) return item;
      const itemPreviewId =
        item.preview_id ||
        item.customization_data?.preview_id ||
        item.preview?.preview_id ||
        null;
      if (previewId && String(itemPreviewId) === String(previewId)) return item;
      const children = [
        ...(Array.isArray(item.items) ? item.items : []),
        ...(Array.isArray(item.subItems) ? item.subItems : []),
      ];
      stack.push(...children);
    }
    return null;
  };
  // 手机端底部状态面板（点击右侧箭头展开）
  const [mobileStatusOpen, setMobileStatusOpen] = React.useState(false);

  // 打开 giver 裁剪弹窗时，确保收起状态面板
  React.useEffect(() => {
    if (editField === 'giver') setMobileStatusOpen(false);
  }, [editField]);

  // 页面加载即尝试从 Zustand store 预填 recipient（从 personalized-product 进入时）
  // 如果是从 personalized-product 进入，优先使用 store 中的名字，不会被后续的 batch API 覆盖
  useEffect(() => {
    try {
      // 优先使用内存中的预览数据（从 personalized-product 进入时会设置）
      const storeUserData = usePreviewStore.getState().userData as any;
      if (storeUserData) {
        const name = storeUserData?.characters?.[0]?.full_name;
        if (name && typeof name === 'string' && name.trim()) {
          setRecipient(name);
          console.log('[Preview] Set recipient from store (from personalized-product):', name);
          return;
        }
      }
      // 兜底：从 localStorage 获取
      const userData = localStorage.getItem('previewUserData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const name = parsed?.characters?.[0]?.full_name;
        if (name && typeof name === 'string' && name.trim()) {
          setRecipient(name);
        }
      }
    } catch {}
  }, [setRecipient]);

  // 从购物车列表预填充 message（若存在）
  // 注意：recipient_name 现在优先从 /products/{bookid}/preview/batches/{previewid} 获取
  useEffect(() => {
    const previewIdParam = searchParams.get('previewid');
    // 仅编辑流程（带 previewid）下启用
    if (!previewIdParam) return;
    (async () => {
      try {
        const res = await api.get(API_CART_LIST) as any;
        const items = res?.data?.items || res?.data?.cart_items || res?.cart_items || [];
        if (!Array.isArray(items) || items.length === 0) return;
        const fromCartItemIdParam = searchParams.get('fromCartItemId');
        const match = findCartItemForPreview(items, previewIdParam, fromCartItemIdParam);
        if (!match) return;
        const msg = getCartGiftMessage(match);
        console.debug('预填购物车留言命中:', { previewIdParam, hasMatch: !!match, msgExists: typeof msg === 'string' && !!msg.trim() });
        // 仅当当前 message 还是默认文案时覆盖，避免用户已编辑被覆盖
        if (typeof msg === 'string' && msg.trim()) {
          if (message === defaultMessage || !message || message.trim() === '') {
            setMessage(msg);
          }
          // 同步到画布渲染用的 dedication（后端 message 即前端 dedication）
          setDedication(msg);
          // 购物车里存在已保存的寄语：视为已提交
          setIsDedicationSubmitted(true);
        }
      } catch (e) {
        console.warn('获取购物车失败，跳过预填:', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 工具：将 result_images 应用到 preview_data
  const applyResultImagesToPreviewData = (data: any) => {
    try {
      const resultImages = data?.result_images;
      if (!Array.isArray(resultImages) || !Array.isArray(data?.preview_data)) return data;
      const mapByPageId: Record<number, string> = {};
      resultImages.forEach((r: any) => {
        const url = r?.result?.standard_url || r?.result_image_url || r?.result?.high_res_url || r?.result?.low_res_url;
        const pid = r?.page_id ?? r?.result?.page_id;
        if (pid != null && url) {
          mapByPageId[Number(pid)] = url;
        }
      });
      const updatedPages = data.preview_data.map((p: any) => {
        const newUrl = mapByPageId[p.page_id];
        if (newUrl) {
          return { ...p, image_url: newUrl, has_face_swap: true };
        }
        return p;
      });
      return {
        ...data,
        preview_data: updatedPages,
        status: 'completed',
        batch_id: (data as any)?.batch_id,
      };
    } catch {
      return data;
    }
  };

  // 编辑流程：检查 create-by-picbook 状态，决定直接使用结果或继续走 WS
  useEffect(() => {
    const previewIdParam = searchParams.get('previewid');
    const bookIdParam = searchParams.get('bookid');
    if (!previewIdParam || !bookIdParam) return;
    
    // 保存原始的 previewid（仅在首次加载时保存，避免后续 URL 更新时覆盖）
    if (!originalPreviewIdRef.current) {
      originalPreviewIdRef.current = previewIdParam;
      console.log('[Preview] Saved original previewid:', previewIdParam);
    }
    // 如果存在本地编辑数据，则优先走本地数据流程，跳过购物车旧数据分支
    try {
      const ud = localStorage.getItem('previewUserData');
      if (ud) {
        console.log('检测到本地用户数据，跳过购物车预览分支');
        return;
      }
    } catch {}
    (async () => {
      let recipientNameFromBatch: string | null = null;
      
      // 1. 尝试直接通过 previewId (batchId) 获取预览数据，这是最准确的方式
      if (previewIdParam && bookIdParam) {
        try {
          const path = `/products/${bookIdParam}/preview/batches/${previewIdParam}`;
          // 客户端强制走同域 /api 代理，避免跨域下响应头（X-Guest-Session-Id）不可读导致 guest session 无法续用
          const url = path;
          console.log('[Preview] Fetching batch directly:', url);
          
          const res = await api.get(url) as ApiResponse<any>;
          const batch = res?.data?.batch;
          
          if (batch) {
             console.log('[Preview] Loaded batch directly:', batch);
             
             // 从 batch 中获取 recipient_name
             // 注意：如果是从 personalized-product 进入的（store 中有数据），优先使用 store 中的名字
             const storeUserData = usePreviewStore.getState().userData as any;
             const storeName = storeUserData?.characters?.[0]?.full_name;
             
             recipientNameFromBatch = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name || null;
             // 如果 store 中有名字（从 personalized-product 进入），使用 store 中的名字
             // 否则使用 batch 中的名字
             if (storeName && typeof storeName === 'string' && storeName.trim()) {
               setRecipient(storeName);
               console.log('[Preview] Set recipient from store (from personalized-product):', storeName);
             } else if (recipientNameFromBatch && typeof recipientNameFromBatch === 'string' && recipientNameFromBatch.trim()) {
               setRecipient(recipientNameFromBatch);
               console.log('[Preview] Set recipient from batch:', recipientNameFromBatch);
             }
             
             if (batch?.pages) {
               // 构造 previewData
               const initialData = {
                  preview_id: undefined as any,
                  preview_data: batch.pages.map((bp: any, idx: number) => ({
                    page_id: idx + 1,
                    page_code: bp.page_code,
                    page_number: bp.sort_order ?? idx + 1,
                    // 保留后端原始 image_url（很多情况下它才是“未叠字/未合成”的底图）
                    raw_image_url: bp.image_url,
                    // 后端 stage 字段：用于前端“纯底图”选择
                    base_stage_url: bp.base_stage_url,
                    final_stage_url: bp.final_stage_url,
                    // 分层模型：后端可选返回 p3-4 giver 图片数据（URL 或 data URL）
                    giver_data: bp.giver_data,
                    // 分层模型：后端可选返回“纯底图”（无 dedication / 无 giver）
                    template_image_url: bp.template_image_url || bp.template_url,
                    image_url: bp.final_image_url || bp.base_image_url || bp.image_url,
                    has_face_swap: !!bp.has_face_elements,
                    status: bp.status,
                    base_image_url: bp.base_image_url,
                    final_image_url: bp.final_image_url,
                    base_only: bp.base_only,
                    queue_position: bp.queue_position,
                    queue_total: bp.queue_total,
                  })),
                  status: batch.status || 'processing',
                  batch_id: batch.batch_id,
                  queue_info: batch.queue,
                  batch_options: batch.options ?? null,
                } as any;

               setPreviewData(initialData);
               setIsProcessing(batch.status === 'pending' || batch.status === 'processing');
               
               // 如果未完成，启动轮询
               if (batch.status === 'pending' || batch.status === 'processing') {
                  currentBatchIdRef.current = batch.batch_id;
                  setCurrentBatchId(batch.batch_id);
                  updatePreviewIdInUrl(batch.batch_id);
                  startBatchPolling(bookIdParam, batch.batch_id);
                  subscribeToPreviewChannel(bookIdParam, batch.batch_id);
               } else if (batch.batch_id) {
                  // 即使已完成，也更新 URL
                  updatePreviewIdInUrl(batch.batch_id);
               }
             }
          }
        } catch (e) {
          console.warn('[Preview] Failed to fetch batch directly:', e);
        }
      }

      try {
        // 从购物车拿到 face_image 和基础参数（用于回显 recipient 等信息）
        // 注意：recipient_name 现在优先从 /products/{bookid}/preview/batches/{previewid} 获取
        const cartRes = await api.get(API_CART_LIST) as any;
        // 修正：优先尝试 data.items，兼容旧的 data.cart_items
        const items = cartRes?.data?.items || cartRes?.data?.cart_items || cartRes?.cart_items || [];
        const fromCartItemIdParam = searchParams.get('fromCartItemId');
        const match = findCartItemForPreview(items, previewIdParam, fromCartItemIdParam);
        const pv = match?.preview;
        
        if (match) {
            // 仅当未从 batch 获取到 recipient_name 且 store 中也没有名字时，才从购物车获取（作为兜底）
            // 注意：如果是从 personalized-product 进入的（store 中有数据），不覆盖 store 中的名字
            const storeUserData = usePreviewStore.getState().userData as any;
            const storeName = storeUserData?.characters?.[0]?.full_name;
            
            if ((!recipientNameFromBatch || recipientNameFromBatch.trim() === '') && (!storeName || !storeName.trim())) {
              const rname = match?.preview?.recipient_name || match?.full_name;
              if (rname && typeof rname === 'string' && rname.trim()) {
                setRecipient(rname);
                console.log('[Preview] Set recipient from cart (fallback):', rname);
              }
            }
            const msg = getCartGiftMessage(match);
            if (msg) {
               setMessage(msg);
               setDedication(msg);
               setIsDedicationSubmitted(true);
            }
        }

        if (!pv) return;
        // 下面的重新生成逻辑仅在无法直接获取 batch 时才需要（作为兜底），
        // 或者如果我们需要 pv 里的参数来重新发起请求。
        // 既然上面已经尝试直接获取 Batch，这里主要用于兜底。
        
        if (!previewData && match) {
             // ... 原有的兜底逻辑，只有在 previewData 还没被上面的逻辑设置时才执行 ...
             // (保持原有逻辑，但在开头加判断)
             // const faceImageRaw = ...
        }
      } catch (e) {
        console.warn('编辑流程状态检查失败:', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 首次渲染时根据屏幕宽度设置默认视图模式（窄屏 single，宽屏 double）
  const hasSetInitialViewMode = useRef(false);
  useEffect(() => {
    if (hasSetInitialViewMode.current) return;
    hasSetInitialViewMode.current = true;
    try {
      const isWide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
      setViewMode(isWide ? 'double' : 'single');
    } catch {}
  }, [setViewMode]);

  // 处理AI生成状态
  const [isProcessing, setIsProcessing] = useState(false);
  // 排队状态
  const [queueStatus, setQueueStatus] = useState<{position: number, total: number, estimatedWaitSeconds?: number} | null>(null);
  // 防重复提交/创建任务
  const hasPostedCreateRef = useRef(false);
  const isPostingCreateRef = useRef(false);
  const hasProcessedUserDataRef = useRef(false);
  
  // 预览数据状态
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // p7-8 展示完成后显示 sneak peek 提示文案
  const [isSneakPeekNoticePageLoaded, setIsSneakPeekNoticePageLoaded] = useState(false);
  const sneakPeekNoticePageIdRef = useRef<number | null>(null);
  // 顶部队列提示（原 “Your story is coming to life…”）：
  // - 依据 batch.queue.preview_pending 展示「Preparing / N books ahead / It’s your turn」
  // - 在 p3-4 还没出现在 preview_data 之前保持显示
  // - 只有当 p3-4 出现且该页图片 onLoad 后才隐藏
  const [isStoryComingTargetPageLoaded, setIsStoryComingTargetPageLoaded] = useState(false);
  const storyComingTargetPageIdRef = useRef<number | null>(null);

  // 为 Others 标签页添加局部状态，用于记录选中的选项
  const [selectedBookCover, setSelectedBookCover] = React.useState<number | null>(null);
  const [selectedBinding, setSelectedBinding] = React.useState<number | null>(null);
  const [selectedGiftBox, setSelectedGiftBox] = React.useState<number | null>(null);
  const [detailModal, setDetailModal] = React.useState<GiftBoxOption | null>(null);
  // 当前展示图片的索引，用于翻页
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState<string>("");
  // p3-4 扉页合成：缓存“基础底图”（不含文字/不含用户上传照片），避免二次编辑时在已合成图上叠字
  const p34BaseImageUrlRef = useRef<string | null>(null);
  // p3-4 分层模型：缓存 giver 图片数据（data URL），用于 dedication 重绘时始终携带最新 giver
  const p34GiverDataRef = useRef<string | null>(null);
  const shouldUploadP34ComposedRef = useRef(false);
  const p34ComposeUploadInFlightRef = useRef(false);
  const p34ComposeUploadedRef = useRef(false);
  const [guestUploadRateLimitError, setGuestUploadRateLimitError] = useState<UploadRateLimitError | null>(null);
  // sidebar「Name on Book」完成态：用户上传过图片也算完成（且上传合成后清空 giverImageUrl 时不回退）
  const [isNameOnBookCompleted, setIsNameOnBookCompleted] = useState(true);
  // dedication 完成态：必须用户点过 Submit 才算完成（避免默认寄语导致“已完成”误导）
  const [isDedicationSubmitted, setIsDedicationSubmitted] = useState(false);

  // Giver图片编辑：隐藏的文件输入框 + 本地待裁剪图片（objectURL）
  const giverFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingGiverFile, setPendingGiverFile] = React.useState<string | null>(null);
  const momDrawingFileInputRef = useRef<HTMLInputElement>(null);
  const activeMomDrawingPageCodeRef = useRef<'p5-6' | 'p27-28' | null>(null);
  const [pendingMomDrawingFile, setPendingMomDrawingFile] = React.useState<string | null>(null);
  const [activeMomDrawingPageCode, setActiveMomDrawingPageCode] = React.useState<'p5-6' | 'p27-28' | null>(null);
  const [momDrawingUploadingPageCode, setMomDrawingUploadingPageCode] = React.useState<'p5-6' | 'p27-28' | null>(null);
  const [uploadedMomDrawingPageCodes, setUploadedMomDrawingPageCodes] = React.useState<Set<string>>(() => new Set());

  // 当 previewid/bookid 变化时重置缓存，避免跨不同预览复用旧数据
  const p34CacheKey = `${searchParams.get('bookid') || ''}_${searchParams.get('previewid') || ''}`;

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'giftBox' || tabParam === 'addons' || tabParam === 'giftOptions' || tabParam === 'options') return;
    setActiveTab('Book preview');
  }, [p34CacheKey, searchParams, setActiveTab]);

  // 切换到不同 preview 时重置 Submit 状态（后续若从后端/购物车回填到真实寄语，会再置为 true）
  useEffect(() => {
    setIsDedicationSubmitted(false);
  }, [p34CacheKey]);

  // 切换到不同 preview/book 时，必须清空本地 giver 图片状态，避免上一单的上传影响下一本书
  useEffect(() => {
    setGiverImageUrl(null);
    setEditField(null);
    setPendingGiverFile(null);
    setPendingMomDrawingFile(null);
    setActiveMomDrawingPageCode(null);
    activeMomDrawingPageCodeRef.current = null;
    setMomDrawingUploadingPageCode(null);
    setUploadedMomDrawingPageCodes(new Set());
    setIsNameOnBookCompleted(false);
    setGuestUploadRateLimitError(null);
    shouldUploadP34ComposedRef.current = false;
    p34ComposeUploadInFlightRef.current = false;
    p34ComposeUploadedRef.current = false;
  }, [p34CacheKey, setEditField, setGiverImageUrl]);

  useEffect(() => {
    p34BaseImageUrlRef.current = null;
    p34GiverDataRef.current = null;
  }, [p34CacheKey]);

  // 首次拿到 previewData 后，记录 p3-4 的“纯底图”（尽量不含 dedication / 不含 giver）
  // 目的：后续每次用 Canvas 叠加 giver / dedication 时，都从同一张干净底图开始重绘，避免“在已合成图上继续覆盖”导致残影/比例问题。
  useEffect(() => {
    if (p34BaseImageUrlRef.current) return;
    const pages = (previewData as any)?.preview_data;
    if (!Array.isArray(pages)) return;
    const p34 = pages.find((p: any) => {
      const code = String(p?.page_code || '');
      return code === 'p3-4' || code === 'p3-p4';
    });
    // “纯底图”只使用后端的 base_stage_url（对应 base stage）。
    const base = (p34 as any)?.base_stage_url;
    if (typeof base === 'string' && base.trim()) {
      p34BaseImageUrlRef.current = base;
    }
  }, [previewData]);

  const uploadP34ComposedImage = useCallback(async (dataUrl: string) => {
    // 仅在用户刚上传完图片后触发一次
    if (!shouldUploadP34ComposedRef.current) {
      console.debug('[P3-4 Compose] skip: shouldUpload=false');
      return;
    }
    if (p34ComposeUploadedRef.current) {
      console.debug('[P3-4 Compose] skip: already uploaded');
      return;
    }
    if (p34ComposeUploadInFlightRef.current) {
      console.debug('[P3-4 Compose] skip: in flight');
      return;
    }

    const spu = searchParams.get('bookid');
    // batch_id 的兜底：优先用 previewData.batch_id；否则用 URL previewid（该项目里 previewid 通常等于 batch_id）
    const batchId = (previewData as any)?.batch_id || searchParams.get('previewid');

    console.log('[P3-4 Compose] attempting upload', {
      spu,
      batchId,
      hasDataUrl: Boolean(dataUrl),
      dataUrlPrefix: typeof dataUrl === 'string' ? dataUrl.slice(0, 32) : '',
      dataUrlLength: typeof dataUrl === 'string' ? dataUrl.length : 0,
    });

    if (!spu) {
      console.warn('[P3-4 Compose] skip: missing bookid');
      return;
    }
    if (!batchId) {
      console.warn('[P3-4 Compose] skip: missing batch_id (check previewData.batch_id / url previewid)');
      return;
    }
    if (!dataUrl) {
      console.warn('[P3-4 Compose] skip: missing dataUrl');
      return;
    }

    // 上传前兜底：如果还没缓存过纯底图，先从当前 previewData 里抓一次，避免后续 image_url 被覆盖成“已合成图”
    if (!p34BaseImageUrlRef.current) {
      const pages = (previewData as any)?.preview_data;
      if (Array.isArray(pages)) {
        const p34 = pages.find((p: any) => {
          const code = String(p?.page_code || '');
          return code === 'p3-4' || code === 'p3-p4';
        });
        const base = (p34 as any)?.base_stage_url;
        if (typeof base === 'string' && base.trim()) {
          p34BaseImageUrlRef.current = base;
        }
      }
    }

    p34ComposeUploadInFlightRef.current = true;
    try {
      const giverData =
        p34GiverDataRef.current ||
        (() => {
          try {
            const pages = (previewData as any)?.preview_data;
            if (!Array.isArray(pages)) return null;
            const p34 = pages.find((p: any) => {
              const code = String(p?.page_code || '');
              return code === 'p3-4' || code === 'p3-p4';
            });
            return (p34 as any)?.giver_data || null;
          } catch {
            return null;
          }
        })();
      // 需要把 dedication 和 giver_data 一起持久化到后端：
      // - 即使 dedication 为空字符串，也显式传给后端（用于清空/同步）
      const dedicationTextToPersist = typeof dedication === 'string' ? dedication.trim() : '';
      const resp: any = await api.post(
        `/products/${encodeURIComponent(spu)}/pages/p3-4/upload-special-image`,
        {
          data: dataUrl,
          batch_id: batchId,
          ...(giverData ? { giver_data: giverData } : {}),
          dedication_text: dedicationTextToPersist,
        },
        { timeout: 120000 },
      );
      const imageUrl = resp?.data?.image_url || resp?.image_url || '';
      // 重要：后端若返回 base_image_url（无 dedication，但包含最新 giver 图），必须同步保存
      const baseUrl =
        resp?.data?.base_image_url ||
        resp?.base_image_url ||
        resp?.data?.base_url ||
        resp?.base_url ||
        '';
      console.log('[P3-4 Compose] upload response', { hasImageUrl: Boolean(imageUrl), imageUrl, hasBaseUrl: Boolean(baseUrl), baseUrl });

      if (imageUrl) {
        setPreviewData((prev) => {
          if (!prev || !(prev as any).preview_data) return prev as any;
          return {
            ...(prev as any),
            preview_data: (prev as any).preview_data.map((p: any) => {
              const code = String(p?.page_code || '');
              const isP34 = code === 'p3-4' || code === 'p3-p4';
              return isP34
                ? {
                    ...p,
                    image_url: imageUrl,
                    ...(baseUrl ? { base_image_url: baseUrl } : {}),
                    ...(giverData ? { giver_data: giverData } : {}),
                  }
                : p;
            }),
          } as any;
        });
        // 注意：p34BaseImageUrlRef 缓存的是“纯底图”（template/raw），不要用返回的 base_image_url 覆盖；
        // base_image_url 可能包含历史 giver，若再叠加新的 giver（比例不同）会出现边缘残影。
        shouldUploadP34ComposedRef.current = false;
        p34ComposeUploadedRef.current = true;
        setIsNameOnBookCompleted(true);
        setGuestUploadRateLimitError(null);
      } else {
        console.warn('[P3-4 Compose] uploaded but no image_url in response', resp);
      }
    } catch (e) {
      console.error('[P3-4 Compose] upload failed', e);
      const uploadRateLimitError = getUploadRateLimitError(e);
      if (uploadRateLimitError) {
        // Canvas 会在依赖变化时反复触发 onRendered；429 后若仍保持 shouldUpload=true 会形成上传风暴并反复清空/弹出弹窗
        shouldUploadP34ComposedRef.current = false;
        setGuestUploadRateLimitError(uploadRateLimitError);
      } else {
        toast.error('Upload failed, please try again.');
      }
    } finally {
      p34ComposeUploadInFlightRef.current = false;
    }
  }, [previewData, searchParams, dedication]);

  // 一旦本地选择了 giver 图片（blob/objectURL 或远程 URL），就把 Name on Book 标记为完成
  useEffect(() => {
    if (giverImageUrl) {
      setIsNameOnBookCompleted(true);
    }
  }, [giverImageUrl]);
  
  // 处理Giver图片文件选择
  const handleGiverFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingGiverFile(url);
    setEditField('giver');
    // 重置input，以便可以再次选择同一个文件
    if (giverFileInputRef.current) {
      giverFileInputRef.current.value = '';
    }
  }, []);

  const handleMomDrawingFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetPageCode = activeMomDrawingPageCodeRef.current || activeMomDrawingPageCode;
    if (!file || !targetPageCode) return;
    const url = URL.createObjectURL(file);
    setActiveMomDrawingPageCode(targetPageCode);
    setPendingMomDrawingFile(url);
    if (momDrawingFileInputRef.current) {
      momDrawingFileInputRef.current.value = '';
    }
  }, [activeMomDrawingPageCode]);

  const closeMomDrawingCropper = useCallback(() => {
    if (pendingMomDrawingFile) {
      URL.revokeObjectURL(pendingMomDrawingFile);
    }
    setPendingMomDrawingFile(null);
    setActiveMomDrawingPageCode(null);
    activeMomDrawingPageCodeRef.current = null;
  }, [pendingMomDrawingFile]);

  const uploadMomCompositeImage = useCallback(async (
    pageCode: 'p5-6' | 'p27-28',
    file: File,
    options?: { overlayMode?: 'placement' | 'full-page' },
  ): Promise<'ok' | 'rate_limited' | 'skipped'> => {
    const spu = (searchParams.get('bookid') || '').toUpperCase();
    const previewForMom = previewData as MomCompositePreviewData | null;
    const batchId = previewForMom?.batch_id || searchParams.get('previewid');

    if (spu !== 'PICBOOK_MOM' || !batchId) {
      console.warn('[Mom Composite] skip upload: invalid book or missing batch_id', { spu, batchId, pageCode });
      return 'skipped';
    }

    const targetPage = previewForMom?.preview_data?.find(
      (p) => toMomCompositeUploadPageCode(p?.page_code) === pageCode,
    );
    const isFaceSwapReady = Boolean(
      previewForMom?.status === 'completed' ||
      faceSwapStatusRef.current === 'completed' ||
      String(targetPage?.status || '').toLowerCase() === 'completed',
    );
    if (!targetPage || !isFaceSwapReady) {
      toast.error('Please wait until face swap is complete before uploading.');
      return 'skipped';
    }
    const placement = MOM_COMPOSITE_IMAGE_PLACEMENTS[pageCode];
    const baseImageRaw = String(targetPage?.base_image_url || '').trim();
    if (!baseImageRaw) {
      toast.error('Page image is not ready yet.');
      return 'skipped';
    }

    setMomDrawingUploadingPageCode(pageCode);
    setGuestUploadRateLimitError(null);
    try {
      const dataUrl = await composeMomCompositeImage(
        normalizePreviewImageUrlForCanvas(String(baseImageRaw)),
        file,
        placement,
        options?.overlayMode,
      );

      const resp = await api.post(
        `/products/PICBOOK_MOM/pages/${pageCode}/upload-composite-image`,
        {
          batch_id: batchId,
          data: dataUrl,
        },
        { timeout: 120000 },
      ) as MomCompositeUploadResponse;
      const imageUrl =
        resp?.data?.image_url ||
        resp?.image_url ||
        resp?.data?.final_image_url ||
        resp?.final_image_url ||
        resp?.data?.composite_image_url ||
        resp?.composite_image_url ||
        '';

      if (imageUrl) {
        setPreviewData((prev) => {
          const prevWithMom = prev as MomCompositePreviewData | null;
          if (!prevWithMom?.preview_data) return prev;
          return {
            ...prevWithMom,
            preview_data: prevWithMom.preview_data.map((p) => {
              const uploadPageCode = toMomCompositeUploadPageCode(p?.page_code);
              return uploadPageCode === pageCode
                ? {
                    ...p,
                    image_url: imageUrl,
                    final_image_url: imageUrl,
                    composite_image_url: imageUrl,
                  }
                : p;
            }),
          } as PreviewResponse;
        });
        setUploadedMomDrawingPageCodes((prev) => {
          const next = new Set(prev);
          next.add(pageCode);
          return next;
        });
        return 'ok';
      } else {
        console.warn('[Mom Composite] uploaded but no image_url in response', resp);
        return 'skipped';
      }
    } catch (e) {
      console.error('[Mom Composite] upload failed', e);
      const uploadRateLimitError = getUploadRateLimitError(e);
      if (uploadRateLimitError) {
        setGuestUploadRateLimitError(uploadRateLimitError);
        return 'rate_limited';
      }
      toast.error('Upload failed, please try again.');
      return 'skipped';
    } finally {
      setMomDrawingUploadingPageCode(null);
    }
  }, [previewData, searchParams]);

  const getMomCompositeDefaultGender = useCallback((): MomCompositeDefaultGender | null => {
    const character =
      (previewStoreUserData as any)?.characters?.[0] ||
      (() => {
        try {
          const userData = typeof window !== 'undefined' ? localStorage.getItem('previewUserData') : null;
          return userData ? JSON.parse(userData)?.characters?.[0] : null;
        } catch {
          return null;
        }
      })();

    const fromCharacter = normalizeMomCompositeDefaultGender(character?.gender, character?.gender_code);
    if (fromCharacter) return fromCharacter;
    return momCompositeGenderFromBatchOptions((previewData as any)?.batch_options);
  }, [previewStoreUserData, previewData]);

  const handleUseDefaultMomDrawing = useCallback(async (pageCode: 'p5-6' | 'p27-28') => {
    const gender = getMomCompositeDefaultGender();
    if (!gender) {
      toast.error('Default drawing is unavailable because gender is missing.');
      return;
    }

    const defaultImagePath = getMomCompositeDefaultImagePath(pageCode, gender);
    try {
      const response = await fetch(defaultImagePath);
      if (!response.ok) throw new Error(`Failed to load default image: ${defaultImagePath}`);
      const blob = await response.blob();
      const file = new File([blob], `${pageCode}-${gender}.png`, { type: blob.type || 'image/png' });
      const result = await uploadMomCompositeImage(pageCode, file, { overlayMode: 'full-page' });
      if (result === 'rate_limited') return;
      if (result !== 'ok') {
        toast.error('Default drawing failed, please try again.');
      }
    } catch (error) {
      console.error('[Mom Composite] default image failed', error);
      toast.error('Default drawing failed, please try again.');
    }
  }, [getMomCompositeDefaultGender, uploadMomCompositeImage]);

  // 添加 options 状态
  const [bookOptions, setBookOptions] = useState<BookOptions | null>(null);
  // cover 缩略图统一比例：以 cover_1 的真实图片宽高比为准（用于让 cover_3/4 与 cover_1 同高）
  const [coverThumbAspectRatio, setCoverThumbAspectRatio] = useState<number | null>(null);

  // 圣诞 bundle：自动预选默认封面/装订（不让 Add to cart 引导去 option tab）
  useEffect(() => {
    if (!isHideOptions) return;
    if (!bookOptions) return;

    // cover: personalized -> cover_3，否则 cover_1
    if (selectedBookCover == null && Array.isArray(bookOptions.cover_options) && bookOptions.cover_options.length > 0) {
      const findCover = (coverId: '1' | '3') =>
        bookOptions.cover_options.find(
          (o) =>
            String(o.id) === coverId ||
            o.option_key === coverId ||
            (typeof o.option_key === 'string' && o.option_key.toLowerCase().includes(`cover_${coverId}`)),
        ) || null;
      const preferred = preferCover3AsDefault ? findCover('3') : findCover('1');
      const fallback = preferCover3AsDefault ? findCover('1') : findCover('3');
      const chosen = preferred || fallback || bookOptions.cover_options[0];
      if (chosen?.id != null) setSelectedBookCover(chosen.id);
    }

    // binding: 按 URL 的 binding_type 尝试匹配 option_key / name（例如 hardcover）
    if (selectedBinding == null && bindingTypeParam && Array.isArray(bookOptions.binding_options)) {
      const chosen =
        bookOptions.binding_options.find((o: any) => String(o.option_key || '').toLowerCase() === bindingTypeParam) ||
        bookOptions.binding_options.find((o: any) => String(o.name || '').toLowerCase().includes(bindingTypeParam)) ||
        null;
      if (chosen?.id != null) setSelectedBinding(chosen.id);
    }
  }, [isHideOptions, bookOptions, preferCover3AsDefault, bindingTypeParam, selectedBookCover, selectedBinding]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  // Bravey 封面文案配置（根据 page_properties.json 绘制名字）
  const [coverTextConfig, setCoverTextConfig] = useState<{
    key: string;
    texts: Array<{
      type?: string;
      font?: string;
      fontWeight?: string;
      fontSize?: number;
      color?: string;
      position?: { x: number; y: number };
      alignment?: string;
    }>;
  } | null>(null);

  // 仅预填一次个性化产品的封面/装订/礼盒选项
  const hasPrefilledOptionsRef = useRef(false);
  useEffect(() => {
    if (hasPrefilledOptionsRef.current) return;
    if (!bookOptions) return;
    const previewIdParam = searchParams.get('previewid');
    if (!previewIdParam) return;
    // 仅用于“购物车 create book”流程：不从购物车条目里预选封面/装订/礼盒，避免误导用户
    if (searchParams.get('skipPrefillOptions') === '1') return;
    (async () => {
      try {
        const res = await api.get(API_CART_LIST) as any;
        const items = res?.data?.items || res?.data?.cart_items || res?.cart_items || [];
        if (!Array.isArray(items) || items.length === 0) return;
        const fromCartItemIdParam = searchParams.get('fromCartItemId');
        const matchByCartItemId = fromCartItemIdParam
          ? items.find((ci: any) => String(ci.id) === String(fromCartItemIdParam))
          : null;
        const matchByPreviewId = items.find((ci: any) => String(ci.preview_id) === String(previewIdParam));
        const match = matchByCartItemId || matchByPreviewId;
        const pv = match?.preview;
        if (!pv && !match) return;

        console.log('Preview Page: Found cart match for prefill:', match);

        // 服务器存储的是 option_key（或回退为 id/name），尝试多种键名以兼容历史数据
        // 优先从 preview 对象读取，如果没有则从 item.attributes 读取
        const coverKey = pv?.cover_type || pv?.cover || pv?.cover_option || pv?.cover_key || match?.attributes?.cover_style;
        const bindingKey = pv?.binding_type || pv?.binding || pv?.binding_option || pv?.binding_key || (match as any)?.attributes?.binding_type;
        const giftKey = pv?.gift_box || pv?.wrap || pv?.wrap_option || pv?.gift_box_key || match?.attributes?.giftbox;

        let changed = false;

        if (selectedBookCover == null && coverKey) {
          const cover = bookOptions?.cover_options?.find(
            (o) => o.option_key === String(coverKey) || String(o.id) === String(coverKey)
          );
          if (cover) {
            setSelectedBookCover(cover.id);
            changed = true;
          }
        }

        if (selectedBinding == null && bindingKey) {
          const binding = bookOptions?.binding_options?.find(
            (o) => o.option_key === String(bindingKey) || String(o.id) === String(bindingKey)
          );
          if (binding) {
            setSelectedBinding(binding.id);
            changed = true;
          }
        }

        if (selectedGiftBox == null && giftKey) {
          const gift = bookOptions?.gift_box_options?.find(
            (o) => (o.option_key ? o.option_key === String(giftKey) : false) || String(o.id) === String(giftKey) || o.name === String(giftKey)
          );
          if (gift) {
            setSelectedGiftBox(gift.id);
            changed = true;
          }
        }

        if (changed) {
          hasPrefilledOptionsRef.current = true;
        }
      } catch (e) {
        console.warn('预填选项失败，跳过:', e);
      }
    })();
  }, [bookOptions, searchParams, selectedBookCover, selectedBinding, selectedGiftBox]);

  // 为当前书籍的当前封面（如果 R2 上存在 page_properties.json）加载文字配置，用于在封面上绘制名字
  const lastCoverTextConfigKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const bookIdParam = searchParams.get('bookid');
    let upperBookId = (bookIdParam || '').toUpperCase();
    if (upperBookId === 'PICBOOK_GOODNIGHT3') {
      upperBookId = 'PICBOOK_GOODNIGHT';
    }
    if (!upperBookId) {
      if (coverTextConfig) setCoverTextConfig(null);
      lastCoverTextConfigKeyRef.current = null;
      return;
    }
    if (!bookOptions?.cover_options || bookOptions.cover_options.length === 0) {
      if (coverTextConfig) setCoverTextConfig(null);
      lastCoverTextConfigKeyRef.current = null;
      return;
    }

    // 复用封面区域的 activeOption 选择逻辑：
    // - 如果用户已选择封面，则使用选中的封面；
    // - 否则：默认优先 cover_1；
    // - 圣诞 bundle 且 cover_type=personalized：默认优先 cover_3；
    // - 若不存在对应 cover，则回退到另一个 cover，再兜底第一个。
    let activeOption: CoverOption | null = null;
    if (selectedBookCover != null) {
      activeOption = bookOptions.cover_options.find((o) => o.id === selectedBookCover) || null;
    }
    if (!activeOption) {
      const findCover1 = () =>
        bookOptions.cover_options.find(
          (o) =>
            String(o.id) === '1' ||
            o.option_key === '1' ||
            (typeof o.option_key === 'string' && o.option_key.toLowerCase().includes('cover_1')),
        ) || null;
      const findCover3 = () =>
        bookOptions.cover_options.find(
          (o) =>
            String(o.id) === '3' ||
            o.option_key === '3' ||
            (typeof o.option_key === 'string' && o.option_key.toLowerCase().includes('cover_3')),
        ) || null;

      // 1）优先：cover_1（默认）或 cover_3（圣诞 personalized）
      activeOption = preferCover3AsDefault ? findCover3() : findCover1();
      // 2）回退：另一个 cover
      if (!activeOption) {
        activeOption = preferCover3AsDefault ? findCover1() : findCover3();
      }
      // 3）兜底：第一个
      if (!activeOption && bookOptions.cover_options.length > 0) {
        activeOption = bookOptions.cover_options[0];
      }
    }
    if (!activeOption) return;

    const rawCoverKey = activeOption.option_key || String(activeOption.id);
    const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(activeOption.id);
    const configKey = `${upperBookId}_${coverId}`;

    // 同一个 bookId+coverId 不要重复拉取（尤其在 React 18 dev strict mode 下 effect 会触发两次）
    if (lastCoverTextConfigKeyRef.current === configKey) {
      return;
    }
    lastCoverTextConfigKeyRef.current = configKey;

    // 尝试通过本地 API 代理获取 R2 上的 page_properties.json
    (async () => {
      try {
        const qs = new URLSearchParams({
          bookId: upperBookId,
          coverId,
        });
        const res = await fetch(`/api/cover-page-properties?${qs.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          // 不抛错，只是当前封面没有配置文本
          setCoverTextConfig(null);
          return;
        }
        const json = await res.json();
        const texts = normalizeCoverTexts(json);
        if (!texts.length) {
          setCoverTextConfig(null);
          return;
        }
        setCoverTextConfig({
          key: configKey,
          texts,
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('[coverTextConfig] 加载成功:', {
            key: configKey,
            bookId: upperBookId,
            coverId,
            textsCount: texts.length,
            selectedBookCover,
          });
        }
      } catch (err) {
        console.warn('Failed to load cover page_properties via API:', err);
        setCoverTextConfig(null);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, bookOptions, selectedBookCover]);

  // 添加到购物车的状态
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 在其他状态定义之后添加
  const [bookInfo, setBookInfo] = useState<BaseBook | null>(null);
  const [isLoadingBookInfo, setIsLoadingBookInfo] = useState(false);
  // 封面图片加载中状态（用于显示 mirage 动效）
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  // 预览页数量（来自 /picbooks/{id} 的 preview_pages_count）
  const [previewPagesCount, setPreviewPagesCount] = useState<number | null>(null);
  // has_replaceable_text==2 的目标页集合（来自 /picbooks/{id} data.pages[]）
  const [replaceableTextPageIds, setReplaceableTextPageIds] = useState<Set<number>>(new Set());
  const [replaceableTextPageNumbers, setReplaceableTextPageNumbers] = useState<Set<number>>(new Set());
  // 每页换脸完成的记录，用于在全局仍 processing 时关闭单页蒙版
  const [swappedPageIds, setSwappedPageIds] = useState<Set<number>>(new Set());
  // 最新的全局状态引用（使用顶层 status），供 WS 回调中使用，避免闭包陈旧值
  const faceSwapStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    faceSwapStatusRef.current = (previewData as any)?.status;
  }, [(previewData as any)?.status]);
  
  // 每页进度（0-100），定时驱动：60s 线性至 98%，未完成停在 98%，完成后迅速到 100%
  const [pageProgress, setPageProgress] = useState<Record<number, number>>({});
  const progressTimersRef = useRef<Record<number, any>>({});
  const progressStartedRef = useRef<Set<number>>(new Set());
  // 完成后短暂保留蒙版的集合（例如 300ms），用于展示 100%
  const [completedOverlayHold, setCompletedOverlayHold] = useState<Set<number>>(new Set());
  // 当前批次 batch_id（仅处理该批次的广播）
  const currentBatchIdRef = useRef<string | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  // 保存原始的 previewid（从 URL 参数获取，用于 add to cart 时作为 old_preview_id）
  const originalPreviewIdRef = useRef<string | null>(null);
  // 预览专用频道（preview.user-*/guest.*.batchId）
  const previewChannelNameRef = useRef<string | null>(null);
  const subscribedPreviewChannelRef = useRef<string | null>(null);
  
  // 面向 UI 的状态聚合（使用顶层 status）
  const faceSwapStatus = (previewData as any)?.status;
  const queuePos = queueStatus?.position ?? null;
  const isProcessingLike = faceSwapStatus === 'processing' || faceSwapStatus === 'pending';
  const isQueued = isProcessingLike && queuePos !== null && queuePos > 0;
  const isGenerating = isProcessingLike && (queuePos === null || queuePos === 0);
  const isCompleted = faceSwapStatus === 'completed';
  const isFailed = faceSwapStatus === 'failed';

  // 底部 sneak peek 提示：等 p7-8 这张预览图加载完成后再展示
  const sneakPeekNoticePageId = useMemo(() => {
    const pages = previewData?.preview_data ?? [];
    const candidate = pages.find((p: any) => {
      const code = String(p?.page_code || '');
      return code === 'p7-8' || code === 'p7-p8';
    });
    const id = candidate ? Number((candidate as any).page_id) : null;
    if (!id || Number.isNaN(id)) return null;
    return id;
  }, [previewData?.preview_data]);

  // p3-4：与下方 isGiverDedication 一致，用 page_code 定位
  const p34PageId = useMemo(() => {
    const pages = previewData?.preview_data ?? [];
    const p = pages.find((x: any) => {
      const c = String(x?.page_code || '');
      return c === 'p3-4' || c === 'p3-p4';
    });
    const id = p ? Number((p as any).page_id) : null;
    if (!id || Number.isNaN(id)) return null;
    return id;
  }, [previewData?.preview_data]);

  // 目标页：仅以 p3-4 为准（不再回退到其它页），避免 p3-4 尚未出现时提示提前消失
  const pageIdForStoryComingHide = p34PageId;

  // 顶部队列文案：在 p3-4 未就绪前显示；completed/failed 时隐藏。
  const showStoryComingLine = useMemo(
    () =>
      !isCompleted &&
      !isFailed &&
      (!pageIdForStoryComingHide || !isStoryComingTargetPageLoaded) &&
      (isProcessing || isProcessingLike),
    [isCompleted, isFailed, pageIdForStoryComingHide, isStoryComingTargetPageLoaded, isProcessing, isProcessingLike],
  );
  /** 服务端 batch.queue.preview_pending（排在当前批次前的预览任务数） */
  const previewPendingFromBatch = useMemo(() => {
    const raw = (previewData as any)?.queue_info?.preview_pending;
    if (typeof raw !== 'number' || Number.isNaN(raw)) return null;
    return Math.max(0, Math.floor(Number(raw)));
  }, [(previewData as any)?.queue_info?.preview_pending]);
  /** 用于 UI 展示的「前方还有几本」，在服务端的值下降时阶梯递减，给用户推进感 */
  const [displayedPreviewPending, setDisplayedPreviewPending] = useState<number | null>(null);
  useEffect(() => {
    const n = previewPendingFromBatch;
    if (n === null) {
      setDisplayedPreviewPending(null);
      return;
    }
    setDisplayedPreviewPending((curr) => {
      if (curr === null) return n;
      if (n > curr) return n;
      return curr;
    });
  }, [previewPendingFromBatch]);
  useEffect(() => {
    if (displayedPreviewPending === null || previewPendingFromBatch === null) return;
    if (displayedPreviewPending <= previewPendingFromBatch) return;
    const t = window.setTimeout(() => {
      setDisplayedPreviewPending((d) => (typeof d === 'number' ? d - 1 : d));
    }, 380);
    return () => clearTimeout(t);
  }, [displayedPreviewPending, previewPendingFromBatch]);
  /** 点为 1、2、3 个循环浮现 */
  const [comingLifeDotPhase, setComingLifeDotPhase] = useState(1);
  useEffect(() => {
    if (!showStoryComingLine) {
      setComingLifeDotPhase(1);
      return;
    }
    const t = window.setInterval(() => {
      setComingLifeDotPhase((d) => (d >= 3 ? 1 : d + 1));
    }, 450);
    return () => clearInterval(t);
  }, [showStoryComingLine]);

  const isStoryQueueYourTurnBanner =
    showStoryComingLine &&
    previewPendingFromBatch !== null &&
    displayedPreviewPending !== null &&
    previewPendingFromBatch === 0 &&
    displayedPreviewPending === 0;

  useEffect(() => {
    if (sneakPeekNoticePageIdRef.current !== sneakPeekNoticePageId) {
      sneakPeekNoticePageIdRef.current = sneakPeekNoticePageId;
      setIsSneakPeekNoticePageLoaded(false);
    }
  }, [sneakPeekNoticePageId]);
  useEffect(() => {
    if (storyComingTargetPageIdRef.current !== pageIdForStoryComingHide) {
      storyComingTargetPageIdRef.current = pageIdForStoryComingHide;
      setIsStoryComingTargetPageLoaded(false);
    }
  }, [pageIdForStoryComingHide]);
  useEffect(() => {
    // 仅当从无到有或 URL 变化时触发 loading，避免重复置为 true 导致闪烁
    setIsCoverLoading((prev) => {
      return Boolean(bookInfo?.default_cover);
    });
  }, [bookInfo?.default_cover]);

  // 启动/清理进度定时器：顺序推进——上一张出现最终图后，下一张才开始；开始前展示 loading
  useEffect(() => {
    if (!previewData?.preview_data) return;
    // 找出需要换脸的页，按 page_number 升序
    const pages = previewData.preview_data
      .filter((p: any) => !!p.has_face_swap)
      .sort((a: any, b: any) => Number(a.page_number) - Number(b.page_number));

    const step = 98 / 300; // 3 分钟线性到 98%

    // 遍历每页：仅当上一页 final 已出现时，才启动下一页进度；
    // 若该页仅有 base（无 final）但未轮到它，则显示 loading（由 overlayMode 控制）
    let previousFinalAppeared = true;
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const pid = Number(p.page_id);
      const hasBase = !!(p as any).base_image_url || !!p.image_url;
      const hasFinal = hasMeaningfulFinalImage(p);

      if (hasFinal) {
        // 本页完成：清理定时器并置 100
        if (progressTimersRef.current[pid]) {
          clearInterval(progressTimersRef.current[pid]);
          delete progressTimersRef.current[pid];
        }
        setPageProgress((prev) => ({ ...prev, [pid]: 100 }));
        previousFinalAppeared = true;
        continue;
      }

      const isPending = hasBase && !hasFinal;
      if (!isPending) {
        // 不显示进度
        if (progressTimersRef.current[pid]) {
          clearInterval(progressTimersRef.current[pid]);
          delete progressTimersRef.current[pid];
        }
        setPageProgress((prev) => (prev[pid] ? { ...prev, [pid]: 0 } : prev));
        previousFinalAppeared = previousFinalAppeared && hasFinal;
        continue;
      }

      if (previousFinalAppeared) {
        // 轮到该页：确保有进度定时器（progress 模式）
        if (!progressTimersRef.current[pid]) {
          setPageProgress((prev) => (prev[pid] == null ? { ...prev, [pid]: 1 } : prev));
          const id = setInterval(() => {
            setPageProgress((prev) => {
              const current = prev[pid] ?? 1;
              if (current >= 98) return prev;
              const next = Math.min(98, current + step);
              return { ...prev, [pid]: next };
            });
          }, 200);
          progressTimersRef.current[pid] = id;
        }
        previousFinalAppeared = false; // 锁定，等待该页完成
      } else {
        // 还未轮到该页：确保不启动进度，保持 0（交由 UI 以 loading 模式展示）
        if (progressTimersRef.current[pid]) {
          clearInterval(progressTimersRef.current[pid]);
          delete progressTimersRef.current[pid];
        }
        setPageProgress((prev) => (prev[pid] ? { ...prev, [pid]: 0 } : prev));
      }
    }

    // 清理多余的定时器（不在列表中的）
    Object.keys(progressTimersRef.current).forEach((key) => {
      const pid = Number(key);
      const found = pages.some((p: any) => Number(p.page_id) === pid);
      if (!found) {
        clearInterval(progressTimersRef.current[pid]);
        delete progressTimersRef.current[pid];
      }
    });
  }, [previewData?.preview_data]);

  // 获取 book options 的函数
  const fetchBookOptions = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingOptions(true);
      setOptionsError(null);

      // 改为直接读取产品详情，并从 attributes/pages 派生可选项
      const path = `/products/${encodeURIComponent(String(bookId))}`;
      // 客户端强制走同域 /api 代理
      const url = path;
      const resp = await api.get(url, { params: { language: displayLang } }) as any;
      const product = resp?.data?.data || resp?.data || {};

      const attributes: any[] = Array.isArray(product.attributes) ? product.attributes : [];
      const pages: any[] = Array.isArray(product.pages) ? product.pages : [];

      // 不同书籍在后台可能使用了不同的属性名来表示封面选项，这里做兼容处理
      let coverAttr =
        attributes.find((a: any) => a?.name === 'cover_style') ||
        attributes.find((a: any) => a?.name === 'cover') ||
        attributes.find((a: any) => a?.name === 'cover_type') ||
        attributes.find((a: any) => a?.name === 'cover_option') ||
        attributes.find(
          (a: any) =>
            typeof a?.name === 'string' &&
            a.name.toLowerCase().includes('cover'),
        );
      const giftAttr = attributes.find((a: any) => a?.name === 'giftbox');
      const bindingAttr = attributes.find((a: any) => a?.name === 'binding_type');

      const pageImgByCode: Record<string, string> = {};
      pages.forEach((p: any) => {
        if (p?.page_code && p?.preview_image) pageImgByCode[p.page_code] = p.preview_image;
      });

      const cover_options = (coverAttr?.options || []).map((o: any, idx: number) => ({
        id: idx + 1,
        name: o?.label || String(o?.value),
        price: Number(o?.price_diff || 0),
        currency_code: 'USD',
        // 接口不再提供封面图片，封面统一走 R2（buildCoverR2Urls）
        image_url: '',
        is_default: !!o?.is_default,
        option_key: String(o?.value),
      }));

      const binding_options = (bindingAttr?.options || []).map((o: any, idx: number) => {
        const optionKey = String(o?.value || '').toLowerCase();
        const labelLower = String(o?.label || '').toLowerCase();
        // 与 buildBindingImageUrl 一致：先 premium，再 hard，再 soft。否则如 PREMIUM_HARDCOVER 会误匹配为经典精装文案。
        const keyForDesc = `${optionKey} ${labelLower}`;
        let description: string | null = null;
        if (
          keyForDesc.includes('premium') ||
          (keyForDesc.includes('lay') && keyForDesc.includes('flat')) ||
          /lay-?\s*flat|layflat|butterfly/i.test(String(o?.label || o?.value))
        ) {
          description =
            'Luxurious lay-flat pages for\nimmersive reading.\nA treasure to cherish.';
        } else if (keyForDesc.includes('hard') || keyForDesc.includes('classic') || /hard ?cover|精装/i.test(keyForDesc)) {
          description = 'Sturdy and elegant.\nPerfect for gifting.';
        } else if (keyForDesc.includes('soft') || keyForDesc.includes('paper') || /soft-?cover|软封|平装/i.test(keyForDesc)) {
          description = 'Light, flexible, and easy to take';
        }
        
        return {
        id: idx + 1,
        option_type: String(o?.value).toUpperCase(),
        option_key: String(o?.value),
        name: o?.label || String(o?.value),
          description,
        price: Number(o?.price_diff || 0),
        currency_code: 'USD',
        image_url: '',
        is_default: !!o?.is_default,
        };
      });

      const gift_box_options = (giftAttr?.options || []).map((o: any, idx: number) => {
        const optionKey = String(o?.value || '').toLowerCase();
        // 根据 option_key 设置描述
        let description = 'Crafted from sturdy recycled materials, beautify, reusable, and ready to gift.';
        if (optionKey.includes('standard')) {
          description = 'Simple and safely packed.';
        }
        
        return {
        id: idx + 1,
          // 后台的 label 可能包含 "(Included)" 或 "(+$14.99)" 等展示文案，这里只保留名称本体
          name: String(o?.label || o?.value || '')
            .replace(/\s*\([^)]*\)\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim() || String(o?.value),
        price: Number(o?.price_diff || 0),
        currency_code: 'USD',
        image_url: '',
          description,
        is_default: !!o?.is_default,
        option_key: String(o?.value),
        };
      });

      const derived: BookOptions = {
        cover_options,
        binding_options,
        gift_box_options,
      };

      setBookOptions(derived);
      console.log('Book options(derived) 获取成功:', derived);
    } catch (error: any) {
      console.error('获取 book options 失败:', error);
      setOptionsError(error.response?.data?.message || '获取选项失败');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  // 独立的 WebSocket 订阅：依赖 echo 和 user.id
  useEffect(() => {
    if (!echo || !user?.id) return;

    const userChannelName = `user.${user.id}`;
    const queueChannelName = 'face-swap-queue-status';

    const userChannel = echo.private(userChannelName);
    // 队列状态频道改为公共频道（需认证）
    const queueChannel = echo.channel(queueChannelName);

    const onTaskCompleted = (e: any) => {
      console.log('任务完成:', e);
      setIsProcessing(true);
      // 仅处理当前 batch
      const eventBatchId = extractBatchIdFromEvent(e);
      if (currentBatchIdRef.current && eventBatchId && eventBatchId !== currentBatchIdRef.current) {
        console.log('忽略非当前批次任务完成事件:', eventBatchId, '当前:', currentBatchIdRef.current);
        return;
      }
      try {
        const evt = normalizeWsEvent(e);
        const completedPageIdRaw = evt?.page_id || evt?.result?.page_id || evt?.task?.page_id || evt?.data?.page_id;
        const completedPageId = completedPageIdRaw != null ? Number(completedPageIdRaw) : undefined;
        const completedUrl = extractImageUrlFromEvent(evt);
        if (completedPageId != null && !Number.isNaN(completedPageId) && completedUrl) {
          setPreviewData(prev => {
            if (!prev) return prev;
            const updatedPages = prev.preview_data.map((p) => {
              if (p.page_id === completedPageId) {
                return { ...p, image_url: completedUrl, has_face_swap: true };
              }
              return p;
            });
            return {
              ...prev,
              preview_data: updatedPages,
              // 不回退全局状态，保持原样（由批次完成事件统一置为 completed）
            } as PreviewResponse;
          });
          // 记录该页已完成，移除该页的蒙版
          setSwappedPageIds(prev => {
            const next = new Set(prev);
            next.add(Number(completedPageId));
            return next;
          });
          // 冲刺到 100%，并短暂保留蒙版
          const pid = Number(completedPageId);
          setPageProgress(prev => ({ ...prev, [pid]: 100 }));
          // 清理定时器
          if (progressTimersRef.current[pid]) {
            clearInterval(progressTimersRef.current[pid]);
            delete progressTimersRef.current[pid];
          }
          setCompletedOverlayHold(prev => {
            const next = new Set(prev);
            next.add(pid);
            return next;
          });
          setTimeout(() => {
            setCompletedOverlayHold(prev => {
              const next = new Set(prev);
              next.delete(pid);
              return next;
            });
          }, 300);
        } else {
          setTimeout(() => { fetchPreviewData(); }, 100);
        }
      } catch (err) {
        console.error('处理任务完成事件出错:', err);
      }
    };

    const onTaskFailed = (e: any) => {
      console.error('任务失败:', e);
      // 仅处理当前 batch
      const eventBatchId = extractBatchIdFromEvent(e);
      if (currentBatchIdRef.current && eventBatchId && eventBatchId !== currentBatchIdRef.current) {
        console.log('忽略非当前批次任务失败事件:', eventBatchId, '当前:', currentBatchIdRef.current);
        return;
      }
      // 若全局已完成，忽略迟到的失败事件，避免 UI 误回退或误报
      if ((previewData as any)?.status === 'completed') {
        return;
      }
      setIsProcessing(false);
      const msg = e?.error_message || e?.message || '任务失败';

    };

    const onBatchCompleted = (e: any) => {
      console.log('批次完成:', e);
      // 仅处理当前 batch
      const eventBatchId = extractBatchIdFromEvent(e);
      if (currentBatchIdRef.current && eventBatchId && eventBatchId !== currentBatchIdRef.current) {
        console.log('忽略非当前批次完成事件:', eventBatchId, '当前:', currentBatchIdRef.current);
        return;
      }
      setIsProcessing(false);
      setQueueStatus(null); // 清除排队状态
      try {
        const evt = normalizeWsEvent(e);
        const results = evt?.results || evt?.data?.results || [];
        if (Array.isArray(results) && results.length > 0) {
          setPreviewData(prev => {
            if (!prev) return prev;
            const updatedPages = prev.preview_data.map((p) => {
              const match = results.find((r: any) => {
                const pid = Number(r?.page_id ?? r?.result?.page_id);
                return pid === p.page_id;
              });
              if (match) {
                const img = extractImageUrlFromEvent(match);
                if (img) {
                  return { ...p, image_url: img, has_face_swap: true };
                }
              }
              return p;
            });
            return {
              ...prev,
              preview_data: updatedPages,
              status: 'completed'
            } as PreviewResponse;
          });
          // 记录所有完成页，立刻移除蒙版
          setSwappedPageIds(prev => {
            const next = new Set(prev);
            results.forEach((r: any) => {
              const pid = r?.page_id ?? r?.result?.page_id;
              if (pid != null) next.add(Number(pid));
            });
            return next;
          });
          // 完成页冲刺到 100%，且短暂保留蒙版
          results.forEach((r: any) => {
            const pid = Number(r?.page_id ?? r?.result?.page_id);
            if (!isNaN(pid)) {
              setPageProgress(prev => ({ ...prev, [pid]: 100 }));
              if (progressTimersRef.current[pid]) {
                clearInterval(progressTimersRef.current[pid]);
                delete progressTimersRef.current[pid];
              }
            }
          });
          setCompletedOverlayHold(prev => {
            const next = new Set(prev);
            results.forEach((r: any) => {
              const pid = Number(r?.page_id ?? r?.result?.page_id);
              if (!isNaN(pid)) next.add(pid);
            });
            return next;
          });
          setTimeout(() => {
            setCompletedOverlayHold(prev => {
              const next = new Set(prev);
              results.forEach((r: any) => {
                const pid = Number(r?.page_id ?? r?.result?.page_id);
                if (!isNaN(pid)) next.delete(pid);
              });
              return next;
            });
          }, 300);
        } else {
          // 没有 results 时，回退重新拉取
          setTimeout(() => { fetchPreviewData(); }, 100);
        }
      } catch (err) {
        console.error('处理批次完成事件出错:', err);
        setTimeout(() => { fetchPreviewData(); }, 100);
      }
    };

    // 监听排队状态更新
    const onQueueStatusUpdate = (e: any) => {
      console.log('排队状态更新:', e);
      // 仅处理当前 batch
      const eventBatchId = extractBatchIdFromEvent(e);
      if (currentBatchIdRef.current && eventBatchId && eventBatchId !== currentBatchIdRef.current) {
        console.log('忽略非当前批次队列事件:', eventBatchId, '当前:', currentBatchIdRef.current);
        return;
      }
      // 若已经完成，忽略后续队列广播，避免 UI 回退
      if (faceSwapStatusRef.current === 'completed') {
        return;
      }
      const qpMerged =
        e?.preview_pending ??
        e?.data?.preview_pending ??
        e?.queue?.preview_pending ??
        e?.data?.queue?.preview_pending;
      if (qpMerged !== undefined && qpMerged !== null && qpMerged !== '') {
        const qp = Math.max(0, parseInt(String(qpMerged), 10));
        if (!Number.isNaN(qp)) {
          setPreviewData((prev) => {
            if (!prev) return prev as PreviewResponse | null;
            return {
              ...prev,
              queue_info: { ...(((prev as any).queue_info) || {}), preview_pending: qp },
            } as PreviewResponse;
          });
        }
      }
      // 文档标准字段：queue_position, total_queue_length
      const position = e?.queue_position ?? e?.position ?? e?.data?.queue_position ?? e?.data?.position;
      const totalFromDoc = e?.total_queue_length ?? e?.data?.total_queue_length;
      const totalFallback = e?.total ?? e?.queue_total ?? e?.data?.total ?? e?.data?.queue_total;
      const regularLen = e?.regular_queue_length ?? e?.data?.regular_queue_length;
      const priorityLen = e?.priority_queue_length ?? e?.data?.priority_queue_length;
      const estimated = e?.estimated_wait_time ?? e?.data?.estimated_wait_time ?? e?.estimatedWaitTime ?? e?.data?.estimatedWaitTime;
      const computedTotal = (!totalFromDoc && !totalFallback && (regularLen || priorityLen))
        ? (parseInt(regularLen || '0') + parseInt(priorityLen || '0'))
        : null;
      const total = totalFromDoc ?? totalFallback ?? computedTotal;

      if (position != null && total != null) {
        console.log(`设置排队状态: 第${position}/${total}位`);
        setQueueStatus({
          position: parseInt(position),
          total: parseInt(total),
          estimatedWaitSeconds: estimated != null ? parseInt(estimated) : undefined
        });
      } else {
        console.log('排队状态数据格式不匹配:', e);
      }
    };

    // 订阅用户私有频道 - 监听换脸事件
    console.log('订阅用户频道:', userChannelName);
    userChannel.listen('.face-swap.task.completed', onTaskCompleted);
    userChannel.listen('face-swap.task.completed', onTaskCompleted);
    userChannel.listen('.face-swap.batch.completed', onBatchCompleted);
    userChannel.listen('face-swap.batch.completed', onBatchCompleted);
    userChannel.listen('.face-swap.task.failed', onTaskFailed);
    userChannel.listen('face-swap.task.failed', onTaskFailed);
    // 队列状态也会广播到用户频道
    userChannel.listen('.face-swap.queue-status', onQueueStatusUpdate);
    userChannel.listen('face-swap.queue-status', onQueueStatusUpdate);

    // 订阅排队状态频道 - 优先使用文档标准事件名
    console.log('订阅排队状态频道:', queueChannelName);
    queueChannel.listen('.face-swap.queue-status', onQueueStatusUpdate);

    // 新增：显式监听 face-swap.* 标准事件名

    // 可选：全局事件调试（用于定位后端实际事件名）
    const echoDebug = process.env.NEXT_PUBLIC_ECHO_DEBUG === 'true';
    let unbindUserGlobal: (() => void) | null = null;
    let unbindQueueGlobal: (() => void) | null = null;
    if (echoDebug) {
      try {
        const connector: any = (echo as any).connector;
        const pusher = connector?.pusher;
        // 绑定 user.* 全局事件
        const pusherUser = pusher?.channel(userChannelName) || pusher?.subscribe?.(userChannelName);
        const onUserAny = (eventName: string, data: any) => {
          console.log(`[WS][${userChannelName}] ${eventName}:`, data);
          // 若事件包含换脸结果，尝试同样的更新逻辑
          if (data) {
            const completedPageId = data?.page_id || data?.result?.page_id || data?.task?.page_id;
            const completedUrl = data?.result?.standard_url || data?.result?.url || data?.result?.image_url;
            if (completedPageId && completedUrl) {
              onTaskCompleted(data);
            }
          }
        };
        if (pusherUser?.bind_global) {
          pusherUser.bind_global(onUserAny);
          unbindUserGlobal = () => pusherUser.unbind_global(onUserAny);
        }

        // 移除与 queue.status.{userId} 相关的调试绑定
      } catch (e) {
        console.warn('启用全局事件调试失败:', e);
      }
    }

    return () => {
      // 清理事件监听器
      if (unbindUserGlobal) unbindUserGlobal();
      // 清理排队状态
      setQueueStatus(null);
    };
  }, [echo, user?.id]);

  // 获取书籍基本信息及 pages（用于定位 has_replaceable_text==2 的页）
  const fetchBookInfo = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingBookInfo(true);
      
      const response = await api.get<ApiResponse<DetailedBook>>(`/products/${bookId}`, { params: { language: (searchParams.get('lang') || 'en') } });
      
      if (response.success) {
        const bookData = (response as any)?.data?.data || response.data || response;
        setBookInfo(bookData);
        // 记录预览页数量
        try {
          const count = Number(bookData?.preview_pages_count);
          if (!Number.isNaN(count) && count > 0) setPreviewPagesCount(count);
        } catch {}
        // 记录有可替换文本（2）的页ID集合，供预览渲染时判断
        try {
          const pages: any[] = bookData?.pages || [];
          const targets = pages.filter((p: any) => Number(p?.has_replaceable_text) === 2);
          const ids = targets.map((p: any) => Number(p.id)).filter((n: number) => !Number.isNaN(n));
          const nums = targets.map((p: any) => Number(p.page_number)).filter((n: number) => !Number.isNaN(n));
          setReplaceableTextPageIds(new Set(ids));
          setReplaceableTextPageNumbers(new Set(nums));
        } catch {}
        console.log('书籍信息获取成功:', bookData);
      } else {
        console.error('获取书籍信息失败:', response);
      }
    } catch (error: any) {
      console.error('获取书籍信息失败:', error);
    } finally {
      setIsLoadingBookInfo(false);
    }
  }, [searchParams]);

  // 在组件加载时获取 options
  useEffect(() => {
    const bookId = searchParams.get('bookid');
    if (bookId) {
      fetchBookInfo();
      fetchBookOptions();
    }
  }, [searchParams.get('bookid'), fetchBookInfo]);



  // 占位数组移除，使用 API 返回的 binding_options 与 gift_box_options

  const isMomBook = (searchParams.get('bookid') || '').toUpperCase() === 'PICBOOK_MOM';
  const hasMomCompositePages = useMemo(
    () => isMomBook,
    [isMomBook],
  );
  const isMomDrawingCompleted = useMemo(() => {
    if (!isMomBook || !hasMomCompositePages) return false;
    const pages = (previewData as MomCompositePreviewData | null)?.preview_data || [];
    const targetCodes = new Set(
      pages
        .map((p) => toMomCompositeUploadPageCode(p?.page_code))
        .filter((code): code is 'p5-6' | 'p27-28' => Boolean(code)),
    );
    if (targetCodes.size === 0) return false;
    return Array.from(targetCodes).every((code) => uploadedMomDrawingPageCodes.has(code));
  }, [hasMomCompositePages, isMomBook, previewData?.preview_data, uploadedMomDrawingPageCodes]);

  // 定义侧边栏各项，并为每个项配置默认图标和完成后的图标
  const sidebarItemsAll = [
    { id: "giver", label: "Name on Book", 
      icon: 
        <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.8188 13.2969C18.0788 14.3398 18.0788 15.2523 17.6888 16.2952C17.4289 17.3381 16.909 18.2506 16.1291 18.9025C15.7392 19.2935 15.3492 19.5543 14.8293 19.815C14.3094 20.0757 13.7895 20.3364 13.1396 20.4668C12.6197 20.5972 11.9698 20.7275 11.3199 20.7275H8.20039V12.3844C7.29054 12.254 6.51066 12.1236 5.86077 11.7326C5.34085 11.4718 4.82094 11.0808 4.30102 10.6897C3.78111 10.2986 3.39117 9.77713 3.13121 9.25569C2.74128 8.73424 2.48132 8.08243 2.35134 7.43062C2.22136 6.77881 2.09138 6.127 2.09138 5.47519C2.09138 4.56266 2.22136 3.65013 2.6113 2.7376C3.26119 2.86796 3.91109 3.12868 4.56098 3.51977C5.21088 3.91085 5.73079 4.30194 6.12073 4.82339C6.25071 3.78049 6.64064 2.86796 7.16056 2.08579C7.68047 1.30362 8.33037 0.521447 9.11024 0C9.89011 0.521447 10.67 1.30362 11.1899 2.08579C11.7098 2.99832 11.9698 3.91085 12.0998 4.95375C12.6197 4.4323 13.1396 4.04121 13.6595 3.65013C14.3094 3.25904 14.9593 2.99832 15.6092 2.86796C15.9991 3.65013 16.1291 4.56266 16.1291 5.47519C16.1291 6.127 15.9991 6.77881 15.8691 7.43062C15.7392 8.08243 15.4792 8.60388 15.0893 9.25569C14.6993 9.77713 14.3094 10.2986 13.9195 10.6897C13.3995 11.0808 12.8796 11.4718 12.3597 11.7326C11.9698 11.9933 11.5798 12.1236 11.0599 12.254C10.67 12.3844 10.1501 12.5147 9.76014 12.5147V18.5114C9.89011 17.8596 10.1501 17.3381 10.54 16.8167C10.9299 16.2952 11.3199 15.7738 11.8398 15.2523C12.2297 14.8612 12.6197 14.4702 13.1396 14.2094C13.6595 13.9487 14.1794 13.688 14.6993 13.5576L16.2591 13.1665C16.779 13.1665 17.2989 13.2969 17.8188 13.2969ZM0.141699 13.2969C1.18153 13.0362 2.22136 13.1665 3.13121 13.4273C4.17104 13.688 5.0809 14.2094 5.86077 14.9916C6.25071 15.3827 6.51066 15.7738 6.77062 16.2952C7.03058 16.8167 7.29054 17.2078 7.42052 17.7292C7.55049 18.2506 7.68047 18.7721 7.68047 19.2935C7.68047 19.815 7.68047 20.3364 7.55049 20.8579C6.51066 21.1186 5.60081 20.9882 4.56098 20.7275C3.52115 20.3364 2.6113 19.815 1.83142 19.0328C1.05155 18.2506 0.531636 17.3381 0.271678 16.4256C0.0117201 15.3827 -0.118259 14.3398 0.141699 13.2969Z" fill="currentColor"/>
        </svg>
    },
    { id: "dedication", label: "Your Special Message", 
      icon: 
        <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.8188 13.2969C18.0788 14.3398 18.0788 15.2523 17.6888 16.2952C17.4289 17.3381 16.909 18.2506 16.1291 18.9025C15.7392 19.2935 15.3492 19.5543 14.8293 19.815C14.3094 20.0757 13.7895 20.3364 13.1396 20.4668C12.6197 20.5972 11.9698 20.7275 11.3199 20.7275H8.20039V12.3844C7.29054 12.254 6.51066 12.1236 5.86077 11.7326C5.34085 11.4718 4.82094 11.0808 4.30102 10.6897C3.78111 10.2986 3.39117 9.77713 3.13121 9.25569C2.74128 8.73424 2.48132 8.08243 2.35134 7.43062C2.22136 6.77881 2.09138 6.127 2.09138 5.47519C2.09138 4.56266 2.22136 3.65013 2.6113 2.7376C3.26119 2.86796 3.91109 3.12868 4.56098 3.51977C5.21088 3.91085 5.73079 4.30194 6.12073 4.82339C6.25071 3.78049 6.64064 2.86796 7.16056 2.08579C7.68047 1.30362 8.33037 0.521447 9.11024 0C9.89011 0.521447 10.67 1.30362 11.1899 2.08579C11.7098 2.99832 11.9698 3.91085 12.0998 4.95375C12.6197 4.4323 13.1396 4.04121 13.6595 3.65013C14.3094 3.25904 14.9593 2.99832 15.6092 2.86796C15.9991 3.65013 16.1291 4.56266 16.1291 5.47519C16.1291 6.127 15.9991 6.77881 15.8691 7.43062C15.7392 8.08243 15.4792 8.60388 15.0893 9.25569C14.6993 9.77713 14.3094 10.2986 13.9195 10.6897C13.3995 11.0808 12.8796 11.4718 12.3597 11.7326C11.9698 11.9933 11.5798 12.1236 11.0599 12.254C10.67 12.3844 10.1501 12.5147 9.76014 12.5147V18.5114C9.89011 17.8596 10.1501 17.3381 10.54 16.8167C10.9299 16.2952 11.3199 15.7738 11.8398 15.2523C12.2297 14.8612 12.6197 14.4702 13.1396 14.2094C13.6595 13.9487 14.1794 13.688 14.6993 13.5576L16.2591 13.1665C16.779 13.1665 17.2989 13.2969 17.8188 13.2969ZM0.141699 13.2969C1.18153 13.0362 2.22136 13.1665 3.13121 13.4273C4.17104 13.688 5.0809 14.2094 5.86077 14.9916C6.25071 15.3827 6.51066 15.7738 6.77062 16.2952C7.03058 16.8167 7.29054 17.2078 7.42052 17.7292C7.55049 18.2506 7.68047 18.7721 7.68047 19.2935C7.68047 19.815 7.68047 20.3364 7.55049 20.8579C6.51066 21.1186 5.60081 20.9882 4.56098 20.7275C3.52115 20.3364 2.6113 19.815 1.83142 19.0328C1.05155 18.2506 0.531636 17.3381 0.271678 16.4256C0.0117201 15.3827 -0.118259 14.3398 0.141699 13.2969Z" fill="currentColor"/>
        </svg>
    },
    ...(hasMomCompositePages ? [{
      id: "momDrawing",
      label: "Your Drawing (optional)",
      icon:
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.9 1.4a2.6 2.6 0 0 1 3.7 3.7L7.1 16.6 2 18l1.4-5.1L14.9 1.4Zm2.1 1.5a.55.55 0 0 0-.78 0L5.2 13.92l-.48 1.76 1.76-.48L17.5 4.18a.55.55 0 0 0 0-.78l-.5-.5ZM2 3.5A1.5 1.5 0 0 1 3.5 2H10a1 1 0 1 1 0 2H4v12h12v-6a1 1 0 1 1 2 0v6.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-13Z" fill="currentColor"/>
        </svg>
    }] : []),
    {
      id: "coverDesign",
      label: "Cover Design",
      icon: 
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.1727 3.36602C18.1727 2.94414 18.5149 2.60195 18.9368 2.60195C19.3586 2.60195 19.7008 2.94414 19.7008 3.36602V19.498C19.7008 20.5973 18.8102 21.4879 17.711 21.4879H2.2938C1.19458 21.4879 0.303955 20.5973 0.303955 19.498V1.72539C0.303955 1.05039 0.852393 0.501953 1.52739 0.501953H15.7211C16.3961 0.501953 16.9446 1.04805 16.9446 1.72539V14.6113C16.9446 15.2863 16.3985 15.8348 15.7211 15.8348H3.05786C2.38286 15.8348 1.83442 16.3809 1.83442 17.0582V18.7316C1.83442 19.4066 2.38286 19.9551 3.05786 19.9551H16.9493C17.6243 19.9551 18.1727 19.4066 18.1727 18.7316V3.36602ZM2.91956 17.7621C2.91956 17.3402 3.26174 16.998 3.68362 16.998H16.0539C16.4758 16.998 16.818 17.3402 16.818 17.7621C16.818 18.184 16.4758 18.5262 16.0539 18.5262H3.68362C3.26174 18.5262 2.91956 18.184 2.91956 17.7621Z" fill="currentColor"/>
        </svg>
    },
    { id: "binding", label: "Book Format", 
      icon: 
        <svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.65002 0.5H16.95C17.85 0.5 18.6 1.1 18.3 1.85V13.65C18.3 14.55 17.7 15.15 16.8 15.15H14.25C13.5 15.15 12.75 15.9 12.75 16.65V19.8C12.75 20.7 12.15 21.3 11.25 21.3H1.65002C0.900024 21.3 0.150024 20.55 0.150024 19.8V2C0.150024 1.1 0.750024 0.5 1.65002 0.5ZM11.25 13.55C11.7 13.55 12 13.25 12 12.8C12 12.2 11.7 11.9 11.25 11.9H4.50002C4.05002 11.9 3.75002 12.2 3.75002 12.65V12.8C3.75002 13.25 4.05002 13.55 4.50002 13.55H11.25ZM14.55 9.5C15 9.5 15.3 9.2 15.3 8.75C15.3 8.15 15 7.85 14.4 7.85H4.35002C3.90002 7.85 3.60002 8.15 3.60002 8.6V8.75C3.60002 9.05 4.05002 9.35 4.50002 9.5H14.55ZM14.55 5.45C15 5.45 15.3 5.15 15.3 4.7C15.3 4.1 15 3.8 14.55 3.8H4.50002C4.05002 3.8 3.75002 4.1 3.75002 4.55V4.7C3.75002 5.15 4.05002 5.45 4.50002 5.45H14.55ZM13.8 19.7998V17.6998C13.8 16.7998 14.55 16.0498 15.45 16.0498H17.55C18.3 16.0498 18.6 16.9498 18.15 17.3998L15.15 20.3998C14.7 20.8498 13.8 20.5498 13.8 19.7998Z" fill="currentColor"/>
        </svg>
    },
    { id: "giftBox", label: "Add Extras", 
      icon: 
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.2313 3.77614C12.8615 4.14596 12.5157 4.36523 12.207 4.52123H11.2677C11.3037 4.18196 11.5622 3.51214 12.2648 2.80851C13.2008 1.87469 14.0757 1.71978 14.1968 1.84305C14.3168 1.96305 14.1662 2.84014 13.2313 3.77614ZM7.82477 4.52123C7.44529 4.33087 7.0996 4.07953 6.8015 3.77723C5.8655 2.84014 5.71604 1.96523 5.83604 1.84414C5.85895 1.82232 5.90804 1.80923 5.97786 1.80923C6.28768 1.80923 7.00768 2.05032 7.76804 2.81069C8.4695 3.51214 8.72804 4.17978 8.76404 4.52123H7.82477ZM9.3335 9.98451V19.5452H3.18732C2.84901 19.5459 2.52254 19.4207 2.27134 19.1941C2.02014 18.9675 1.86215 18.6556 1.82804 18.3191L1.8215 18.1794V9.98451H9.3335ZM18.2102 9.98451V18.1794C18.2105 18.3589 18.1754 18.5366 18.1068 18.7024C18.0383 18.8683 17.9377 19.019 17.8108 19.1458C17.6839 19.2727 17.5333 19.3733 17.3674 19.4419C17.2016 19.5104 17.0238 19.5455 16.8444 19.5452H10.6993V9.98451H18.2102ZM15.1633 0.877598C15.9106 1.62705 15.628 3.05942 14.5459 4.34669L14.3931 4.52123H18.2113C18.9182 4.52123 19.4997 5.05796 19.5706 5.74742L19.5771 5.88705V7.25287C19.5771 7.96196 19.0393 8.54233 18.351 8.61214L18.2113 8.61869H10.6993V4.52123H9.33459V8.61869H1.82041C1.48224 8.61884 1.15604 8.49353 0.904944 8.26702C0.653847 8.04051 0.495708 7.7289 0.461135 7.39251L0.45459 7.25287V5.88705C0.45459 5.17905 0.992408 4.59869 1.68077 4.52887L1.82041 4.52123H5.63859C4.42986 3.19032 4.08732 1.66196 4.8695 0.879779C5.69314 0.0506884 7.35677 0.468507 8.7335 1.84523C9.39568 2.50851 9.82986 3.23723 10.0153 3.90705C10.2008 3.23723 10.6339 2.50851 11.2982 1.84523C12.675 0.466325 14.3397 0.0539614 15.1622 0.878689L15.1633 0.877598Z" fill="currentColor"/>
        </svg>
    },
  ];

  // 圣诞 bundle：不展示 Options 相关的侧边栏信息与状态（Cover Design / Book Format / Add Extras）
  const sidebarItems = isHideOptions
    ? sidebarItemsAll.filter((it) => it.id === 'giver' || it.id === 'dedication' || it.id === 'momDrawing')
    : sidebarItemsAll;

  // 为每个部分创建 ref（用于滚动定位）
  const giverRef = useRef<HTMLDivElement>(null);
  const dedicationRef = useRef<HTMLDivElement>(null);
  const momDrawingRef = useRef<HTMLDivElement>(null);
  const coverDesignRef = useRef<HTMLDivElement>(null);
  const bindingRef = useRef<HTMLDivElement>(null);
  const giftBoxRef = useRef<HTMLDivElement>(null);
  // 封面 R2 URL 构建缓存：避免在 render 中对每个 option 重复计算/重复打 log
  const coverR2UrlsCacheRef = useRef<Map<string, any>>(new Map());
  // 显式打开调试：在 URL 上加 ?debugCoverR2=1
  const debugCoverR2 = process.env.NODE_ENV === 'development' && searchParams.get('debugCoverR2') === '1';

  // 监听 URL tab 参数，跳转到指定部分
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!hideOthers && (tabParam === 'giftOptions' || tabParam === 'options')) {
      setActiveTab('Others');
      setActiveSection('coverDesign');
      return;
    }
    if (!hideOthers && (tabParam === 'giftBox' || tabParam === 'addons')) {
      setActiveTab('Others');
      // 延迟滚动以确保 DOM 渲染
      setTimeout(() => {
        if (giftBoxRef.current) {
          giftBoxRef.current.scrollIntoView({ behavior: "smooth" });
          setActiveSection('giftBox');
        }
      }, 300);
    }
  }, [hideOthers, searchParams, setActiveTab, setActiveSection]);
  
  // 构建图片URL的辅助函数（移除 public/ 前缀，优先使用站内相对路径）
  const buildImageUrl = (imagePath: string) => {
    if (!imagePath) return '/imgs/picbook/goodnight/封面1.jpg';
    if (imagePath.startsWith('http')) {
      try {
        return encodeURI(imagePath);
      } catch {
        return imagePath;
      }
    }
    let normalized = imagePath.trim();
    if (normalized.startsWith('/public/')) {
      normalized = normalized.replace(/^\/public\//, '/');
    } else if (normalized.startsWith('public/')) {
      normalized = normalized.replace(/^public\//, '');
      if (!normalized.startsWith('/')) normalized = '/' + normalized;
    }
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    return normalized;
  };

  const buildCoverR2Urls = (rawBookId: string | null, option: CoverOption) => {
    const baseDomain = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks';
    if (!rawBookId) {
      return null;
    }
    let normalizedBookId = String(rawBookId).trim();
    if (normalizedBookId === 'PICBOOK_GOODNIGHT3') {
      normalizedBookId = 'PICBOOK_GOODNIGHT';
    }

    const rawCoverKey = option.option_key || String(option.id);
    const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(option.id);

    const isBirthdaySeasonalCover =
      normalizedBookId === 'PICBOOK_BIRTHDAY' && (coverId === '1' || coverId === '2');

    let birthdaySeason: ReturnType<typeof getBirthdayCoverSeasonFromCharacterLike> | null = null;
    if (isBirthdaySeasonalCover) {
      try {
        let ch: any = null;
        const store = usePreviewStore.getState().userData as any;
        if (store?.characters?.[0]) ch = store.characters[0];
        if (!ch) {
          const ls = localStorage.getItem('previewUserData');
          if (ls) ch = JSON.parse(ls)?.characters?.[0];
        }
        birthdaySeason = getBirthdayCoverSeasonFromCharacterLike(ch);
      } catch {
        birthdaySeason = 'spring';
      }
    }

    const folder = `${baseDomain}/${encodeURIComponent(normalizedBookId)}/covers/cover_${encodeURIComponent(coverId)}`;
    const cropRightHalf = ['1', '2', '3', '4'].includes(coverId);

    const cacheKey = `${normalizedBookId}_${coverId}_${birthdaySeason ?? 'base'}`;
    const cached = coverR2UrlsCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const baseFile = birthdaySeason ? `${birthdaySeason}.webp` : 'base.webp';
    const base = `${folder}/${baseFile}`;
    const canvasBase =
      birthdaySeason != null
        ? `/api/cover-base-image/${encodeURIComponent(normalizedBookId)}/${encodeURIComponent(
            coverId,
          )}?season=${encodeURIComponent(birthdaySeason)}`
        : `/api/cover-base-image/${encodeURIComponent(normalizedBookId)}/${encodeURIComponent(coverId)}`;

    const result = {
      key: cacheKey,
      base,
      canvasBase,
      cropRightHalf,
    };
    coverR2UrlsCacheRef.current.set(cacheKey, result);

    if (debugCoverR2) {
      console.log('[buildCoverR2Urls]', {
        rawBookId,
        normalizedBookId,
        coverId,
        base,
        birthdaySeason,
        optionKey: option.option_key,
        optionImageUrl: option.image_url,
      });
    }

    return result;
  };

  // 计算 cover_1 的真实宽高比，用于 cover_3/4 缩略图容器固定同高
  useEffect(() => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) return;
      if (!bookOptions?.cover_options || bookOptions.cover_options.length === 0) return;

      // 找 cover_1（兼容 option_key / id）
      const cover1 =
        bookOptions.cover_options.find((o) => String(o.option_key || '').toLowerCase().includes('cover_1')) ||
        bookOptions.cover_options.find((o) => String(o.option_key || '') === '1') ||
        bookOptions.cover_options.find((o) => String(o.id) === '1') ||
        null;
      if (!cover1) return;

      const urls = buildCoverR2Urls(bookId, cover1);
      const src = urls?.canvasBase || urls?.base;
      if (!src) return;

      let cancelled = false;
      const img = new (window as any).Image();
      img.onload = () => {
        if (cancelled) return;
        const w = Number(img.naturalWidth || img.width || 0);
        const h = Number(img.naturalHeight || img.height || 0);
        if (!w || !h) return;
        const ratio = w / h;
        if (!Number.isFinite(ratio) || ratio <= 0) return;
        setCoverThumbAspectRatio(ratio);
      };
      img.onerror = () => {};
      img.src = src;

      return () => {
        cancelled = true;
      };
    } catch {
      // ignore
    }
  }, [bookOptions?.cover_options, searchParams, previewStoreUserData]);

  // 为装订方式构建 Cloudflare R2 图片 URL（hardcover / softcover / premium）
  const buildBindingImageUrl = (option: BindingOption) => {
    const baseDomain = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/product-options/covers';
    const rawKey = String(option.option_key || option.option_type || option.name || '').toLowerCase();

    // 先检查 premium（因为 premium_hardcover 同时包含 premium 和 hard，需要优先匹配 premium）
    if (rawKey.includes('premium')) {
      // 高级版
      return `${baseDomain}/premium.webp`;
    }
    if (rawKey.includes('hard')) {
      // 精装
      return `${baseDomain}/hardcover.webp`;
    }
    if (rawKey.includes('soft') || rawKey.includes('paper')) {
      // 软封 / 平装
      return `${baseDomain}/softcover.webp`;
    }

    // 兜底：保持之前行为
    if (option.image_url && option.image_url.startsWith('http')) {
      return option.image_url;
    }
    return '/format.png';
  };

  // 获取gift box的默认图片URL
  const getGiftBoxImageUrl = (option: GiftBoxOption): string => {
    // 如果已有有效的图片URL，直接使用
    if (option.image_url && option.image_url.startsWith('http')) {
      return option.image_url;
    }
    
    // 根据option_key或name判断是premium还是standard
    const key = (option.option_key || option.name || '').toLowerCase();
    if (key.includes('premium')) {
      return 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/product-options/gift-box/premium.png';
    }
    
    // 默认为standard
    return 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/product-options/gift-box/standard.png';
  };

  // gift box 名称：去掉 "(Included)" / "(+$xx.xx)" 等后缀
  const getGiftBoxDisplayName = (raw: string) => {
    return String(raw || '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 价格展示：0 显示为 Free
  const formatOptionPrice = (price: number | null | undefined, currency?: string) => {
    if (price == null) return null;
    const n = Number(price);
    if (!Number.isFinite(n)) return null;
    if (n === 0) return 'Free';
    const num = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    return `$${num}${currency ? ` ${currency}` : ''}`;
  };

  // 解析后端可能返回的价格字符串（如 "$29.99" / "29.99" / "USD 29.99"）
  const parseMoney = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const s = String(v);
    // 提取第一个数字（包含小数）
    const m = s.match(/(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  };

  // 获取绘本本身的“基础价格”（不同接口字段不完全一致，这里做多路径兜底）
  const getBookBasePrice = (): number => {
    if (!bookInfo) return 0;
    const anyInfo: any = bookInfo as any;
    return (
      parseMoney(anyInfo?.price) ||
      parseMoney(anyInfo?.variant?.price) ||
      parseMoney(anyInfo?.current_price) ||
      parseMoney(anyInfo?.base_price) ||
      parseMoney(anyInfo?.market_price) ||
      0
    );
  };

  // 确保人脸图片为绝对可访问地址（优先 S3 全路径），并移除 public/ 前缀
  const ensureFaceImageUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith('http')) return path;
    let normalized = path.trim();
    if (normalized.startsWith('/public/')) {
      normalized = normalized.replace(/^\/public\//, '/');
    } else if (normalized.startsWith('public/')) {
      normalized = normalized.replace(/^public\//, '');
      if (!normalized.startsWith('/')) normalized = '/' + normalized;
    }
    const cleanPath = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    if (cleanPath.startsWith('user_uploads/')) {
      return `https://s3-pro-dre002.s3.us-east-1.amazonaws.com/${cleanPath}`;
    }
    // 其余走站内静态资源相对路径
    return normalized.startsWith('/') ? normalized : '/' + normalized;
  };

  // 归一化 WS 事件，处理字符串 payload 与 data 包裹
  const normalizeWsEvent = (raw: any): any => {
    let evt: any = raw;
    try {
      if (typeof evt === 'string') {
        evt = JSON.parse(evt);
      }
    } catch {}
    try {
      if (evt && typeof evt.data === 'string') {
        const parsed = JSON.parse(evt.data);
        evt = { ...evt, ...parsed, data: parsed };
      }
    } catch {}
    return evt;
  };

  // 从事件或结果对象中提取最佳图片 URL（兼容多种字段名）
  const extractImageUrlFromEvent = (evt: any): string | undefined => {
    const e = normalizeWsEvent(evt);
    const r = e?.result ?? e?.data ?? e;
    return (
      r?.standard_url ||
      r?.url ||
      r?.image_url ||
      e?.result_image_url ||
      r?.result_image_url ||
      r?.low_res_url ||
      e?.low_res_url ||
      r?.high_res_url ||
      e?.high_res_url
    );
  };
  // 判断是否为封面页（优先使用 page_type，其次使用 page_code 前缀 cover_）
  const isCoverPage = (p: { page_code?: string; page_type?: string } | any): boolean => {
    if (!p) return false;
    if (String(p.page_type || '').toLowerCase() === 'cover') return true;
    const code = String(p.page_code || '');
    return /^cover([_-]\d+)?$/i.test(code);
  };
  // 从广播事件中提取 batch_id（兼容多种包裹层级）
  const extractBatchIdFromEvent = (evt: any): string | undefined => {
    const e = normalizeWsEvent(evt);
    return (
      e?.batch_id ||
      e?.data?.batch_id ||
      e?.task?.batch_id ||
      e?.batch?.batch_id ||
      e?.data?.batch?.batch_id
    );
  };

  // 将 GET /products/{spu}/preview 返回的数据规范为内部结构
  const normalizePreviewApi = (apiData: any): PreviewResponse => {
    const pages = Array.isArray(apiData?.preview_pages) ? apiData.preview_pages : [];
    const preview_data = pages.map((p: any, idx: number) => ({
      page_id: idx + 1,
      page_code: p?.page_code,
      page_number: p?.preview_order ?? idx + 1,
      image_url: p?.image_url,
      has_face_swap: !!p?.has_face_elements,
    }));
    return {
      preview_id: undefined as any,
      preview_data,
      status: 'completed' as any,
      batch_id: (apiData as any)?.batch_id,
    } as unknown as PreviewResponse;
  };

  // 批次轮询（作为 WS 以外的兜底）
  const batchPollTimerRef = useRef<any>(null);
  const clearBatchPolling = () => {
    if (batchPollTimerRef.current) {
      clearInterval(batchPollTimerRef.current);
      batchPollTimerRef.current = null;
    }
  };
  const startBatchPolling = (spuCode: string, batchId: string) => {
    clearBatchPolling();
    console.log('[Polling] Starting batch polling:', { spuCode, batchId });
    batchPollTimerRef.current = window.setInterval(async () => {
      try {
        const path = `/products/${spuCode}/preview/batches/${batchId}`;
        // 客户端强制走同域 /api 代理
        const url = path;
        console.log('[Polling] Fetching:', url);
        const res = await api.get(url) as ApiResponse<any>;
        console.log('[Polling] Response:', res);
        const batch = (res as any)?.data?.batch;
        if (batch) {
          // 从最新的 batch 中获取 recipient_name 并更新
          // 注意：如果是从 personalized-product 进入的（store 中有数据），不覆盖 store 中的名字
          const storeUserData = usePreviewStore.getState().userData as any;
          const storeName = storeUserData?.characters?.[0]?.full_name;
          
          // 只有在 store 中没有名字时，才从 batch 更新
          if (!storeName || !storeName.trim()) {
            const recipientName = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name;
            if (recipientName && typeof recipientName === 'string' && recipientName.trim()) {
              setRecipient(recipientName);
              console.log('[Polling] Updated recipient from batch:', recipientName);
            }
          }
        }
        if (batch?.pages) {
          // 若后端提供了标准频道名，记录并进行订阅
          try {
            const channelName = batch?.channel;
            if (channelName && channelName !== previewChannelNameRef.current) {
              previewChannelNameRef.current = channelName;
              subscribeToPreviewChannel(spuCode, batchId);
            }
          } catch {}
          // 更新队列状态：从batch.queue和pages中提取
          try {
            const queue = batch.queue;
            const firstProcessingPage = batch.pages.find((p: any) => p.status === 'processing' && p.queue_position);
            if (queue && firstProcessingPage) {
              const totalQueue = (queue.preview_pending || 0) + (queue.high_priority_pending || 0);
              setQueueStatus({
                position: firstProcessingPage.queue_position,
                total: totalQueue || firstProcessingPage.queue_total,
              });
            } else if (batch.status === 'completed') {
              setQueueStatus(null);
            }
          } catch {}
          setPreviewData((prev) => {
            // 若 prev 为空，从 batch.pages 直接构造初始数据
            if (!prev || !prev.preview_data || prev.preview_data.length === 0) {
              console.log('[Polling] Initializing previewData from batch.pages:', batch.pages.length, 'pages');
              const initialData = {
                preview_id: undefined as any,
                preview_data: batch.pages.map((bp: any, idx: number) => ({
                  page_id: idx + 1,
                  page_code: bp.page_code,
                  page_number: bp.sort_order ?? idx + 1,
                  raw_image_url: bp.image_url,
                  base_stage_url: bp.base_stage_url,
                  final_stage_url: bp.final_stage_url,
                  giver_data: bp.giver_data,
                  template_image_url: bp.template_image_url || bp.template_url,
                  image_url: bp.final_image_url || bp.base_image_url || bp.image_url,
                  has_face_swap: !!bp.has_face_elements,
                  // 保存关键状态字段供UI使用
                  status: bp.status,
                  base_image_url: bp.base_image_url,
                  final_image_url: bp.final_image_url,
                  base_only: bp.base_only,
                  queue_position: bp.queue_position,
                  queue_total: bp.queue_total,
                })),
                status: batch.status || 'processing',
                batch_id: batch.batch_id,
                // 保存batch级别的队列信息
                queue_info: batch.queue,
                batch_options: batch.options ?? null,
              } as any;
              console.log('[Polling] Created preview_data with', initialData.preview_data.length, 'pages');
              console.log('[Polling] Sample page:', initialData.preview_data[0]);
              return initialData;
            }
            // 如果preview_data存在但为空，也尝试从batch初始化
            if (prev && prev.preview_data && prev.preview_data.length === 0 && batch.pages && batch.pages.length > 0) {
              console.log('[Polling] Existing previewData is empty, reinitializing from batch.pages:', batch.pages.length, 'pages');
              const reinitData = {
                ...prev,
                preview_data: batch.pages.map((bp: any, idx: number) => ({
                  page_id: idx + 1,
                  page_code: bp.page_code,
                  page_number: bp.sort_order ?? idx + 1,
                  raw_image_url: bp.image_url,
                  base_stage_url: bp.base_stage_url,
                  final_stage_url: bp.final_stage_url,
                  giver_data: bp.giver_data,
                  template_image_url: bp.template_image_url || bp.template_url,
                  image_url: bp.final_image_url || bp.base_image_url || bp.image_url,
                  has_face_swap: !!bp.has_face_elements,
                  status: bp.status,
                  base_image_url: bp.base_image_url,
                  final_image_url: bp.final_image_url,
                  base_only: bp.base_only,
                  queue_position: bp.queue_position,
                  queue_total: bp.queue_total,
                })),
                status: batch.status || 'processing',
                batch_id: batch.batch_id,
                queue_info: batch.queue,
                batch_options: batch.options ?? (prev as any)?.batch_options ?? null,
              } as any;
              console.log('[Polling] Reinitialized preview_data with', reinitData.preview_data.length, 'pages');
              return reinitData;
            }
            // 否则：全量覆盖，基于 batch.pages 重建 preview_data，确保显示所有页面
            console.log('[Polling] Rebuilding preview_data from batch.pages');
            const nextPreviewData = (batch.pages || []).map((bp: any, idx: number) => ({
              page_id: idx + 1,
              page_code: bp.page_code,
              page_number: ((bp.sort_order != null ? Number(bp.sort_order) : idx) + 1),
              raw_image_url: bp.image_url,
              base_stage_url: bp.base_stage_url,
              final_stage_url: bp.final_stage_url,
              giver_data: bp.giver_data,
              template_image_url: bp.template_image_url || bp.template_url,
              image_url: bp.final_image_url || bp.base_image_url || bp.image_url,
              has_face_swap: !!bp.has_face_elements,
              status: bp.status,
              base_image_url: bp.base_image_url,
              final_image_url: bp.final_image_url,
              base_only: bp.base_only,
              queue_position: bp.queue_position,
              queue_total: bp.queue_total,
              page_type: bp.page_type,
              is_cover: isCoverPage(bp),
            }));
            return {
              ...(prev || {}),
              preview_data: nextPreviewData,
              status: batch.status || ((prev as any)?.status) || 'processing',
              batch_id: batch.batch_id,
              queue_info: batch.queue,
              batch_options: batch.options ?? (prev as any)?.batch_options ?? null,
            } as any;
          });
        }
        // 根据batch状态更新 isProcessing
        if (batch?.status === 'pending' || batch?.status === 'processing') {
          setIsProcessing(true);
        } else if (batch?.status === 'completed' || batch?.status === 'failed') {
          setIsProcessing(false);
          clearBatchPolling();
        }
      } catch (_e) {
        console.error('[Polling] Error:', _e);
      }
    }, 3000);
  };

  // 订阅预览专用频道并处理实时事件
  const subscribeToPreviewChannel = (spuCode: string, batchId: string) => {
    if (!echo) return;
    try {
      const inferred = `preview.${user?.id ? `user-${user.id}` : 'guest'}.${batchId}`;
      const channelName = previewChannelNameRef.current || inferred;
      if (subscribedPreviewChannelRef.current && subscribedPreviewChannelRef.current !== channelName) {
        try { (echo as any).leave(subscribedPreviewChannelRef.current); } catch {}
      }
      subscribedPreviewChannelRef.current = channelName;
      const ch = (echo as any).channel(channelName);
        const onPreviewPageUpdated = (data: any) => {
        console.log('[WS] PreviewPageUpdated:', data);
        const pageCode = data?.page_code;
        const imageUrl = data?.final_image_url || data?.base_image_url || data?.image_url;
        if (!pageCode || !imageUrl) return;
        setPreviewData((prev) => {
            if (!prev || !prev.preview_data) return prev as any;
            const next = {
              ...prev,
              preview_data: prev.preview_data.map((p: any) =>
                p.page_code === pageCode
                  ? { 
                      ...p, 
                      image_url: imageUrl, 
                      has_face_swap: !!data?.has_face_elements,
                      base_only: data?.base_only ?? p.base_only,
                      final_image_url: data?.final_image_url ?? p.final_image_url,
                      base_image_url: data?.base_image_url ?? p.base_image_url,
                    }
                  : p
              ),
            } as any;
            return next;
        });
      };
      const onPreviewBatchCompleted = async (_data: any) => {
        console.log('[WS] PreviewBatchCompleted:', _data);
        setIsProcessing(false);
        // 拉取最终结果，确保所有页同步
        try {
          const path = `/products/${spuCode}/preview/batches/${batchId}`;
          // 客户端强制走同域 /api 代理
          const url = path;
          const res = await api.get(url) as ApiResponse<any>;
          const batch = (res as any)?.data?.batch;
          if (batch) {
            // 从最新的 batch 中获取 recipient_name 并更新
            // 注意：如果是从 personalized-product 进入的（store 中有数据），不覆盖 store 中的名字
            const storeUserData = usePreviewStore.getState().userData as any;
            const storeName = storeUserData?.characters?.[0]?.full_name;
            
            // 只有在 store 中没有名字时，才从 batch 更新
            if (!storeName || !storeName.trim()) {
              const recipientName = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name;
              if (recipientName && typeof recipientName === 'string' && recipientName.trim()) {
                setRecipient(recipientName);
                console.log('[PreviewBatchCompleted] Updated recipient from batch:', recipientName);
              }
            }
          }
          if (batch?.pages) {
            setPreviewData((prev) => {
              // 若 prev 为空，从 batch.pages 直接构造
              if (!prev || !prev.preview_data || prev.preview_data.length === 0) {
                return {
                  preview_id: undefined as any,
                  preview_data: batch.pages.map((bp: any, idx: number) => ({
                    page_id: idx + 1,
                    page_code: bp.page_code,
                    page_number: bp.sort_order ?? idx + 1,
                    image_url: bp.final_image_url || bp.base_image_url || bp.image_url,
                    has_face_swap: !!bp.has_face_elements,
                    status: bp.status,
                    base_image_url: bp.base_image_url,
                    final_image_url: bp.final_image_url,
                    base_only: bp.base_only,
                    queue_position: bp.queue_position,
                    queue_total: bp.queue_total,
                  })),
                status: 'completed',
                batch_id: batch.batch_id,
                  queue_info: batch.queue,
                  batch_options: batch.options ?? null,
                } as any;
              }
            const updated = {
              ...prev,
              batch_options: batch.options ?? (prev as any)?.batch_options ?? null,
              preview_data: prev.preview_data.map((p: any) => {
                const match = batch.pages.find((bp: any) => bp.page_code === p.page_code);
                  if (!match) return p;
                  const newUrl = match.final_image_url || match.base_image_url;
                  return {
                    ...p,
                    image_url: newUrl,
                    has_face_swap: !!match.has_face_elements,
                    status: match.status,
                    base_image_url: match.base_image_url,
                    final_image_url: match.final_image_url,
                    base_only: match.base_only,
                    queue_position: match.queue_position,
                    queue_total: match.queue_total,
                  };
                }),
                status: 'completed',
                queue_info: batch.queue,
            } as any;
            return updated;
          });
        }
        } catch {}
          clearBatchPolling();
      };
      ch.listen('.PreviewPageUpdated', onPreviewPageUpdated);
      ch.listen('.PreviewBatchCompleted', onPreviewBatchCompleted);
    } catch {}
  };

  // 处理 NDJSON 流事件
  const handleNdjsonEvent = (chunk: any, spuCode: string) => {
    const { event, data } = chunk || {};
    if (!event) return;
    switch (event) {
      case 'accepted': {
        setIsProcessing(true);
        const bid = extractBatchIdFromEvent({ data }) || data?.batch?.batch_id;
        if (bid) {
          currentBatchIdRef.current = bid;
          setCurrentBatchId(bid);
          updatePreviewIdInUrl(bid);
          if (spuCode) startBatchPolling(spuCode, bid);
          // 订阅预览专用频道（如有）
          subscribeToPreviewChannel(spuCode, bid);
        }
        break;
      }
      case 'page': {
        const pageCode = data?.page_code;
        const imageUrl = data?.final_image_url || data?.base_image_url || data?.image_url; // 最终图优先，其次基础图
        // 提前从 page 事件推断 batch_id（若后端携带）并启动轮询/订阅
        try {
          const bid = extractBatchIdFromEvent({ data }) || data?.batch?.batch_id;
          if (bid && (!currentBatchIdRef.current || currentBatchIdRef.current !== bid)) {
            currentBatchIdRef.current = bid;
            setCurrentBatchId(bid);
            updatePreviewIdInUrl(bid);
            if (spuCode) startBatchPolling(spuCode, bid);
            subscribeToPreviewChannel(spuCode, bid);
          }
        } catch {}
        if (pageCode) {
          setPreviewData((prev) => {
            if (!prev) return prev as any;
            const next = {
              ...prev,
              preview_data: prev.preview_data.map((p: any) =>
                p.page_code === pageCode
                  ? { 
                      ...p, 
                      // 保留流事件中的原始 image_url 作为 raw_image_url（用于 p3-4 等需要“未叠字底图”的场景）
                      raw_image_url: data?.image_url ?? p.raw_image_url,
                      image_url: imageUrl || p.image_url, 
                      has_face_swap: !!data?.has_face_elements,
                      // 分层模型：后端可选返回 giver/template 信息
                      giver_data: data?.giver_data ?? p.giver_data,
                      template_image_url: (data?.template_image_url || data?.template_url) ?? p.template_image_url,
                      base_stage_url: data?.base_stage_url ?? (p as any).base_stage_url,
                      final_stage_url: data?.final_stage_url ?? (p as any).final_stage_url,
                      base_only: data?.base_only ?? p.base_only,
                      final_image_url: data?.final_image_url ?? p.final_image_url,
                      base_image_url: data?.base_image_url ?? p.base_image_url,
                    }
                  : p
              ),
            } as any;
            return next;
          });
        }
        break;
      }
      case 'completed': {
        setIsProcessing(false);
        const batchId = data?.batch?.batch_id;
        if (batchId) {
          currentBatchIdRef.current = batchId;
          startBatchPolling(spuCode, batchId);
        }
        break;
      }
      case 'error':
        setIsProcessing(false);
        break;
      default:
        break;
    }
  };

  // 启动渲染：POST /products/{spu}/preview/render 并解析 NDJSON 流
  const startNdjsonRender = async (spuCode: string, payload: any) => {
    try {
      // 客户端使用 /api 代理，服务器端使用完整 URL
      const apiBase = typeof window !== 'undefined' 
        ? '/api' 
        : getApiBaseUrl();
      const url = `${apiBase}/products/${encodeURIComponent(spuCode)}/preview/render`;
      let authHeader: string | undefined = undefined;
      try {
        const tk = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (tk) authHeader = `Bearer ${tk}`;
      } catch {}
      if (!authHeader && process.env.NEXT_PUBLIC_API_STATIC_TOKEN) {
        authHeader = `Bearer ${process.env.NEXT_PUBLIC_API_STATIC_TOKEN}`;
      }
      // Add a 3-minute timeout for the preview render request
      const controller = new AbortController();
      const timeoutMs = 3 * 60 * 1000; // 3 minutes
      const timeoutId = setTimeout(() => {
        try { controller.abort(); } catch (e) {}
      }, timeoutMs);

      let resp: Response;
      try {
        resp = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/x-ndjson',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          throw new Error('请求超时（3 分钟）');
        }
        throw err;
      } finally {
        // don't clear timeout here because we still need it until response body read completes
      }

      if (!resp.ok) {
        const text = await resp.text();
        clearTimeout(timeoutId);
        throw new Error(`请求失败 (${resp.status}): ${text}`);
      }
      const reader = resp.body?.getReader();
      if (!reader) {
        clearTimeout(timeoutId);
        throw new Error('当前环境不支持流式响应');
      }
      const decoder = new TextDecoder();
      let buffer = '';
      // 持续读取 NDJSON
      while (true) {
        // 检查是否已超时
        if (controller.signal.aborted) {
          clearTimeout(timeoutId);
          throw new Error('请求超时（3 分钟）');
        }
        const { value, done } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          let newlineIndex;
          // 逐行处理
          while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (!line) continue;
            try {
              const evt = JSON.parse(line);
              handleNdjsonEvent(evt, spuCode);
            } catch (_e) {
              // 忽略单行解析错误
            }
          }
        }
        if (done) break;
      }
      buffer = buffer.trim();
      if (buffer) {
        try {
          const evt = JSON.parse(buffer);
          handleNdjsonEvent(evt, spuCode);
        } catch (_e) {}
      }
      try {
        clearTimeout(timeoutId);
      } catch {}
    } catch (e: any) {
      console.error('预览渲染流式请求失败:', e);
    }
  };

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      clearBatchPolling();
    };
  }, []);

  // 获取预览数据
  const fetchPreviewData = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingPreview(true);
      setPreviewError(null);
      
      // 尝试从localStorage获取用户数据，用于后端验证或缓存查找
      let requestData = {};
      try {
        const storeUserData = usePreviewStore.getState().userData;
        if (storeUserData) {
          requestData = storeUserData as any;
        } else {
          const userData = localStorage.getItem('previewUserData');
          if (userData) {
            requestData = JSON.parse(userData);
          }
        }
      } catch (e) {
        console.warn('无法解析用户数据:', e);
      }
      
      // 构造API要求的请求数据格式
      const character = (requestData as any).characters?.[0];
      const faceImages = (character?.photos && Array.isArray(character.photos) && character.photos.length > 0)
        ? character.photos
        : (character?.photo ? [character.photo] : []);
      const toBackendAttrs = (c: any) => {
        // Map numeric codes or UI-values to backend strings
        const skinHexes = ['#FFE2CF', '#DCB593', '#665444'];
        const hex = c?.skinColor || c?.skin_color_hex;
        const idx = typeof hex === 'string' ? skinHexes.findIndex((h) => h === hex) : (c?.skincolor ? (Number(c.skincolor) - 1) : -1);
        const skin_tone = idx === 0 ? 'white' : idx === 2 ? 'black' : 'original';
        const hair_style = String(c?.hairstyle || c?.hair_style || '').replace('hair_', '') || String(c?.hairstyle || '1');
        const mapHairColor = (v: any) => {
          if (typeof v === 'string') {
            const s = v.toLowerCase();
            if (s === 'light') return 'blone';
            if (s === 'brown' || s === 'original') return 'original';
            if (s === 'dark' || s === 'black') return 'dark';
            return 'dark';
          }
          const n = Number(v) || 1;
          if (n === 1) return 'blone';
          if (n === 2) return 'original';
          if (n === 3) return 'dark';
          return 'dark';
        };
        const hair_color = mapHairColor(c?.hairColor || c?.haircolor);
        const rawAge = c?.attributes?.age_stage ?? c?.age_stage;
        const age_stage = mapAgeStageUiToBackend(rawAge);
        const stored = c?.attributes;
        const birthday =
          stored && typeof stored.birthday === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stored.birthday)
            ? stored.birthday
            : undefined;
        const character_traits =
          Array.isArray(stored?.character_traits) && stored.character_traits.length > 0
            ? stored.character_traits
            : undefined;
        return {
          skin_tone,
          hair_style,
          hair_color,
          ...(age_stage ? { age_stage } : {}),
          ...(birthday ? { birthday } : {}),
          ...(character_traits ? { character_traits } : {}),
        };
      };

      // gender: 后端期望字符串 boy/girl
      const mapGenderToString = (g: any): string | null => {
        if (g === 'boy' || g === 'girl') return g;
        if (g === 1 || g === '1') return 'boy';
        if (g === 2 || g === '2') return 'girl';
        const code = (character as any)?.gender_code;
        if (code === 1 || code === '1') return 'boy';
        if (code === 2 || code === '2') return 'girl';
        return null;
      };
      const genderStr = mapGenderToString(character?.gender);
      const giverNameTop = String(character?.giver_name || character?.created_by || '').trim();

      const fb = buildPicbookPreviewFacePayload(bookId, faceImages.filter(Boolean));

      const apiRequestData = {
        picbook_id: bookId,
        face_images: fb.face_images,
        full_name: character?.full_name,
        language: character?.language || 'en', // 默认英语
        gender: genderStr,
        ...(giverNameTop ? { giver_name: giverNameTop } : {}),
        skincolor: character?.skincolor || 1, // 默认值
        attributes: {
          ...toBackendAttrs(character),
          ...fb.faceAttributes,
        },
      };
      
      // 添加详细的调试日志
      console.log('调用换脸接口（无用户数据）:', {
        url: `/products/${bookId}/preview`,
        originalData: requestData,
        apiRequestData: apiRequestData,
        bookId: bookId
      });
      
      // 防抖：避免重复创建
      if (isPostingCreateRef.current || hasPostedCreateRef.current) {
        console.log('跳过重复创建（无用户数据路径）');
        return;
      }
      isPostingCreateRef.current = true;
      // 新任务启动，清空每页完成集合
      setSwappedPageIds(new Set());
      const response = await api.get(`/products/${bookId}/preview`) as ApiResponse<PreviewResponse>;
      
      if (response.success) {
        // 若后端已完成直接返回结果，直接应用
        const status = (response as any)?.data?.status;
        if (status === 'completed' && (Array.isArray((response as any)?.data?.preview_data) || Array.isArray((response as any)?.data?.result_images))) {
          const merged = applyResultImagesToPreviewData((response as any).data);
          setPreviewData(merged);
          try {
            const bid = (merged as any)?.batch_id || ((response as any)?.data as any)?.batch_id;
            if (bid) {
              currentBatchIdRef.current = bid;
              setCurrentBatchId(bid);
              const spu = String(searchParams.get('bookid') || bookId || '').toLowerCase();
              if (spu && bid) startBatchPolling(spu, bid);
            }
          } catch {}
          // 标记完成页
          const completedIds = new Set<number>();
          (merged?.preview_data || []).forEach((p: any) => {
            if (p?.has_face_swap) completedIds.add(Number(p.page_id));
          });
          setSwappedPageIds(completedIds);
        } else {
          // 如果 response.data 有 preview_data 数组，设置它；否则等待轮询填充
          console.log('[Preview] Response data structure:', {
            hasPreviewData: !!response.data?.preview_data,
            previewDataLength: response.data?.preview_data?.length,
            status: (response.data as any)?.status
          });
          
          if (response.data?.preview_data && Array.isArray(response.data.preview_data) && response.data.preview_data.length > 0) {
              setPreviewData(response.data!);
          } else {
            // 没有preview_data，只设置顶层状态与 batch_id，让轮询来填充数据
            console.log('[Preview] No preview_data in response, creating minimal structure for polling');
            setPreviewData({
              preview_id: undefined as any,
              preview_data: [],  // 空数组，等待轮询填充
              status: ((response.data as any)?.status) || 'processing',
              batch_id: (response.data as any)?.batch_id,
            } as any);
          }
          
          // 记录本次任务的 batch_id，用于筛选后续广播
          try {
            const bid = (response.data as any)?.batch_id;
            if (bid) {
              currentBatchIdRef.current = bid;
              setCurrentBatchId(bid);
              updatePreviewIdInUrl(bid);
              const spu = String(searchParams.get('bookid') || bookId || '').toLowerCase();
              if (spu && bid) {
                startBatchPolling(spu, bid);
                subscribeToPreviewChannel(spu, bid);
                // 立即从新的 batch 获取 recipient_name
                // 注意：如果是从 personalized-product 进入的（store 中有数据），不覆盖 store 中的名字
                try {
                  const storeUserData = usePreviewStore.getState().userData as any;
                  const storeName = storeUserData?.characters?.[0]?.full_name;
                  
                  // 只有在 store 中没有名字时，才从 batch 获取
                  if (!storeName || !storeName.trim()) {
                    const path = `/products/${spu}/preview/batches/${bid}`;
                    // 客户端强制走同域 /api 代理
                    const url = path;
                    api.get(url).then((res: any) => {
                      const batch = res?.data?.batch;
                      if (batch) {
                        const recipientName = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name;
                        if (recipientName && typeof recipientName === 'string' && recipientName.trim()) {
                          setRecipient(recipientName);
                          console.log('[Preview] Updated recipient from new batch:', recipientName);
                        }
                        if (batch.options) {
                          setPreviewData((p) => (p ? { ...p, batch_options: batch.options } : p));
                        }
                      }
                    }).catch(() => {});
                  }
                } catch {}
              }
            }
          } catch {}
        }
        
        // 注意：不再从 localStorage/store 获取名字，因为名字应该从最新的 batch 获取
        // 如果 batch 中没有名字，才从 store 作为兜底
        try {
          // 只有在没有从 batch 获取到名字时，才从 store 获取
          if (!recipient || recipient.trim() === '') {
            const storeUserData = usePreviewStore.getState().userData as any;
            const source = storeUserData || (() => {
              try {
                const ud = localStorage.getItem('previewUserData');
                return ud ? JSON.parse(ud) : null;
              } catch { return null; }
            })();
            if (source) {
              const character = source.characters?.[0];
              const fullName = character?.full_name || '';
              if (fullName) setRecipient(fullName);
            }
          }
        } catch (e) {
          console.warn('无法获取角色名称:', e);
        }
        
        console.log('预览数据获取成功:', response.data);
      } else {
        setPreviewError(response.message || '获取预览数据失败');
      }
      
    } catch (error: any) {
      console.error('获取预览数据失败:', {
        error: error,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      // 更详细的错误信息
      let errorMessage = '获取预览数据失败';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMessage = `服务器错误: ${error.response.status} ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPreviewError(errorMessage);
    } finally {
      hasPostedCreateRef.current = true;
      isPostingCreateRef.current = false;
      setIsLoadingPreview(false);
    }
  }, []);

  // 处理用户数据和WebSocket连接
  useEffect(() => {
    const handleUserDataProcessing = async () => {
      try {
        // 优先从内存中获取用户数据
        const storeUserData = usePreviewStore.getState().userData as any;
        const userData = storeUserData ? JSON.stringify(storeUserData) : localStorage.getItem('previewUserData');
        const bookId = searchParams.get('bookid') || localStorage.getItem('previewBookId');
        
        if (!userData || !bookId) {
          console.warn('缺少用户数据或书籍ID');
          // 仍然尝试获取预览数据
          await fetchPreviewData();
          return;
        }

        const parsedUserData = JSON.parse(userData);
        console.log('开始处理用户数据:', parsedUserData);
        const savedGiftMessage = getFirstNonEmptyString(
          parsedUserData?.characters?.[0]?.attributes?.gift_message,
          parsedUserData?.characters?.[0]?.gift_message,
        );
        if (savedGiftMessage) {
          setMessage(savedGiftMessage);
          setDedication(savedGiftMessage);
          setIsDedicationSubmitted(true);
        }

        setIsProcessing(true);
        console.log('开始处理用户数据...');

        // 避免重复处理
        if (hasProcessedUserDataRef.current) {
          console.log('跳过重复的用户数据处理');
          return;
        }
        // 调用API处理用户数据
        try {
          // 构造API要求的请求数据格式
          const character = parsedUserData.characters?.[0];
          const faceImages = (character?.photos && Array.isArray(character.photos))
            ? character.photos
            : (character?.photo ? [character.photo] : []);
          const toBackendAttrs2 = (c: any) => {
            const skinHexes = ['#FFE2CF', '#DCB593', '#665444'];
            const hex = c?.skinColor || c?.skin_color_hex;
            const idx = typeof hex === 'string' ? skinHexes.findIndex((h) => h === hex) : (c?.skincolor ? (Number(c.skincolor) - 1) : -1);
            const skin_tone = idx === 0 ? 'white' : idx === 2 ? 'black' : 'original';
            const hair_style = String(c?.hairstyle || c?.hair_style || '').replace('hair_', '') || String(c?.hairstyle || '1');
            const mapHairColor = (v: any) => {
              if (typeof v === 'string') {
                const s = v.toLowerCase();
                if (s === 'light') return 'blone';
                if (s === 'brown' || s === 'original') return 'original';
                if (s === 'dark' || s === 'black') return 'dark';
                return 'dark';
              }
              const n = Number(v) || 1;
              if (n === 1) return 'blone';
              if (n === 2) return 'original';
              if (n === 3) return 'dark';
              return 'dark';
            };
            const hair_color = mapHairColor(c?.hairColor || c?.haircolor);
            const rawAge = c?.attributes?.age_stage ?? c?.age_stage;
            const age_stage = mapAgeStageUiToBackend(rawAge);
            const stored = c?.attributes;
            const birthday =
              stored && typeof stored.birthday === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stored.birthday)
                ? stored.birthday
                : undefined;
            const character_traits =
              Array.isArray(stored?.character_traits) && stored.character_traits.length > 0
                ? stored.character_traits
                : undefined;
            return {
              skin_tone,
              hair_style,
              hair_color,
              ...(age_stage ? { age_stage } : {}),
              ...(birthday ? { birthday } : {}),
              ...(character_traits ? { character_traits } : {}),
            };
          };

          // gender & relationship: 后端期望字符串
          const mapGenderToString = (g: any, genderCode?: any): string | null => {
            if (g === 'boy' || g === 'girl') return g;
            if (g === 1 || g === '1') return 'boy';
            if (g === 2 || g === '2') return 'girl';
            if (genderCode === 1 || genderCode === '1') return 'boy';
            if (genderCode === 2 || genderCode === '2') return 'girl';
            return null;
          };
          const genderStr = mapGenderToString(character?.gender, (character as any)?.gender_code);
          const relationshipStr = character?.relationship || null;
          const giverNameTop2 = String(character?.giver_name || character?.created_by || '').trim();

          const fb = buildPicbookPreviewFacePayload(bookId, faceImages.filter(Boolean));

          const apiRequestData = {
            picbook_id: bookId,
            face_images: fb.face_images,
            full_name: character?.full_name,
            language: character?.language,
            gender: genderStr,
            relationship: relationshipStr,
            ...(giverNameTop2 ? { giver_name: giverNameTop2 } : {}),
            skincolor: character?.skincolor,
            attributes: {
              ...toBackendAttrs2(character),
              ...fb.faceAttributes,
            },
          };
          
          // 添加详细的调试日志
          console.log('调用换脸接口（有用户数据）:', {
            url: `/products/${bookId}/preview`,
            originalData: parsedUserData,
            apiRequestData: apiRequestData,
            bookId: bookId
          });
          
          if (isPostingCreateRef.current || hasPostedCreateRef.current) {
            console.log('跳过重复创建（用户数据路径）');
            return;
          }
          isPostingCreateRef.current = true;
          hasProcessedUserDataRef.current = true;
          // 新任务启动，清空每页完成集合
          setSwappedPageIds(new Set());
          // 不再预拉基础预览，直接启动 NDJSON 渲染
          startNdjsonRender(String(bookId), apiRequestData);
          setIsProcessing(true);
          
          try {
            localStorage.removeItem('previewUserData');
            localStorage.removeItem('previewBookId');
          } catch {}
          
        } catch (error: any) {
          console.error('换脸接口调用失败:', {
            error: error,
            response: error.response,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url
          });
          setIsProcessing(false);
          
          // 更详细的错误信息
          let errorMessage = '换脸处理失败';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.statusText) {
            errorMessage = `服务器错误: ${error.response.status} ${error.response.statusText}`;
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = '请求超时，请检查网络连接';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          //toast.error(errorMessage);
        } finally {
          hasPostedCreateRef.current = true;
          isPostingCreateRef.current = false;
        }

        // WebSocket 订阅逻辑在独立的 effect 中进行

      } catch (error) {
        console.error('处理用户数据时出错:', error);
        setIsProcessing(false);
      }
    };

    handleUserDataProcessing();
  }, []);

  // 点击侧边栏项，滚动到对应部分
  const scrollToSection = (sectionId: string) => {
    let ref: React.RefObject<HTMLDivElement | null> | null = null;
    switch(sectionId) {
      case "giver": ref = giverRef; break;
      case "dedication": ref = dedicationRef; break;
      case "momDrawing": ref = momDrawingRef; break;
      case "coverDesign": ref = coverDesignRef; break;
      case "binding": ref = bindingRef; break;
      case "giftBox": ref = giftBoxRef; break;
      default: break;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // 各部分的完成状态判断
  const completedSections = {
    // Name on Book：默认完成状态
    giver: true,
    // dedication：只有用户点击 Submit（或从后端/购物车回填了真实寄语）才算完成
    dedication: isDedicationSubmitted,
    momDrawing: isMomDrawingCompleted,
    coverDesign: selectedBookCover !== null,
    binding: selectedBinding !== null,
    giftBox: selectedGiftBox !== null,
  };

  // Others 标签页可选项提示文本（按需拼接 binding/cover/wrap）
  const selectableItems = [
    !completedSections.binding ? 'binding' : null,
    !completedSections.coverDesign ? 'cover' : null,
    !completedSections.giftBox ? 'wrap' : null,
  ].filter((x): x is string => Boolean(x));

  // 文案拼接工具（支持中英文）
  const buildOptions = (opts: { binding?: boolean; cover?: boolean; wrap?: boolean }, lang: 'en' | 'zh' = 'en') => {
    const mapEn = [
      opts.binding && 'binding',
      opts.cover && 'cover',
      opts.wrap && 'wrap options',
    ].filter(Boolean) as string[];

    const mapZh = [
      // 要求：binding 和 wrap 在中文环境下不翻译，保持英文
      opts.binding && 'binding',
      opts.cover && '封面',
      opts.wrap && 'wrap options',
    ].filter(Boolean) as string[];

    const items = lang === 'en' ? mapEn : mapZh;
    if (items.length === 0) return lang === 'en' ? 'options' : '选项';
    if (items.length === 1) return items[0];
    if (lang === 'en') {
      return items.slice(0, -1).join(', ') + ', and ' + items.slice(-1);
    } else {
      return items.length === 2 ? items.join(' 和 ') : items.slice(0, -1).join('、') + ' 和 ' + items.slice(-1);
    }
  };

  // 点击 Continue 按钮处理：添加到购物车
  const handleContinue = async () => {
    try {
      console.debug('[AddToCart] Clicked');
      const fromCartItemId = searchParams.get('fromCartItemId');

      // 无论是否来自 personalized-products（fromCartItemId），Dedication 都必须 Submit 才允许继续。
      // 这样不会因为默认寄语展示而误导用户跳过提交。
      if (!completedSections.dedication) {
        setActiveTab("Book preview");
        setTimeout(() => {
          scrollToSection('dedication');
        }, 100);
        console.warn('[AddToCart] Blocked: dedication not submitted');
        return;
      }

      // 圣诞 bundle：不新增 SKU，改用 regenerate-preview 更新 bundle 内部子项，然后回购物车
      if (fromCartItemId && isHideOptions) {
        // 圣诞 bundle 的 Next 也需要 loading（防止重复点击/重复触发 regenerate-preview）
        setIsAddingToCart(true);
        try {
          const storeUserData = usePreviewStore.getState().userData as any;
          const raw = storeUserData ? storeUserData : (() => {
            try {
              const s = localStorage.getItem('previewUserData');
              return s ? JSON.parse(s) : null;
            } catch { return null; }
          })();

          const character = raw?.characters?.[0] || {};
          const fullName = character?.full_name || character?.fullName || '';
          const language = character?.language || (searchParams.get('lang') || 'en');
          const genderRaw = character?.gender || character?.gender_code;
          const gender = genderRaw === 'boy' || genderRaw === 'girl'
            ? genderRaw
            : (genderRaw === 1 || genderRaw === '1' ? 'boy' : (genderRaw === 2 || genderRaw === '2' ? 'girl' : ''));
          const relationship = character?.relationship || 'Parent/Guardian';
          const attrs = character?.attributes || {};
          const hairStyle = attrs?.hair_style || attrs?.hairStyle;
          const hairColor = attrs?.hair_color || attrs?.hairColor;
          const skinTone = attrs?.skin_tone || attrs?.skinTone;
          const ageStagePayload = mapAgeStageUiToBackend(attrs?.age_stage);
          const giverNameCart = String(character?.giver_name || character?.created_by || '').trim();
          const photos = Array.isArray(character?.photos) ? character.photos : (character?.photo ? [character.photo] : []);

          const fb = buildPicbookPreviewFacePayload(searchParams.get('bookid') || '', photos.filter(Boolean));

          const payload: any = {
            full_name: fullName,
            language,
            gender,
            relationship,
            ...(giverNameCart ? { giver_name: giverNameCart } : {}),
            face_images: fb.face_images,
            attributes: {
              ...(skinTone ? { skin_tone: skinTone } : {}),
              ...(hairStyle ? { hair_style: hairStyle } : {}),
              ...(hairColor ? { hair_color: hairColor } : {}),
              ...(ageStagePayload ? { age_stage: ageStagePayload } : {}),
              ...fb.faceAttributes,
            },
            texts: {},
          };

          // 圣诞 bundle：fromCartItemId 实际是 packageItemId（cart.items[].items[].id），需要调用新的接口
          await api.post<any>(
            `/cart/package-items/${encodeURIComponent(String(fromCartItemId))}/regenerate-preview`,
            payload
          );
        } catch (e) {
          console.error('[ChristmasBundle] regenerate-preview failed:', e);
          // 失败也回购物车，避免卡在 preview；购物车仍可继续 edit
        }
        router.push('/shopping-cart');
        return;
      }

      // 购物车 Create book（create mode）会带 skipPrefillOptions=1：
      // - 需要用户选择 Options 后，通过 /cart/add 更新当前购物车条目（不走“直接返回”快捷路径）
      // personalized-products（从购物车编辑进入）仍保持原行为：不再次 add-to-cart；仅返回购物车
      const skipPrefillOptions = searchParams.get('skipPrefillOptions') === '1';
      // 检查是否所有必要的部分都已完成
      // 允许未填写 giver 也能继续；但 dedication 必须 Submit 后才算完成
      // 圣诞 bundle（hideOptions=1）：不要求 coverDesign/binding/giftBox，否则会被引导去 option tab
      const ignoreSections = isHideOptions ? new Set(['coverDesign', 'binding', 'giftBox']) : null;
      const incompleteSections = Object.entries(completedSections)
        .filter(([section, completed]) => {
          if (section === 'giver') return false;
          if (section === 'momDrawing') return false;
          if (ignoreSections && ignoreSections.has(section)) return false;
          return !completed;
        })
        .map(([section, _]) => section);
      console.debug('[AddToCart] completedSections:', completedSections, 'incomplete:', incompleteSections);

      if (incompleteSections.length > 0) {
        // 如果有未完成的部分，跳转到第一个未完成的部分
        const firstIncomplete = incompleteSections[0];
        if (firstIncomplete === "giver" || firstIncomplete === "dedication") {
          setActiveTab("Book preview");
        } else {
          setActiveTab("Others");
        }
        setTimeout(() => {
          scrollToSection(firstIncomplete);
        }, 100);
        console.warn('[AddToCart] Blocked by incomplete section:', firstIncomplete);
        return;
      }

      // 检查是否有预览数据（现在 preview_id 等于 batch_id，做兼容）
      const effectivePreviewId = previewData?.preview_id ?? (previewData as any)?.batch_id;
      console.debug('[AddToCart] preview_id:', previewData?.preview_id, 'batch_id:', (previewData as any)?.batch_id, 'effective:', effectivePreviewId);
      if (!effectivePreviewId) {
        return;
      }

      setIsAddingToCart(true);

      const getCoverKey = (id: number | null) => {
        if (id == null) return undefined;
        const item = bookOptions?.cover_options?.find(o => o.id === id);
        return item?.option_key ?? String(id);
      };
      const getBindingKey = (id: number | null) => {
        if (id == null) return undefined;
        const item = bookOptions?.binding_options?.find(o => o.id === id);
        return item?.option_key ?? String(id);
      };
      const getGiftBoxKey = (id: number | null) => {
        if (id == null) return undefined;
        const item = bookOptions?.gift_box_options?.find(o => o.id === id);
        return item?.option_key ?? String(id);
      };

      // 构建添加到购物车的数据
      const coverKey = getCoverKey(selectedBookCover);
      const bindingKey = getBindingKey(selectedBinding);
      const giftKey = getGiftBoxKey(selectedGiftBox);

      // 获取 old_preview_id（使用保存的原始 previewid，而不是当前 URL 中可能已更新的 previewid）
      // 如果存在原始 previewid，说明是从 edit 或 add additional product 进入的，需要携带 old_preview_id
      const oldPreviewId = originalPreviewIdRef.current;
      
      // 统一使用 POST /cart/add，后端会根据 old_preview_id 判断是更新还是新增
      const cartData: CartAddRequest = {
        preview_id: effectivePreviewId as any,
        ...(oldPreviewId ? { old_preview_id: oldPreviewId } : {}),
        quantity: 1,
        cover_style: coverKey,
        customization_data: {
          attributes: {
            ...(bindingKey ? { binding_type: bindingKey } : {}),
            ...(giftKey ? { giftbox: giftKey } : {}),
            delivery_notes: '',
            gift_message: message.trim(),
            replace: false,
          },
        },
      };

      // 打印将要调用的购物车接口（区分 /cart/add vs /cart/{id} 更新）
      console.log('调用购物车API:', fromCartItemId ? {
        url: API_CART_UPDATE(Number(fromCartItemId)),
        method: 'PUT',
        fromCartItemId,
        skipPrefillOptions,
        data: {
          quantity: skipPrefillOptions ? 1 : undefined,
          cover_style: coverKey,
          binding_type: bindingKey,
          giftbox: giftKey,
        },
      } : {
        url: '/cart/add',
        method: 'POST',
        data: cartData,
        hasOldPreviewId: !!oldPreviewId
      });
      
      console.debug('[AddToCart] Sending request /cart/add with data:', cartData);
      // 购物车内（包括普通商品 & 详情页 bundle 里的商品）：更新 options 必须用 PUT /cart/{id}
      // 圣诞 bundle（hideOptions=1）不需要选择 option，且上方已走 regenerate-preview 分支，不在此处理。
      if (fromCartItemId) {
        // 兼容不同后端实现：
        // - 有的实现更新用顶层字段（binding_type/giftbox/gift_message...）
        // - 有的实现沿用 /cart/add 的 customization_data.attributes
        const languageKey =
          (searchParams.get('lang') || displayLang || '').toLowerCase() || undefined;
        const optionAttrs: any = {
          ...(coverKey ? { cover_style: coverKey } : {}),
          ...(bindingKey ? { binding_type: bindingKey } : {}),
          ...(giftKey ? { giftbox: giftKey } : {}),
          ...(languageKey ? { language: languageKey } : {}),
          delivery_notes: '',
          gift_message: message.trim(),
          replace: false,
        };
        await api.put(API_CART_UPDATE(Number(fromCartItemId)), {
          ...(skipPrefillOptions ? { quantity: 1 } : {}),
          ...(coverKey ? { cover_style: coverKey } : {}),
          // 顶层（最常见的 cart update 结构）
          ...optionAttrs,
          // 后端购物车 item 常见存储结构：attributes.{cover_style,binding_type,giftbox,language}
          attributes: optionAttrs,
          // 嵌套（与 /cart/add 对齐）
          customization_data: { attributes: optionAttrs },
        });
        
        // Track AddToCart for updated cart item (fromCartItemId path)
        const contentId = getContentIdBySpu(bookInfo?.spu_code || '');
        
        if (contentId) {
          const cartValue = 0;
          fbTrack('AddToCart', {
            value: cartValue,
            currency: 'USD',
            content_ids: [contentId],
            content_type: 'product',
            contents: [{ id: contentId, quantity: 1 }]
          });
        }
        
        router.push('/shopping-cart');
        return;
      }

      const response = await api.post('/cart/add', cartData) as ApiResponse<CartAddResponse>;
      console.debug('[AddToCart] Response:', response);

      if (response.success) {
        // Track AddToCart for successful cart addition
        const contentId = getContentIdBySpu(bookInfo?.spu_code || '');
        
        if (contentId) {
          const cartValue = 0;
          
          fbTrack('AddToCart', {
            value: cartValue,
            currency: 'USD',
            content_ids: [contentId],
            content_type: 'product',
            contents: [{ id: contentId, quantity: 1 }]
          });
        }
        
        // 跳转到购物车页面
        router.push(`/shopping-cart?selected_cart_id=${response?.data?.id}`);
      } else {
        //toast.error(response.message || (oldPreviewId ? '更新购物车失败' : '添加到购物车失败'));
      }
    } catch (error: any) {
      console.error('添加到购物车失败:', error);
      //toast.error(error.response?.data?.message || '添加到购物车失败，请重试');
    } finally {
      setIsAddingToCart(false);
    }
  };

  //寄语
  const MAX_LINES = 10;
  const MAX_CHARS = 300;
  const DEDICATION_CHAR_WARN = 280;
  const defaultName = (recipient && recipient.trim()) ? recipient : "User"; // 使用 Full name 作为默认名
  // 默认寄语按预览语言（来自 personalize 传入的 ?lang）选择
  const selectedLang = (searchParams.get('lang') || 'en').toLowerCase();
  const isZhLang = selectedLang.startsWith('zh');
  // 获取bookId用于匹配不同的寄语模板
  const bookId = searchParams.get('bookid') || (bookInfo?.id != null ? String(bookInfo.id) : '') || bookInfo?.spu_code || '';
  const buildDefaultMessage = (name: string, lang: string, bookIdParam?: string) => {
    const bookIdUpper = (bookIdParam || bookId || '').toUpperCase();
    
    // 根据bookId判断书籍类型
    let templateType: 'goodnight' | 'santa' | 'bravery' | 'birthday' | 'mama' | 'default' = 'default';
    
    if (bookIdUpper.includes('GOODNIGHT')) {
      templateType = 'goodnight';
    } else if (bookIdUpper === 'PICBOOK_MOM') {
      templateType = 'mama';
    } else if (bookIdUpper.includes('SANTA') || bookIdUpper.includes('SANTALETTER')) {
      templateType = 'santa';
    } else if (bookIdUpper.includes('BRAVE') || bookIdUpper.includes('BRAVEY')) {
      templateType = 'bravery';
    } else if (bookIdUpper.includes('BIRTHDAY')) {
      templateType = 'birthday';
    }
    
    // 根据书籍类型和语言返回对应的模板
    if (lang.startsWith('zh')) {
      // 中文模板
      switch (templateType) {
        case 'goodnight':
          return `亲爱的${name}，\n  愿你的梦境充满温柔的星星和快乐的思绪。睡个好觉，我的小宝贝——你是安全的，被爱着的，永远是我们心中最亮的光。`;
        case 'santa':
          return `亲爱的${name}，\n  这一年你如此善良，充满好奇。\n  圣诞老人和我都为你正在成为的那个人感到骄傲。\n  无论走到哪里，都要继续闪耀你温暖的心。`;
        case 'bravery':
          return `亲爱的${name}，\n  我为你不断尝试而感到骄傲，即使面对新事物或感到害怕时也是如此。\n  你拥有最温柔的心和最勇敢的精神——永远不要忘记你有多么了不起！`;
        case 'birthday':
          return `亲爱的${name}，\n  又一年充满欢笑、成长和喜悦的美好时光！\n  你让每一天都因为你的存在而变得特别。祝你生日快乐，愿未来的回忆充满魔法般的精彩。`;
        case 'mama':
          return `我最亲爱的妈妈——\n谢谢你无尽的爱、温暖的拥抱，以及你每天为我做的点点滴滴。\n你让我的世界感到安全、快乐，充满魔力。\n我爱你，千言万语也说不尽。💛`;
        default:
          return `亲爱的${name}，\n  这个世界充满了令人惊喜与奇妙的角落等待你去探索。愿你的每一天都充满发现、冒险与喜悦！`;
      }
    } else {
      // 英文模板
      switch (templateType) {
        case 'goodnight':
          return `Dear ${name},\nMay your dreams be filled with gentle stars and happy thoughts. Sleep tight, my little one — you are safe, loved, and always the brightest light in our hearts.`;
        case 'santa':
          return `Dear ${name},\nYou've been so kind and full of wonder this year.\nSanta and I are so proud of the person you're growing to be.\nKeep shining your warm heart everywhere you go.`;
        case 'bravery':
          return `Dear ${name},\nI'm so proud of how you keep trying, even when things feel new or scary.\nYou have the gentlest heart and the bravest spirit — never forget how amazing you are!`;
        case 'birthday':
          return `Dear ${name},\nAnother wonderful year of laughter, growth, and joy!\nYou make every day special just by being you. Wishing you the happiest birthday and magical memories ahead.`;
        case 'mama':
          return `To my dearest mama —\nthank you for your endless love, your warm hugs, and all the little things you do every day.\nYou make my world feel safe, happy, and full of magic.\nI love you more than words can say. 💛`;
        default:
          return `Dear ${name},\n  The world is full of wonderful, surprising places to explore. May your days be full of discoveries, adventure and joy!`;
      }
    }
  };
  const defaultMessage = buildDefaultMessage(defaultName, selectedLang, bookId);

  const [message, setMessage] = React.useState(defaultMessage);
  // 跟踪上一次默认寄语，用于判断是否应同步更新（避免覆盖用户已编辑的内容）
  const prevDefaultMessageRef = React.useRef(defaultMessage);
  /** 用户是否在寄语输入框中操作过（含整段删除）；用于区分「未改动」与「刻意留空」 */
  const messageUserTouchedRef = React.useRef(false);
  React.useEffect(() => {
    const prev = prevDefaultMessageRef.current;
    const userHasNotEdited =
      !messageUserTouchedRef.current &&
      (!message || message.trim() === '' || message === prev);
    if (userHasNotEdited) {
      setMessage(defaultMessage);
      setDedication(defaultMessage);
    } else if (
      (!dedication || dedication.trim() === '' || dedication === ' ') &&
      !(messageUserTouchedRef.current && !String(message || '').trim())
    ) {
      // 用户编辑了 message，但画布用的 dedication 仍为空，则仅同步画布默认值（不把「刻意清空」刷回默认）
      setDedication(defaultMessage);
    }
    prevDefaultMessageRef.current = defaultMessage;
  }, [defaultMessage, message, dedication]);

  // 当bookId或语言变化时，如果用户未编辑，则更新为新的模板
  React.useEffect(() => {
    const newDefaultMessage = buildDefaultMessage(defaultName, selectedLang, bookId);
    const prev = prevDefaultMessageRef.current;
    const userHasNotEdited =
      !messageUserTouchedRef.current &&
      (!message || message.trim() === '' || message === prev);
    if (userHasNotEdited && newDefaultMessage !== prev) {
      setMessage(newDefaultMessage);
      setDedication(newDefaultMessage);
      prevDefaultMessageRef.current = newDefaultMessage;
    }
  }, [bookId, selectedLang, defaultName, message]);

  // 当 recipient 变更时，如果当前文案仍是上一次的默认模板（仅名字不同），则同步替换为新名字
  const prevRecipientRef = React.useRef(recipient);
  React.useEffect(() => {
    const prevRecipient = prevRecipientRef.current;
    if (prevRecipient === recipient) return;
    const prevTemplate = buildDefaultMessage((prevRecipient && prevRecipient.trim()) ? prevRecipient : 'User', selectedLang, bookId);
    const nextTemplate = buildDefaultMessage(defaultName, selectedLang, bookId);
    const skipEmptyOverride = messageUserTouchedRef.current && !String(message || '').trim();
    const skipEmptyDedicationOverride = messageUserTouchedRef.current && !String(dedication || '').trim();
    if (
      (!message || message.trim() === '' || message === prevTemplate) &&
      !skipEmptyOverride
    ) {
      setMessage(nextTemplate);
    }
    if (
      (!dedication || dedication.trim() === '' || dedication === prevTemplate) &&
      !skipEmptyDedicationOverride
    ) {
      setDedication(nextTemplate);
    }
    prevRecipientRef.current = recipient;
  }, [recipient, selectedLang, defaultName, message, dedication, bookId]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    messageUserTouchedRef.current = true;
    const { value } = e.target;

    // 限制行数：按换行符拆分后行数不能超过 MAX_LINES
    const lines = value.split('\n');
    if (lines.length > MAX_LINES) {
      return;
    }

    // 限制字数
    if (value.length > MAX_CHARS) {
      return;
    }

    setMessage(value);
  };

  //定义状态控制抽屉显示
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 用来获取 Drawer 内部 DOM 节点
  const drawerRef = useRef<HTMLDivElement>(null);

  // 处理点击 "View Details" 链接
  const handleViewDetails = (
    option: GiftBoxOption,
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.stopPropagation(); // 阻止冒泡
    setDetailModal(option);
    setCurrentIndex(0);
    if (!drawerOpen) {
      setDrawerOpen(true);
    }
  };

  // 当抽屉打开时添加 document 级别点击监听
  useEffect(() => {
    if (!drawerOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      // 如果点击的是"more details"链接
      if ((event.target as HTMLElement).closest('.more-details')) {
        // 不关闭抽屉，直接更新内容（more details 点击处理函数会在点击时调用 event.stopPropagation()）
        return;
      }
      // 如果点击在 Drawer 内部，不关闭
      if (drawerRef.current && drawerRef.current.contains(event.target as Node)) {
        return;
      }
      // 否则关闭抽屉
      setDrawerOpen(false);
      // 延迟清除 detailModal，等动画结束后再清除
      setTimeout(() => setDetailModal(null), 300);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <div className="w-full pt-[12px] px-4 md:mr-[280px] flex flex-col items-center pb-24 md:pb-0">
        {/* 固定的导航栏 */}
        <div className="fixed top-0 left-0 pt-[12px] px-4 z-50 w-full md:w-[calc(100%-280px)] flex flex-col items-center">
          <div className="w-[95%] mx-auto">
            <TopNavBarWithTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (hideOthers && tab === 'Others') return;
                setActiveTab(tab);
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              hideOthers={hideOthers}
            />
          </div>
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full pt-14">
            <h1 className="text-[28px] mt-2 mb-4 text-center w-full">Your book for {recipient?.trim()}</h1>
            
            {/* 书籍封面 */}
            <div className="flex flex-col items-center w-full max-w-3xl">
              <div className={`w-full flex justify-center ${showStoryComingLine ? 'mb-4' : 'mb-8'}`}>
                {(() => {
                  // 尝试获取当前选中的封面：
                  // - 如果用户已选择封面，则使用选中的封面；
                  // - 否则：默认优先 cover_1；
                  // - 圣诞 bundle 且 cover_type=personalized：默认优先 cover_3；
                  // - 若不存在对应 cover，则回退到另一个 cover，再兜底第一个。
                  let activeOption: CoverOption | null = null;

                  if (bookOptions?.cover_options) {
                    if (selectedBookCover) {
                      activeOption = bookOptions.cover_options.find((o) => o.id === selectedBookCover) || null;
                    }
                    if (!activeOption) {
                      const findCover1 = () =>
                        bookOptions.cover_options.find(
                          (o) =>
                            String(o.id) === '1' ||
                            o.option_key === '1' ||
                            (typeof o.option_key === 'string' && o.option_key.toLowerCase().includes('cover_1')),
                        ) || null;
                      const findCover3 = () =>
                        bookOptions.cover_options.find(
                          (o) =>
                            String(o.id) === '3' ||
                            o.option_key === '3' ||
                            (typeof o.option_key === 'string' && o.option_key.toLowerCase().includes('cover_3')),
                        ) || null;

                      // 1）优先：cover_1（默认）或 cover_3（圣诞 personalized）
                      activeOption = preferCover3AsDefault ? findCover3() : findCover1();
                      // 2）回退：另一个 cover
                      if (!activeOption) {
                        activeOption = preferCover3AsDefault ? findCover1() : findCover3();
                      }
                      // 3）兜底：第一个
                      if (!activeOption && !selectedBookCover && bookOptions.cover_options.length > 0) {
                        activeOption = bookOptions.cover_options[0];
                      }
                    }
                  }

                  const coverUrls = activeOption ? buildCoverR2Urls(searchParams.get('bookid'), activeOption) : null;

                  if (coverUrls) {
                    const { base, canvasBase, cropRightHalf } = coverUrls;
                    const rawCoverKey = activeOption?.option_key || String(activeOption?.id || '');
                    const activeCoverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(activeOption?.id || '');

                    // Make it personal 顶部封面：cover_3/4 也使用后端 preview 页，这样排队/换脸中状态与 Options tab 保持一致。
                    if (activeCoverId === '3' || activeCoverId === '4') {
                      const target = `cover_${activeCoverId}`;
                      const coverPage = (previewData?.preview_data || []).find((p: any) => {
                        const code = String((p as any)?.page_code || '').toLowerCase().replace(/-/g, '_');
                        return code === target;
                      });
                      const raw = coverPage ? getPreviewDisplayImageRaw(coverPage) : '';
                      const backendSrc = raw ? buildImageUrl(String(raw)) : '';
                      const ratio = coverThumbAspectRatio ?? (cropRightHalf ? 2 : 1);
                      const coverHasSwap = !!(coverPage as any)?.has_face_swap;
                      const coverHasBase = !!(coverPage as any)?.base_image_url || !!(coverPage as any)?.image_url;
                      const coverFailed = String((coverPage as any)?.status || '').toLowerCase() === 'failed';
                      const coverNeedsOverlay =
                        coverHasSwap && coverHasBase && !hasMeaningfulFinalImage(coverPage) && !coverFailed;
                      const coverProgress = coverPage ? Math.round(pageProgress[(coverPage as any).page_id] ?? 0) : 0;
                      const coverOverlayMode = coverFailed ? 'failed' : (coverProgress > 0 ? 'progress' : 'loading');

                      return (
                        <div
                          className="relative w-full max-w-[400px] overflow-hidden rounded-lg shadow-md"
                          style={{ aspectRatio: String(ratio) }}
                        >
                          {backendSrc ? (
                            <OptimizedImage
                              src={backendSrc}
                              alt="Book Cover"
                              width={cropRightHalf ? 400 : 200}
                              height={200}
                              priority
                              className="absolute inset-0 h-full w-full object-cover object-right"
                            />
                          ) : (
                            <Image
                              src={base}
                              alt="Book Cover"
                              width={400}
                              height={400}
                              priority
                              className={`absolute inset-0 h-full w-full object-cover ${cropRightHalf ? 'object-right' : 'object-center'}`}
                            />
                          )}
                          {(!backendSrc || coverNeedsOverlay || coverFailed) && (
                            <div
                              className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                              style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                            >
                              {coverOverlayMode === 'failed' ? (
                                <PageRenderFailedOverlay message={t('pageRenderFailedMessage')} />
                              ) : coverOverlayMode === 'progress' ? (
                                <DreamazeFaceSwapLoadingBar progress={coverProgress} />
                              ) : (
                                <div className="text-center">
                                  <DreamazeLogoRainbowLoader size={60} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 通用：如果当前封面在 R2 上有 page_properties.json，使用 Canvas 在封面图上绘制用户名
                    if (activeOption && coverTextConfig && recipient && recipient.trim()) {
                      const rawCoverKeyInner = activeOption.option_key || String(activeOption.id);
                      const coverIdInner = /^\d+$/.test(rawCoverKeyInner)
                        ? rawCoverKeyInner
                        : String(activeOption.id);
                      // 仅当配置对应当前封面时启用
                      let expectedBookId = (searchParams.get('bookid') || '').toUpperCase();
                      if (expectedBookId === 'PICBOOK_GOODNIGHT3') {
                        expectedBookId = 'PICBOOK_GOODNIGHT';
                      }
                      const expectedKey = `${expectedBookId}_${coverIdInner}`;
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[封面显示] key匹配检查:', {
                          coverTextConfigKey: coverTextConfig.key,
                          expectedKey,
                          match: coverTextConfig.key === expectedKey,
                          recipient: recipient.trim(),
                          activeOptionId: activeOption.id,
                          activeOptionKey: activeOption.option_key,
                        });
                      }
                      if (coverTextConfig.key === expectedKey) {
                        return (
                          <div className="relative w-full max-w-[400px] shadow-md rounded-lg overflow-hidden">
                            <CoverNameCanvas
                              // 使用本地域名代理过的图片地址，避免 Canvas CORS 污染
                              src={canvasBase}
                              name={recipient.trim()}
                              texts={coverTextConfig.texts}
                              className="w-full h-auto block"
                            />
                          </div>
                        );
                      }
                    }

                    // 无 page_properties.json 的封面保持原有展示逻辑
                    return (
                      <div className="relative w-full max-w-[400px] shadow-md rounded-lg overflow-hidden">
                        <Image
                          src={base}
                          alt="Book Cover"
                          width={400}
                          height={400}
                          priority
                          className={`w-full h-auto object-cover ${cropRightHalf ? 'object-right' : 'object-center'}`}
                        />
                      </div>
                    );
                  }

                  // 回退到原有逻辑（非 Cloudflare 场景）
                  return bookInfo?.default_cover ? (
                    <div className="relative w-full max-w-[400px]">
                      {isCoverLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg z-10">
                          <DreamazeLogoRainbowLoader size={60} />
                        </div>
                      )}
                      <OptimizedImage
                        src={buildImageUrl(bookInfo.default_cover)}
                        fallbackSrc={'/imgs/picbook/goodnight/封面1.jpg'}
                        alt="Book Cover"
                        width={400}
                        height={392}
                        priority
                        className={`max-w-sm rounded-lg shadow-md w-full h-auto ${isCoverLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          console.error(`封面图片加载失败: ${buildImageUrl(bookInfo.default_cover)} (raw: ${bookInfo.default_cover})`);
                          setIsCoverLoading(false);
                        }}
                        onLoadingComplete={() => {
                          setIsCoverLoading(false);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full max-w-[400px]">
                      {isLoadingBookInfo && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg z-10">
                          <DreamazeLogoRainbowLoader size={60} />
                        </div>
                      )}
                      <Image
                        src="/cover.png"
                        alt="Book Cover"
                        width={400}
                        height={392}
                        className="max-w-sm rounded-lg shadow-md w-full h-auto"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  );
                })()}
              </div>
              {showStoryComingLine && (
                <div
                  className="mb-8 flex min-h-[1.5rem] flex-col items-center justify-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  {isStoryQueueYourTurnBanner ? (
                    <p className="text-center text-lg font-semibold text-[#8E92A7]">{t('storyYourTurn')}</p>
                  ) : (
                    <>
                      <p className="text-center text-base font-medium text-[#C9CCD3]">
                        <span>{t('storyPreparing')}</span>
                        <span className="inline-block w-[3ch] text-left font-mono">
                          {'.'.repeat(comingLifeDotPhase)}
                        </span>
                      </p>
                      {previewPendingFromBatch !== null &&
                        displayedPreviewPending !== null &&
                        displayedPreviewPending > 0 && (
                          <p className="text-center text-sm text-[#AAB0BF]">{t('storyAhead', { count: displayedPreviewPending })}</p>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
            {/* 寄语页已移除：改为叠加至第二张预览图 */}

            {/* 移除：排队提示条（queueTip/queueTipNoPos + selectOptions） */}

            {/* 页面预览：有图片就展示（包括排队时的base_image） */}
            {(() => {
              console.log('[Preview] Check display condition:', {
                hasPreviewData: !!previewData,
                hasPreviewDataArray: !!previewData?.preview_data,
                previewDataLength: previewData?.preview_data?.length,
                previewDataSample: previewData?.preview_data?.[0],
                isQueued,
                isGenerating,
                isCompleted
              });
              if (previewData?.preview_data) {
                console.log('[Preview] All pages in previewData:', previewData.preview_data.map((p: any) => ({
                  page_id: p.page_id,
                  page_code: p.page_code,
                  image_url: p.image_url?.substring(0, 80) + '...'
                })));
              }
              return null;
            })()}
            {previewData?.preview_data && previewData.preview_data.length > 0 && (
              <div className="w-full max-w-5xl mb-8">
                <div className="w-full flex flex-col items-center gap-8">
                  {(() => {
                    // 在预览页面显示：仅普通页（封面移至 Others 处理）
                    const displayedPages = previewData.preview_data.filter((p: any) => !(p as any).is_cover);
                    console.log('[Preview] Rendering', displayedPages.length, 'pages (previewPagesCount:', previewPagesCount, ', isQueued:', isQueued, ', isGenerating:', isGenerating, ')');
                    
                    // 修改判定逻辑：只要有页面数据就渲染，不强制要求 base_image
                    // 因为非换脸页可能没有 base_image_url，只有 image_url
                    if (displayedPages.length === 0) {
                      // 无任何 base 页：此处不再重复提示，统一在寄语页下方展示队列提示
                      return null;
                    }
                    const firstSwapping = displayedPages.find((p) => p.has_face_swap && isGenerating && !swappedPageIds.has(p.page_id));
                    const firstSwappingPageId = firstSwapping ? firstSwapping.page_id : null;
                    return displayedPages.map((page, idx) => {
                    // 根据batch返回的状态判断是否需要显示蒙版
                    // 需要换脸 且 已有基础图 且 尚无最终图 → 显示蒙版 + 进度
                    const hasSwap = !!page.has_face_swap;
                    // 后端不再返回 base_only：以字段是否存在来判断
                    const hasBase = !!(page as any).base_image_url || !!page.image_url;
                    const hasFinal = hasMeaningfulFinalImage(page);
                    const pageFailed = String((page as any).status || '').toLowerCase() === 'failed';
                    // 换脸页失败：不要无限 loading，用 PageRenderFailedOverlay
                    const needsProcessingOverlay = hasSwap && hasBase && !hasFinal && !pageFailed;
                    const isSwapping = needsProcessingOverlay;
                    const progress = Math.round(pageProgress[page.page_id] ?? 0);
                    // 展示策略：当 final 与 base/image 不同（说明最终图已更新）时优先展示 final；
                    // 否则展示 base/image（例如 create 流程里 final 可能为空或等同于 base）
                    const displayUrlRaw = getPreviewDisplayImageRaw(page);
                    const src = buildImageUrl(String(displayUrlRaw || ''));
                    const isReplaceablePage = replaceableTextPageIds.has(page.page_id) || replaceableTextPageNumbers.has(page.page_number);
                    // 仅在 p3-4（有的书返回 p3-p4）页面渲染 Giver & Dedication
                    const pageCode = String((page as any).page_code || '');
                    const isGiverDedicationPage = pageCode === 'p3-4' || pageCode === 'p3-p4';
                    const momCompositePageCode = isMomBook ? toMomCompositeUploadPageCode(pageCode) : null;
                    const isMomCompositePage = Boolean(momCompositePageCode);
                    const isMomCompositeUploadReady =
                      isCompleted ||
                      faceSwapStatusRef.current === 'completed' ||
                      String((page as any).status || '').toLowerCase() === 'completed';
                    const canUploadMomComposite =
                      isMomCompositePage &&
                      isMomCompositeUploadReady &&
                      !isSwapping &&
                      !pageFailed;
                    // 轮到该页前（progress 为 0）显示 loading；开始后显示进度；失败页显示说明
                    const overlayMode = pageFailed ? 'failed' : (progress > 0 ? 'progress' : 'loading');

                      // p3-4 展示策略同上：只有当 final 与 base/image 不同，才默认展示 final。
                      // 这样 edited book 能展示历史最终图；create book（final==base 或无 final）则会走 Canvas 展示默认寄语。
                      const p34FinalSrc =
                        isGiverDedicationPage && hasMeaningfulFinalImage(page)
                          ? buildImageUrl(String((page as any).final_image_url || ''))
                          : null;
                      // p3-4 分层模型：
                      // - 底图：只使用 base_stage_url（后端 base stage 纯底图）。
                      const p34TemplateRaw = isGiverDedicationPage
                        ? ((page as any).base_stage_url || p34BaseImageUrlRef.current)
                        : null;
                      const p34BaseSrc = isGiverDedicationPage
                        ? buildImageUrl(String(p34TemplateRaw || ''))
                        : src;
                      // giver 图：优先使用用户本次上传（giverImageUrl），否则用后端保存的 giver_data（URL / data URL）
                      const p34GiverOverlaySrc = isGiverDedicationPage
                        ? (giverImageUrl || (page as any).giver_data || null)
                        : giverImageUrl;
                      const upperBookId = (searchParams.get('bookid') || '').toUpperCase();
                      const giverImageScale =
                        upperBookId === 'PICBOOK_BRAVEY' ||
                        upperBookId === 'PICBOOK_BIRTHDAY'
                          ? 1.2
                          : (upperBookId === 'PICBOOK_GOODNIGHT3' ||
                              upperBookId === 'PICBOOK_MOM' ||
                              upperBookId === 'PICBOOK_SANTA' ||
                              upperBookId === 'PICBOOK_MELODY')
                              ? 0.7
                              : undefined;
                      // 如果是“曾经编辑过的书”，后端会返回 p3-4 的 final_image_url。
                      // 默认应直接展示 final 图；只有当用户打开编辑弹窗/发生本地修改时，才使用 Canvas 分层合成。
                      const p34HasLocalChanges =
                        !!giverImageUrl || !!editField || shouldUploadP34ComposedRef.current;

                      // 单页模式：p3-4 始终拆成左右单页展示；有 final 时只把 final 当作底图，不再整张跨页显示。
                      if (isGiverDedicationPage && viewMode === 'single') {
                        if (isSwapping || pageFailed) {
                          return (
                            <div key={page.page_id} ref={giverRef} className="w-full flex flex-col items-center">
                              <div className="w-full max-w-5xl">
                                <PreviewPageItem
                                  pageId={page.page_id}
                                  pageNumber={page.page_number}
                                  src={src}
                                  viewMode="single"
                                  showOverlay={isSwapping || pageFailed}
                                  progress={progress}
                                  overlayMode={overlayMode as any}
                                  content={page.content}
                                  onImageLoaded={(loadedPageId) => {
                                    if (pageIdForStoryComingHide && loadedPageId === pageIdForStoryComingHide) {
                                      setIsStoryComingTargetPageLoaded(true);
                                    }
                                    if (sneakPeekNoticePageId && loadedPageId === sneakPeekNoticePageId) {
                                      setIsSneakPeekNoticePageLoaded(true);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                        if (p34FinalSrc && !p34HasLocalChanges) {
                          return (
                            <div key={page.page_id} ref={giverRef} className="w-full flex flex-col items-center">
                              <div className="w-full max-w-5xl">
                                <GiverDedicationCanvas
                                  className="w-full"
                                  imageUrl={p34FinalSrc}
                                  mode="single"
                                  giverText=""
                                  dedicationText=""
                                  giverImageUrl={null}
                                  giverImageScale={giverImageScale}
                                  leftBelow={(
                                    <div className="mt-2 w-full flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          giverFileInputRef.current?.click();
                                        }}
                                        className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                      >
                                        Personalize with a photo
                                      </button>
                                    </div>
                                  )}
                                  rightBelow={(
                                    <div className="mt-2 w-full flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => setEditField('dedication')}
                                        className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                      >
                                        Edit Dedication
                                      </button>
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        }
                        return (
                        <div key={page.page_id} ref={giverRef} className="w-full flex flex-col items-center">
                          <div className="w-full max-w-5xl">
                            <GiverDedicationCanvas
                              className="w-full"
                              imageUrl={p34BaseSrc}
                              mode="single"
                              giverText={giver}
                              dedicationText={dedication}
                              giverImageUrl={p34GiverOverlaySrc}
                              giverImageScale={giverImageScale}
                              onRendered={uploadP34ComposedImage}
                              leftBelow={(
                                <div className="mt-2 w-full flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      giverFileInputRef.current?.click();
                                    }}
                                    className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                  >
                                    Personalize with a photo
                                  </button>
                                </div>
                              )}
                              rightBelow={(
                                <div className="mt-2 w-full flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => setEditField('dedication')}
                                    className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                  >
                                    Edit Dedication
                                  </button>
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      );
                    }
                      // 双页模式：p3-4 默认展示 final（并保留操作按钮）；编辑时才用 Canvas overlay
                      const p34ButtonsOverlay = isGiverDedicationPage ? (
                        <div className="pointer-events-none hidden md:block absolute inset-0">
                          <div className="absolute bottom-[20%] left-0 w-1/2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                giverFileInputRef.current?.click();
                              }}
                              className="pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                            >
                              Personalize with a photo
                            </button>
                          </div>
                          <div className="absolute bottom-[20%] right-0 w-1/2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => setEditField('dedication')}
                              className="pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                            >
                              Edit Dedication
                            </button>
                          </div>
                        </div>
                      ) : null;
                      const momCompositeButton = canUploadMomComposite && momCompositePageCode ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              activeMomDrawingPageCodeRef.current = momCompositePageCode;
                              setActiveMomDrawingPageCode(momCompositePageCode);
                              momDrawingFileInputRef.current?.click();
                            }}
                            disabled={momDrawingUploadingPageCode === momCompositePageCode}
                            className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${
                              momDrawingUploadingPageCode === momCompositePageCode ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {momDrawingUploadingPageCode === momCompositePageCode
                              ? 'Uploading...'
                              : uploadedMomDrawingPageCodes.has(momCompositePageCode)
                                ? 'Replace drawing'
                                : 'Upload your drawing'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseDefaultMomDrawing(momCompositePageCode)}
                            disabled={momDrawingUploadingPageCode === momCompositePageCode}
                            className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${
                              momDrawingUploadingPageCode === momCompositePageCode ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Use default drawing
                          </button>
                        </div>
                      ) : null;
                      const momCompositeButtonOverlay = momCompositeButton && viewMode !== 'single' ? (
                        <div className="pointer-events-none hidden md:block absolute inset-0">
                          <div className="absolute bottom-[20%] right-0 w-1/2 flex justify-center">
                            <div className="pointer-events-auto">
                              {momCompositeButton}
                            </div>
                          </div>
                        </div>
                      ) : null;
                      return (
                      <div
                        key={page.page_id}
                        ref={isGiverDedicationPage ? dedicationRef : (momCompositePageCode === 'p5-6' ? momDrawingRef : undefined)}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="w-full max-w-5xl">
                          <PreviewPageItem
                            pageId={page.page_id}
                            pageNumber={page.page_number}
                            src={(p34FinalSrc && isGiverDedicationPage && !p34HasLocalChanges) ? p34FinalSrc : src}
                            viewMode={viewMode}
                            showOverlay={isSwapping || pageFailed}
                            progress={progress}
                            overlayMode={overlayMode as any}
                            content={page.content}
                            customOverlayContent={pageFailed ? undefined : (isGiverDedicationPage ? (
                              (p34FinalSrc && !p34HasLocalChanges) ? p34ButtonsOverlay : (
                                <div className="w-full h-full relative">
                                  <GiverDedicationCanvas
                                    className="w-full h-full"
                                    imageUrl={p34BaseSrc}
                                    mode="double"
                                    giverText={giver}
                                    dedicationText={dedication}
                                    giverImageUrl={p34GiverOverlaySrc}
                                    giverImageScale={giverImageScale}
                                    onRendered={uploadP34ComposedImage}
                                  />
                                  {p34ButtonsOverlay}
                                </div>
                              )
                            ) : (momCompositeButtonOverlay || undefined))}
                            onImageLoaded={(loadedPageId) => {
                              if (pageIdForStoryComingHide && loadedPageId === pageIdForStoryComingHide) {
                                setIsStoryComingTargetPageLoaded(true);
                              }
                              if (sneakPeekNoticePageId && loadedPageId === sneakPeekNoticePageId) {
                                setIsSneakPeekNoticePageLoaded(true);
                              }
                            }}
                          />
                          {isGiverDedicationPage && viewMode === 'double' && !pageFailed && !isSwapping && (
                            <div className="mt-2 w-full grid grid-cols-2 gap-2 md:hidden">
                              <div className="w-full flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    giverFileInputRef.current?.click();
                                  }}
                                  className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                >
                                  Personalize with a photo
                                </button>
                              </div>
                              <div className="w-full flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => setEditField('dedication')}
                                  className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                                >
                                  Edit Dedication
                                </button>
                              </div>
                            </div>
                          )}
                          {momCompositeButton && viewMode !== 'single' && (
                            <div className="mt-6 w-full flex justify-center md:hidden">
                              {momCompositeButton}
                            </div>
                          )}
                          {momCompositeButton && viewMode === 'single' && (
                            <div className="mt-6 w-full flex justify-center">
                              {momCompositeButton}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                  })()}
                </div>
                {isSneakPeekNoticePageLoaded && (
                  <p className="text-center text-[#999999] mt-8 whitespace-pre-line">
                    {`This is a sneak peek of the story.\nComplete your order to receive the full book preview within 48 hours.`}
                  </p>
                )}
              </div>
            )}

          </main>
        ) : (
          // Others 标签页内容
          <main className="flex-1 flex flex-col items-center justify-center w-full gap-[64px] pt-14">
            {/* Book Cover Section */}
            <section ref={coverDesignRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-[28px] text-center mb-2">Which cover will your little one love most?</h1>
              <p className="text-center text-gray-600 mb-4">
                A low-key design or one that's made extra special with their face?
              </p>

              {/* 加载状态 */}
              {isLoadingOptions && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>loading...</p>
                  </div>
                </div>
              )}

              {/* 错误状态 */}
              {optionsError && (
                <div className="w-full max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">错误: {optionsError}</p>
                  <button 
                    onClick={fetchBookOptions}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 封面选项 */}
              {!isLoadingOptions && !optionsError && bookOptions && bookOptions.cover_options && bookOptions.cover_options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-[80%] mx-auto">
                  {bookOptions.cover_options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedBookCover(selectedBookCover === option.id ? null : option.id)}
                      className={`bg-white p-4 rounded flex flex-col items-center cursor-pointer ${
                        selectedBookCover === option.id
                          ? 'border-2 border-[#012CCE]'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      {(() => {
                        // 接口不再提供封面图片，封面缩略图统一走 R2（buildCoverR2Urls）
                        const coverUrls = buildCoverR2Urls(searchParams.get('bookid'), option);
                        // 如果缺少 bookid，则回退到本地占位图
                        if (!coverUrls) {
                          return (
                            <Image
                              src={'/imgs/picbook/goodnight/封面1.jpg'}
                              alt={`Cover ${option.id} - ${option.name}`}
                              width={200}
                              height={200}
                              className="w-full h-auto mb-2"
                            />
                          );
                        }

                        const { base, canvasBase, cropRightHalf } = coverUrls;

                        // 仅对 cover 1 / 2 在按钮缩略图中叠加名字，其余封面保持原图
                        const rawCoverKey = option.option_key || String(option.id);
                        const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(option.id);

                        if (coverId === '1' || coverId === '2') {
                          return (
                            <div className="relative w-full mb-2 overflow-hidden">
                              <CoverOptionImageWithName
                                bookId={searchParams.get('bookid')}
                                option={option}
                                // 同样使用本地域名代理地址，保证缩略图 Canvas 也能正常叠加名字
                                baseSrc={canvasBase}
                                cropRightHalf={cropRightHalf}
                                recipient={recipient}
                              />
                            </div>
                          );
                        }

                        // cover_3 / cover_4：缩略图来自后端 preview；外框与 cover_1 相同宽高比，宽图沿右侧裁切
                        if (coverId === '3' || coverId === '4') {
                          const target = `cover_${coverId}`;
                          const coverPage = (previewData?.preview_data || []).find((p: any) => {
                            const code = String((p as any)?.page_code || '').toLowerCase().replace(/-/g, '_');
                            return code === target;
                          });
                          const raw = coverPage ? getPreviewDisplayImageRaw(coverPage) : '';
                          const backendSrc = raw ? buildImageUrl(String(raw)) : '';
                          // 以 cover_1 的真实宽高比为准，确保 cover_3/4 与 cover_1 同高
                          const ratio = coverThumbAspectRatio ?? (cropRightHalf ? 2 : 1);
                          const coverHasSwap = !!(coverPage as any)?.has_face_swap;
                          const coverHasBase = !!(coverPage as any)?.base_image_url || !!(coverPage as any)?.image_url;
                          const coverFailed = String((coverPage as any)?.status || '').toLowerCase() === 'failed';
                          const coverNeedsOverlay =
                            coverHasSwap && coverHasBase && !hasMeaningfulFinalImage(coverPage) && !coverFailed;
                          const coverProgress = coverPage ? Math.round(pageProgress[(coverPage as any).page_id] ?? 0) : 0;
                          const coverOverlayMode = coverFailed ? 'failed' : (coverProgress > 0 ? 'progress' : 'loading');

                          if (!backendSrc) {
                            return (
                              <div
                                className="relative w-full mb-2 overflow-hidden"
                                style={{ aspectRatio: String(ratio) }}
                              >
                                <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
                                  <DreamazeLogoRainbowLoader size={42} />
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              className="relative w-full mb-2 overflow-hidden"
                              style={{ aspectRatio: String(ratio) }}
                            >
                              <OptimizedImage
                                src={backendSrc}
                                alt={`Cover ${option.id} - ${option.name}`}
                                width={cropRightHalf ? 400 : 200}
                                height={200}
                                className="absolute inset-0 h-full w-full object-cover object-right"
                              />
                              {(coverNeedsOverlay || coverFailed) && (
                                <div
                                  className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                                >
                                  {coverOverlayMode === 'failed' ? (
                                    <PageRenderFailedOverlay message={t('pageRenderFailedMessage')} />
                                  ) : coverOverlayMode === 'progress' ? (
                                    <div className="scale-[0.7]">
                                      <DreamazeFaceSwapLoadingBar progress={coverProgress} />
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <DreamazeLogoRainbowLoader size={42} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // 其他封面缩略图：固定宽度，高度自适应，不叠加名字
                        return (
                          <div className="relative w-full mb-2 overflow-hidden">
                            <Image
                              src={base}
                              alt={`Cover ${option.id} - ${option.name}`}
                              width={cropRightHalf ? 400 : 200}
                              height={200}
                              className={`w-full h-auto object-cover ${cropRightHalf ? 'object-right' : 'object-center'}`}
                            />
                          </div>
                        );
                      })()}
                      <div className="flex items-center justify-center space-x-2 w-full py-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                            selectedBookCover === option.id
                              ? 'bg-[#012CCE] border-[#012CCE]'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {selectedBookCover === option.id && (
                              <svg
                                className="mx-auto"
                                width="12"
                                height="8"
                                viewBox="0 0 12 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 3.5L5 7L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </span>
                        <span className="text-center">
                        {formatOptionPrice(option.price, option.currency_code)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 当没有封面选项时的提示 */}
              {/* {!isLoadingOptions && !optionsError && bookOptions && (!bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无封面选项可用</p>
                </div>
              )} */}
              
              {/* 临时封面选项 - 当API数据有问题时使用 */}
              {!isLoadingOptions && (optionsError || !bookOptions || !bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
                <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                  {[
                    { id: 1, name: 'Classic Cover', price: 14.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面1.jpg' },
                    { id: 2, name: 'Modern Cover', price: 14.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面2.jpg' },
                    { id: 3, name: 'Premium Cover', price: 19.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面3.jpg' },
                    { id: 4, name: 'Deluxe Cover', price: 24.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面4.jpg' }
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedBookCover(selectedBookCover === option.id ? null : option.id)}
                      className={`bg-white p-4 rounded flex flex-col items-center cursor-pointer ${
                        selectedBookCover === option.id
                          ? 'border-2 border-[#012CCE]'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <Image
                        src={option.image_url}
                        alt={`Cover ${option.id} - ${option.name}`}
                        width={200}
                        height={200}
                        className="w-full h-auto mb-2"
                      />
                      <div className="flex items-center justify-center space-x-2 w-full py-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                            selectedBookCover === option.id
                              ? 'bg-[#012CCE] border-[#012CCE]'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {selectedBookCover === option.id && (
                              <svg
                                className="mx-auto"
                                width="12"
                                height="8"
                                viewBox="0 0 12 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 3.5L5 7L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </span>
                        <span className="text-center">
                          ${option.price} {option.currency_code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Book Format Section */}
            <section  ref={bindingRef} className="w-full mt-2 max-w-4xl mx-auto">
              <h1 className="text-[28px] text-center mb-2">Choose your book format</h1>
              <p className="text-center text-gray-600 mb-4">
                Pick the format that best fits how you'll treasure or gift it.
              </p>
              {/* 一排横向排列，尺寸与 Gift Box 相同，仅排列方式不同 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto w-[80%] md:w-full overflow-x-auto pb-2">
                {bookOptions?.binding_options?.map((option) => {
                  const optionKey = String(option.option_key || option.option_type || '').toLowerCase();
                  const isPremium = optionKey.includes('premium');
                  const isHardcover = optionKey.includes('hard') && !isPremium;
                  const showBadge = isPremium || isHardcover;
                  
                  return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBinding(selectedBinding === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer relative ${
                      selectedBinding === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    {isHardcover && (
                      <div className={`absolute z-10 bg-[#FFE9E9] rounded-bl-[4px] rounded-tr-[2px] px-3 py-1 flex items-center gap-1.5 ${
                        selectedBinding === option.id 
                          ? 'top-0 right-0' 
                          : '-top-[2px] -right-[2px]'
                      }`}>
                        {/* 火焰图标 */}
                        <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.6737 3.42233C8.63033 4.03767 8.256 5.78233 8.38767 6.89067C6.93 5.08067 6.98967 2.999 6.98967 0C2.31433 1.86167 3.40167 7.22967 3.262 8.85967C2.086 7.843 1.86367 5.41433 1.86367 5.41433C0.622333 6.089 0 7.89067 0 9.352C0 12.886 2.712 15.7507 6.058 15.7507C9.40367 15.7507 12.1157 12.886 12.1157 9.352C12.1157 7.252 10.6557 6.283 10.6737 3.422V3.42233Z" fill={`url(#paint0_linear_${option.id})`}/>
                          <defs>
                            <linearGradient id={`paint0_linear_${option.id}`} x1="6.05783" y1="0" x2="5.98755" y2="19.4951" gradientUnits="userSpaceOnUse">
                              <stop offset="0.514424" stopColor="#FF415D"/>
                              <stop offset="1" stopColor="#FF6A1F" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span 
                          className="font-semibold text-[16px] leading-[24px] tracking-[0.5px]"
                          style={{
                            background: 'linear-gradient(180.16deg, #FF415D 63.63%, rgba(255, 106, 31, 0) 123.57%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          Most Popular
                        </span>
                      </div>
                    )}
                    {isPremium && (
                      <div className={`absolute z-10 bg-[#FFF3E9] rounded-bl-[4px] rounded-tr-[2px] px-3 py-1 flex items-center gap-1.5 ${
                        selectedBinding === option.id 
                          ? 'top-0 right-0' 
                          : '-top-[2px] -right-[2px]'
                      }`}>
                        <span className="text-[#FF7B00] font-semibold text-[16px] leading-[24px] tracking-[0.5px]">
                          Lifetime Keepsake
                        </span>
                      </div>
                    )}
                    <Image
                      src={buildBindingImageUrl(option)}
                      alt={option.name}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{option.name}</h2>
                    <p className="text-lg font-medium text-center mb-2">
                      {(() => {
                        // 计算总价：绘本基础价格 + 装订方式的 price_diff
                        const basePrice = getBookBasePrice();
                        const priceDiff = Number(option.price) || 0;
                        const totalPrice = basePrice + priceDiff;
                        
                        // 调试日志
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[Book Format Price]', {
                            bookInfoPrice: (bookInfo as any)?.price,
                            variantPrice: (bookInfo as any)?.variant?.price,
                            currentPrice: (bookInfo as any)?.current_price,
                            basePriceRaw: (bookInfo as any)?.base_price,
                            basePrice,
                            priceDiff,
                            totalPrice,
                            optionName: option.name,
                          });
                        }
                        
                        return (
                          <DisplayPrice value={totalPrice} discount={(totalPrice*0.9).toFixed(2)} />
                        );
                      })()}
                    </p>
                    {option.description && (
                    <p className="text-sm text-gray-500 text-center mb-4 whitespace-pre-line">
                      {option.description}
                    </p>
                    )}
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBinding === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedBinding === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedBinding === option.id
                          ? `${option.name} Selected`
                          : `Select ${option.name}`}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* Book Wrap Section */}
            <section ref={giftBoxRef} className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-[28px] text-center mb-2">Make the surprise complete</h1>
              <p className="text-center text-gray-600 mb-4">
                A lovely gift box makes the surprise truly unforgettable.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookOptions?.gift_box_options?.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedGiftBox(selectedGiftBox === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedGiftBox === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <Image
                      src={getGiftBoxImageUrl(option)}
                      alt={option.name}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{getGiftBoxDisplayName(option.name)}</h2>
                    {option.price != null && (
                      <p className="text-lg font-medium text-center mb-2">
                        {formatOptionPrice(option.price, option.currency_code)}
                      </p>
                    )}
                    
                    <a
                      onClick={(e) => handleViewDetails(option as GiftBoxOption, e)}
                      className="more-details text-[#012CCE] inline-flex items-center justify-center gap-x-2 cursor-pointer mb-2"
                    >
                      More Details
                      <svg
                        className="inline-block align-middle"
                        width="18"
                        height="10"
                        viewBox="0 0 18 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5H17M17 5L12.5 1M17 5L12.5 9"
                          stroke="#012CCE"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedGiftBox === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedGiftBox === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedGiftBox === option.id
                          ? `${option.name} Selected`
                          : `Select ${option.name}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Drawer
              placement="right"
              onClose={() => {
                setDrawerOpen(false);
                setTimeout(() => setDetailModal(null), 300);
              }}
              open={drawerOpen}
              closable={false}
              mask={false}
              width={400}
            >
              {/* 弹出窗口 */}
              {detailModal && (
                <div 
                  ref={drawerRef} 
                  className="
                    w-full flex flex-col h-full"
                >
                  <div className="relative flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        setTimeout(() => setDetailModal(null), 300);
                      }}
                      className="absolute inline-flex items-center gap-x-2"
                    >
                      <svg
                        width="17"
                        height="10"
                        viewBox="0 0 17 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17 5H1M1 5L5.5 1M1 5L5.5 9" stroke="#222222" />
                      </svg>
                      <span>Back</span>
                    </button>

                    {/* 抽屉内容 */}
                    <div className="mt-8 flex flex-col gap-4">
                      <div>
                        <Image
                          src={(detailModal.images && detailModal.images[currentIndex]) || getGiftBoxImageUrl(detailModal)}
                          alt={detailModal.name}
                          width={800}
                          height={600}
                          className="w-full h-auto"
                        />
                        <div className="flex items-center justify-center mt-2 gap-[10px]">
                          <button
                            onClick={() => setCurrentIndex((prev) => prev - 1)}
                            disabled={currentIndex === 0}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 1L1 5M1 5L5 9M1 5H17"
                                stroke="#222222"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <span className="text-sm text-gray-700">
                            {(detailModal.images && detailModal.images.length > 0) ? (currentIndex + 1) : 1}
                            {' '}/{' '}
                            {(detailModal.images && detailModal.images.length > 0) ? detailModal.images.length : 1}
                          </span>
                          <button
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            disabled={!detailModal.images || detailModal.images.length === 0 || currentIndex === detailModal.images.length - 1}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13 1L17 5M17 5L13 9M17 5H1"
                                stroke="#222222"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl">{getGiftBoxDisplayName(detailModal.name)}</h2>
                        {detailModal.description && (
                        <p className="text-gray-600 mt-2">
                          {detailModal.description}
                        </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-6 h-[44px] justify-between">
                    <div className="flex items-end gap-3">
                      <span className="text-[#012CCE] text-3xl font-semibold">
                        {formatOptionPrice(detailModal.price ?? 0, detailModal.currency_code ?? '')}
                      </span>
                    </div>
                    <button 
                      onClick={handleContinue}
                      disabled={isAddingToCart}
                      className={`bg-black text-[#F5E3E3] py-2 px-8 rounded flex items-center justify-center ${
                        isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add to order'
                      )}
                    </button>
                  </div>
                </div>         
              )}
            </Drawer>
          </main>
        )}

        {/* 隐藏的文件输入框 */}
        <input
          ref={giverFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGiverFileSelect}
          className="hidden"
        />
        <input
          ref={momDrawingFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleMomDrawingFileSelect}
          className="hidden"
        />

        {pendingMomDrawingFile && activeMomDrawingPageCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[860px] max-w-[95vw] rounded-sm pt-6 pr-6 pb-4 pl-6 flex flex-col gap-4">
              <GiverAvatarCropper
                uiVariant="openingPage"
                aspectRatio={
                  MOM_COMPOSITE_IMAGE_PLACEMENTS[activeMomDrawingPageCode].width /
                  MOM_COMPOSITE_IMAGE_PLACEMENTS[activeMomDrawingPageCode].height
                }
                outputSize={{
                  width: MOM_COMPOSITE_IMAGE_PLACEMENTS[activeMomDrawingPageCode].width,
                  height: MOM_COMPOSITE_IMAGE_PLACEMENTS[activeMomDrawingPageCode].height,
                }}
                maxSize={1600}
                exportMime="image/png"
                exportQuality={0.92}
                initialSrc={pendingMomDrawingFile}
                onCancel={closeMomDrawingCropper}
                onDone={() => {}}
                resultMode="file"
                onDoneFile={(file) => {
                  const pageCode = activeMomDrawingPageCode;
                  if (!pageCode) {
                    closeMomDrawingCropper();
                    return;
                  }
                  return uploadMomCompositeImage(pageCode, file)
                    .then(() => undefined)
                    .finally(() => {
                      closeMomDrawingCropper();
                    });
                }}
              />
            </div>
          </div>
        )}

        {editField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {editField === 'giver' ? (
              <div className="bg-white w-[860px] max-w-[95vw] rounded-sm pt-6 pr-6 pb-4 pl-6 flex flex-col gap-4">
                {(() => {
                  // 获取bookId（spu）
                  const bookId = searchParams.get('bookid');
                  // 找到显示giver的页面（通常是第二页，idx === 1）
                  const displayedPages = previewData?.preview_data?.filter((p: any) => !(p as any).is_cover) || [];
                  const giverPage = displayedPages.length > 1 ? displayedPages[1] : displayedPages[0];
                  const pageId = giverPage?.page_id;
                  const pageNumber = giverPage?.page_number;
                  // 尝试获取batchId（如果存在）
                  const currentBatchId = (previewData as any)?.batch_id;
                  
                  return (
                    <GiverAvatarCropper
                      uiVariant="openingPage"
                      // 预览页扉页图片：不限制裁剪框比例；导出不固定输出比例，避免在用户选择自由比例时发生拉伸变形
                      maxSize={1600}
                      exportMime="image/jpeg"
                      exportQuality={0.92}
                      spu={bookId || undefined}
                      page={pageId || pageNumber || undefined}
                      batchId={currentBatchId}
                      initialSrc={pendingGiverFile || undefined}
                      onCancel={() => {
                        setEditField(null);
                        setPendingGiverFile(null);
                        if (pendingGiverFile) {
                          URL.revokeObjectURL(pendingGiverFile);
                        }
                      }}
                      // resultMode=file 时不会调用 onDone，但 props 仍要求提供
                      onDone={() => {}}
                      resultMode="file"
                      onDoneFile={(file) => {
                        // 用户上传后：先本地预览（不立刻发后端），等 Canvas 合成完成后再上传合成图
                        try {
                          setGuestUploadRateLimitError(null);
                          const objUrl = URL.createObjectURL(file);
                          setGiverImageUrl(objUrl);
                          // 分层模型：把 giver 文件转成 data URL 存起来，后续 dedication 重绘/上传都带上最新 giver
                          try {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const result = reader.result;
                              if (typeof result === 'string' && result.startsWith('data:')) {
                                p34GiverDataRef.current = result;
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch {}
                          shouldUploadP34ComposedRef.current = true;
                          p34ComposeUploadedRef.current = false;
                          // 上传图片即视为完成 Name on Book
                          setIsNameOnBookCompleted(true);
                        } catch {}
                        setEditField(null);
                        setPendingGiverFile(null);
                        if (pendingGiverFile) {
                          URL.revokeObjectURL(pendingGiverFile);
                        }
                      }}
                    />
                  );
                })()}
              </div>
            ) : (
              // 寄语弹窗：不设死高，提示文案出现时白框随之增高；过高时在弹窗内滚动，避免 Submit 挤出
              <div className="bg-white w-[600px] max-w-[95vw] min-h-[464px] max-h-[90vh] overflow-y-auto rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-7">
                {/* 标题、关闭按钮和填写区域 */}
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Dedication</h2>
                    <button
                      className="text-xl text-gray-500 hover:text-gray-700"
                      onClick={() => setEditField(null)}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <div className="flex text-gray-500 text-sm">
                    <span>
                      There&apos;s 10 line limit (including blank lines)
                    </span>
                  </div>
                  <div className="w-full">
                    <textarea
                      rows={10}
                      value={message}
                      maxLength={MAX_CHARS}
                      onChange={handleMessageChange}
                      placeholder="Please enter your message..."
                      className="w-full p-2 border border-[#E5E5E5] placeholder-[#999999] rounded focus:outline-none ring-0 resize-none"
                    />
                    <div className="flex flex-col items-end gap-1 mt-1">
                      <div className="flex justify-end space-x-4 text-sm">
                        <span
                          className={
                            message.length >= MAX_CHARS
                              ? 'text-red-600'
                              : message.length >= DEDICATION_CHAR_WARN
                                ? 'text-amber-600'
                                : 'text-[#999999]'
                          }
                        >
                          {message.length}/{MAX_CHARS} left
                        </span>
                        <span className="text-[#999999]">
                          {message.split('\n').length}/{MAX_LINES} line
                        </span>
                      </div>
                      {message.length >= MAX_CHARS && (
                        <p className="text-red-600 text-xs text-right max-w-full">
                          Limit reached, please shorten your message
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end mt-auto">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => {
                      // Dedication 更新：通过同样接口上传「已合成（底图 + giver + dedication）」的 p3-4 图片
                      setGuestUploadRateLimitError(null);
                      shouldUploadP34ComposedRef.current = true;
                      p34ComposeUploadedRef.current = false;
                      setDedication(message);
                      setIsDedicationSubmitted(true);
                      setEditField(null);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右侧侧边栏 */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-[280px] bg-white py-[64px]">
        <div className="mx-auto flex flex-col justify-between h-full">
          {/* 顶部区域：侧边栏条目 */}
          <div className="flex flex-col gap-[4px] py-[24px]">
            {sidebarItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const isCompleted = completedSections[item.id as keyof typeof completedSections];
              // 规则：激活 或 完成 都显示为蓝色，其余为灰色
              const iconClass = (isActive || isCompleted) ? "w-full h-full text-[#012CCE]" : "w-full h-full text-[#CCCCCC]";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.id === "giver" || item.id === "dedication" || item.id === "momDrawing") {
                      setActiveTab("Book preview");
                    } else {
                      setActiveTab("Others");
                    }
                    setTimeout(() => {
                      scrollToSection(item.id);
                    }, 100);
                  }}
                  className={`w-full flex flex-col cursor-pointer ${isActive ? 'font-medium' : 'font-normal'}`}
                >
                  {/* 图标和文本在同一行，左对齐 */}
                  <div className="flex">
                    {/* 图标及竖线容器 */}
                    <div className="flex flex-col items-center">
                      {/* 固定为 24x24 的图标 */}
                      <div className="w-[24px] h-[24px] flex items-center justify-center">
                        {completedSections[item.id as keyof typeof completedSections] ? (
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 3.5L5 7L11 1" stroke="#012CCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : React.cloneElement(item.icon, {
                          className: `${item.icon.props.className ?? ""} ${iconClass}`,
                        })}
                      </div>
                      {/* 除最后一项外，图标下方添加灰色竖线 */}
                      {index !== sidebarItems.length - 1 && (
                        <div className="w-px h-[60px] bg-[#CCCCCC] mt-1"></div>
                      )}
                    </div>
                    {/* 文本标签，位于图标右侧并顶端对齐 */}
                    <span className="ml-2 self-start">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto">
            <button
              onClick={handleContinue}
              disabled={isAddingToCart}
              className={`w-full px-6 py-2 rounded flex items-center justify-center ${
                isAddingToCart 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#222222] hover:bg-[#333333] cursor-pointer'
              } text-[#F5E3E3]`}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding to cart...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* status 面板展开时：仅背景页面变暗（不遮住吸底栏内容） */}
      {mobileStatusOpen && (
        <div
          className="fixed inset-0 md:hidden z-40 bg-black/20"
          onClick={() => setMobileStatusOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 手机端吸底进度条和 Continue 按钮 */}
      {/* 在 Giver 添加图片（裁剪弹窗打开）时隐藏该吸底条，避免与弹窗底部区域冲突 */}
      <div
        className={`fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white border-t border-gray-200 ${
          mobileStatusOpen ? '' : 'shadow-lg'
        } ${editField === 'giver' || pendingMomDrawingFile ? 'hidden' : ''}`}
      >
        {/* 状态面板（展开态） */}
        {mobileStatusOpen && (
          <div className="px-6 pt-6 pb-2 flex justify-center">
            {(() => {
              const statuses = isHideOptions
                ? [
                    { id: 'giver', label: 'Name on Book', done: !!completedSections.giver },
                    { id: 'dedication', label: 'Your Special Message', done: !!completedSections.dedication },
                    ...(hasMomCompositePages ? [{ id: 'momDrawing', label: 'Your Drawing', done: !!completedSections.momDrawing }] : []),
                  ]
                : [
                    { id: 'giver', label: 'Name on Book', done: !!completedSections.giver },
                    { id: 'dedication', label: 'Your Special Message', done: !!completedSections.dedication },
                    ...(hasMomCompositePages ? [{ id: 'momDrawing', label: 'Your Drawing', done: !!completedSections.momDrawing }] : []),
                    { id: 'coverDesign', label: 'Cover Design', done: !!completedSections.coverDesign },
                    { id: 'binding', label: 'Book Format', done: !!completedSections.binding },
                    { id: 'giftBox', label: 'Add Extras', done: !!completedSections.giftBox },
                  ];

              const firstIncomplete = statuses.findIndex(s => !s.done);
              const activeIndex = firstIncomplete === -1 ? statuses.length - 1 : firstIncomplete;

              return (
                <div className="bg-white w-full max-w-[320px]">
                  {/* 让“圆点+文字”这一组整体居中 */}
                  <div className="flex flex-col items-center">
                    {statuses.map((s, idx) => {
                      const isActive = idx === activeIndex;
                      const isCompleted = !!s.done;
                      const isBlueDot = isActive || isCompleted;
                      const dotClass = isBlueDot ? 'bg-[#012CCE]' : 'bg-gray-300';
                      // 竖线：每个“蓝点”后面的第一段线都应该是蓝色（线段跟随左侧点）
                      const lineClass = isBlueDot ? 'bg-[#012CCE]' : 'bg-gray-200';
                      return (
                        <div key={s.id} className="flex gap-3 justify-center">
                          <div className="flex flex-col items-center pt-2 flex-none">
                            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                            {idx < statuses.length - 1 && <div className={`w-px h-5 mt-2 ${lineClass}`} />}
                          </div>
                          <div className="w-[170px]">
                            <div className="text-[16px] leading-[24px] tracking-[0.15px] font-medium text-[#222222] text-start">
                              {s.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 进度指示器 */}
        <div className="flex items-center justify-center px-4 pt-4 pb-2">
          {(() => {
            const steps = isHideOptions
              ? [
                  { id: 'giver', completed: completedSections.giver },
                  { id: 'dedication', completed: completedSections.dedication },
                  ...(hasMomCompositePages ? [{ id: 'momDrawing', completed: completedSections.momDrawing }] : []),
                ]
              : [
                  { id: 'giver', completed: completedSections.giver },
                  { id: 'dedication', completed: completedSections.dedication },
                  ...(hasMomCompositePages ? [{ id: 'momDrawing', completed: completedSections.momDrawing }] : []),
                  { id: 'coverDesign', completed: completedSections.coverDesign },
                  { id: 'binding', completed: completedSections.binding },
                  { id: 'giftBox', completed: completedSections.giftBox },
                ];

            // 和 status 面板保持一致：当前步骤（第一个未完成）也显示为蓝色
            const firstIncomplete = steps.findIndex(s => !s.completed);
            const activeIndex = firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
            
            return (
              <div className="flex items-center w-full">
                <div className="flex items-center flex-1">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      {(() => {
                        const isBlueDot = step.completed || index === activeIndex;
                        const dotColor = isBlueDot ? 'bg-[#012CCE]' : 'bg-gray-300';
                        // 横线：每个“蓝点”后面的第一段线都应该是蓝色（线段跟随左侧点）
                        const lineColor = isBlueDot ? 'bg-[#012CCE]' : 'bg-gray-300';
                        return (
                          <>
                      <div
                        className={`w-2 h-2 rounded-full ${dotColor}`}
                      />
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-3 ${
                            // 横线也跟随“完成/当前”变蓝
                            lineColor
                          }`}
                        />
                      )}
                          </>
                        );
                      })()}
                    </React.Fragment>
                  ))}
                </div>

                {/* 右侧箭头（展开/收起状态面板） */}
                <button
                  type="button"
                  className="ml-3 text-gray-400"
                  aria-label={mobileStatusOpen ? 'Collapse status' : 'Expand status'}
                  onClick={() => setMobileStatusOpen(v => !v)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-200 ${mobileStatusOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M6 14L12 8L18 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })()}
        </div>

        {/* Continue / Add to cart 按钮 */}
        <div className="px-4 pb-4">
          {(() => {
            // 检查所有必填项是否完成（排除 giver）
            const requiredSteps = [
              { id: 'dedication', completed: completedSections.dedication },
              { id: 'coverDesign', completed: completedSections.coverDesign },
              { id: 'binding', completed: completedSections.binding },
              { id: 'giftBox', completed: completedSections.giftBox },
            ];
            const allRequiredCompleted = requiredSteps.every(step => step.completed);
            
            if (allRequiredCompleted) {
              // 所有必填项都完成了，显示 Add to cart 按钮
              return (
                <button
                  onClick={handleContinue}
                  disabled={isAddingToCart}
                  className={`w-full py-3 rounded-lg font-medium text-base ${
                    isAddingToCart
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Adding to cart...
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              );
            } else {
              // 还有未完成的必填项，显示 Continue 按钮
              return (
                <button
                  onClick={() => {
                    // 找到第一个未完成的必填步骤（排除 giver）
                    const requiredSteps = [
                      { id: 'dedication', ref: dedicationRef, completed: completedSections.dedication },
                      { id: 'coverDesign', ref: coverDesignRef, completed: completedSections.coverDesign },
                      { id: 'binding', ref: bindingRef, completed: completedSections.binding },
                      { id: 'giftBox', ref: giftBoxRef, completed: completedSections.giftBox },
                    ];
                    
                    const firstIncomplete = requiredSteps.find((step) => !step.completed);
                    
                    if (firstIncomplete) {
                      // 如果是 coverDesign, binding, giftBox，需要切换到 Others tab
                      if (['coverDesign', 'binding', 'giftBox'].includes(firstIncomplete.id)) {
                        if (activeTab !== 'Others') {
                          setActiveTab('Others');
                          // 等待 tab 切换后再滚动
                          setTimeout(() => {
                            if (firstIncomplete.ref?.current) {
                              firstIncomplete.ref.current.scrollIntoView({ behavior: 'smooth' });
                              setActiveSection(firstIncomplete.id);
                            }
                          }, 100);
                        } else {
                          scrollToSection(firstIncomplete.id);
                        }
                      } else {
                        // dedication 在 Book preview tab
                        if (activeTab !== 'Book preview') {
                          setActiveTab('Book preview');
                          setTimeout(() => {
                            if (firstIncomplete.ref?.current) {
                              firstIncomplete.ref.current.scrollIntoView({ behavior: 'smooth' });
                              setActiveSection(firstIncomplete.id);
                            }
                          }, 100);
                        } else {
                          scrollToSection(firstIncomplete.id);
                        }
                      }
                    }
                  }}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium text-base"
                >
                  Continue
                </button>
              );
            }
          })()}
        </div>
      </div>

      {guestUploadRateLimitError && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setGuestUploadRateLimitError(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-sm border border-[#E7D6D6] bg-[#FFF9F9] p-6 shadow-[0_8px_24px_rgba(34,34,34,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGuestUploadRateLimitError(null)}
              className="absolute right-4 top-4 text-xl leading-none text-[#8E92A7] transition-colors hover:text-[#222222]"
              aria-label="Dismiss"
            >
              &times;
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E3E3] text-[#222222]">
                <span className="text-lg leading-none">!</span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-base font-semibold text-[#222222]">{guestUploadRateLimitError.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-[#6F7280]">{guestUploadRateLimitError.message}</div>
                {guestUploadRateLimitError.retryText && (
                  <div className="mt-2 text-sm leading-relaxed text-[#8E92A7]">
                    You can try again in about {guestUploadRateLimitError.retryText}, or sign in now.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGuestRateLimitLogin}
                  className="mt-5 h-[40px] w-full rounded-sm bg-[#222222] px-5 text-sm font-medium text-[#F5E3E3] transition-colors hover:bg-black sm:w-auto"
                >
                  Log in to continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

