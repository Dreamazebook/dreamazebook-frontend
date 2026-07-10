'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams, usePathname } from 'next/navigation';
import { Drawer } from "antd";
import { create } from 'zustand';
import { IoIosArrowBack } from '@/utils/icons';

import Image from 'next/image';
import GiverDedicationCanvas from './components/GiverDedicationCanvas';
import GiverAvatarCropper from './components/GiverAvatarCropper';
import CoverNameCanvas from './components/CoverNameCanvas';
import CoverSpreadFrame from './components/CoverSpreadFrame';
import { DreamazeFaceSwapLoadingBar } from './components/DreamazeFaceSwapLoadingBar';
import DreamazeLogoRainbowLoader from './components/DreamazeLogoRainbowLoader';
import FaceSwapVersionCarousel from './components/FaceSwapVersionCarousel';
import api, {
  GUEST_SESSION_HEADER,
  fetchDreamazebookApi,
  readGuestSessionId,
  writeGuestSessionId,
} from '@/utils/api';
import echo from '@/app/config/echo';
import { useTranslations, useLocale } from 'next-intl';
import useImageUpload from '../hooks/useImageUpload';
import useUserStore from '@/stores/userStore';
import usePreviewStore from '@/stores/previewStore';
import { mapAgeStageUiToBackend } from '@/utils/mapAgeStageToBackend';
import { buildPreviewRenderPayload } from '@/utils/previewRenderPayload';
import { getApiBaseUrl } from '@/utils/apiBaseUrl';
import { getBirthdayCoverSeasonFromCharacterLike } from '@/utils/birthdayPersonalizeHelpers';
import toast from 'react-hot-toast';
import { IoCloseOutline, IoCheckmarkOutline } from '@/utils/icons';
import { PreviewResponse, PreviewCharacter, PreviewPage, FaceSwapBatch, ApiResponse, CartAddRequest, CartAddResponse } from '@/types/api';
import { BaseBook, DetailedBook } from '@/types/book';
import { API_CART_LIST, API_CART_UPDATE, API_ORDER_CREATE } from '@/constants/api';
import { ORDER_CHECKOUT_URL } from '@/constants/links';
import DisplayPrice from '../components/component/DisplayPrice';
import { fbTrack, getContentIdBySpu } from '@/utils/track';
import { shouldBypassNextImageOptimization } from '@/utils/previewImageOptimization';
import {
  getProtectedPreviewImageProps,
  pickLowResPreviewRaw,
  PREVIEW_DISPLAY_QUALITY,
  PREVIEW_PROTECTED_IMAGE_CLASS,
  preventPreviewImageContextMenu,
  toLowResPreviewSrc,
} from '@/utils/previewImageProtection';
import {
  batchHasPendingFaceSwapLogs,
  fetchPreviewBatch,
  getBatchDisplayPages,
  mapBatchPageToPreviewPage,
  pickBatchPageImageRaw,
  pickPreviewPageIdFromBatchPage,
  type PreviewPageWithFaceSwapLogs,
  unwrapPreviewBatch,
} from '@/utils/previewFaceSwapVersions';
import {
  buildCoverTextVariables,
  canDrawCoverTexts,
  getCoverTextCacheKey,
} from '@/utils/coverTextVariables';
import {
  coverFitFrameImageClass,
  coverNaturalImageClass,
  coverSpreadImageStyle,
  getCoverDisplayDimensions,
  resolveCoverNumericId,
  shouldCropCoverRightHalf,
} from '@/utils/coverSpreadHelpers';
import { isPicbookDad } from '@/utils/isPicbookDad';

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
    fontStyle: t?.fontStyle ?? t?.font_style,
  }));
};

const getFirstNonEmptyCoverValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const resolveCoverDadName = (previewStoreUserData: any, previewData: any) => {
  try {
    const storeChar = previewStoreUserData?.characters?.[0];
    let lsChar: any = null;
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('previewUserData');
      if (ls) lsChar = JSON.parse(ls)?.characters?.[0];
    }
    const batchOptions = (previewData as any)?.batch_options;
    return getFirstNonEmptyCoverValue(
      storeChar?.attributes?.dad_name,
      storeChar?.dadTitle,
      lsChar?.attributes?.dad_name,
      lsChar?.dadTitle,
      batchOptions?.dad_name,
      batchOptions?.attributes?.dad_name,
    );
  } catch {
    return '';
  }
};

// 叠字后封面的 DataURL 缓存：避免每次进入 Tab 都重新用 Canvas 合成
const coverComposedImageCache: Record<string, string> = {};
const COVER_COMPOSE_CACHE_VERSION = 'rowdies-v2';

const isP34PageCode = (pageCode: unknown): boolean => {
  const code = String(pageCode || '');
  return code === 'p3-4' || code === 'p3-p4';
};

const isCoverPage = (p: { page_code?: string; page_type?: string } | null | undefined): boolean => {
  if (!p) return false;
  if (String(p.page_type || '').toLowerCase() === 'cover') return true;
  const code = String(p.page_code || '');
  return /^cover([_-]\d+)?$/i.test(code);
};

const shouldShowInBookPreviewTab = (p: { page_code?: string; page_type?: string; is_cover?: boolean } | null | undefined): boolean => {
  if (!p) return false;
  const pageCode = String(p.page_code || '').toLowerCase().replace(/-/g, '_');
  if (pageCode === 'cover_3' || pageCode === 'cover_4') return false;
  if (p.is_cover || isCoverPage(p)) return false;
  return true;
};

/** Book preview 正文列表：始终过滤 cover_3/4 等封面页 */
const getDisplayedPreviewPages = (pages: any[] | undefined | null): any[] => {
  return (pages ?? []).filter((p) => shouldShowInBookPreviewTab(p));
};

function getPreviewPageCodeLookupKey(pageCode: unknown): string {
  return String(pageCode || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/^p(\d+)-p(\d+)$/, 'p$1-$2');
}

function hasRenderablePreviewImage(page: any): boolean {
  return Boolean(pickBatchPageImageRaw(page));
}

/** Guest unlock gate：P10（或止于 10 的跨页）已有可展示图 */
const isP10PageCode = (pageCode: unknown): boolean => {
  const code = getPreviewPageCodeLookupKey(pageCode);
  if (!code) return false;
  if (code === 'p10') return true;
  // 跨页如 p9-10 / p9-p10
  return /^p\d+-10$/.test(code);
};

const hasGuestPreviewUnlockReady = (
  pages: any[] | undefined | null,
  previewPagesCount: number | null,
): boolean => {
  const displayed = getDisplayedPreviewPages(pages);
  const p10 = displayed.find((p) => isP10PageCode(p?.page_code));
  if (p10 && hasRenderablePreviewImage(p10)) return true;

  // 无显式 p10 时：以产品配置的 preview 页数作为锁定边界
  if (previewPagesCount != null && previewPagesCount > 0) {
    const readyCount = displayed.filter((p) => hasRenderablePreviewImage(p)).length;
    return readyCount >= previewPagesCount;
  }

  return false;
};

function preservePreviewImageFields(page: any, prevPage: any) {
  if (!prevPage || hasRenderablePreviewImage(page)) return page;
  if (!hasRenderablePreviewImage(prevPage)) return page;
  return {
    ...page,
    image_url: prevPage.image_url ?? page.image_url,
    final_image_url: prevPage.final_image_url ?? page.final_image_url,
    base_image_url: prevPage.base_image_url ?? page.base_image_url,
    composite_image_url: prevPage.composite_image_url ?? page.composite_image_url,
    raw_image_url: prevPage.raw_image_url ?? page.raw_image_url,
    base_stage_url: prevPage.base_stage_url ?? page.base_stage_url,
    final_stage_url: prevPage.final_stage_url ?? page.final_stage_url,
    template_image_url: prevPage.template_image_url ?? page.template_image_url,
  };
}

function mapBatchToPreviewDataPages(
  batch: any,
  includeFullBook: boolean,
  options?: {
    localP34Composed?: string | null;
    prevByPageCode?: Record<string, any>;
  },
) {
  const sourcePages = getBatchDisplayPages(batch, { includeFullBook });
  return sourcePages.map((bp: any, idx: number) => {
    const prevPage = options?.prevByPageCode?.[getPreviewPageCodeLookupKey(bp.page_code)];
    const page: PreviewPageWithFaceSwapLogs & { is_cover?: boolean; giver_data?: unknown } = {
      ...mapBatchPageToPreviewPage(bp, idx),
      is_cover: isCoverPage(bp),
    };
    if (isP34PageCode(bp.page_code) && (bp as any).giver_data === undefined && prevPage?.giver_data) {
      page.giver_data = prevPage.giver_data;
    }
    if (prevPage?.face_swap_logs?.length && !(page.face_swap_logs?.length)) {
      page.face_swap_logs = prevPage.face_swap_logs;
    }
    const localP34Composed = options?.localP34Composed;
    if (localP34Composed && isP34PageCode(bp.page_code)) {
      return {
        ...page,
        image_url: localP34Composed,
        final_image_url: localP34Composed,
      };
    }
    return preservePreviewImageFields(page, prevPage);
  });
}

const hasMeaningfulFinalImage = (page: any): boolean => {
  const finalRaw = String(page?.final_image_url || '').trim();
  if (!finalRaw) return false;
  const imageRaw = String(page?.image_url || '').trim();
  const baseRaw = String(page?.base_image_url || '').trim();
  const compareBase = baseRaw || (imageRaw && imageRaw !== finalRaw ? imageRaw : '');
  return !compareBase || finalRaw !== compareBase;
};

const getPreviewDisplayImageRaw = (page: any): string => {
  const compositeRaw = String(page?.composite_image_url || '').trim();
  if (compositeRaw) return compositeRaw;
  const lowRes = pickLowResPreviewRaw(page);
  if (lowRes) return lowRes;
  if (hasMeaningfulFinalImage(page)) return String(page?.final_image_url || '');
  const mapped = pickBatchPageImageRaw(page);
  if (mapped) return mapped;
  return String(page?.base_image_url || page?.image_url || page?.final_image_url || '');
};

/** 与预览页 buildImageUrl 对齐，用于上传成功后预解码 CDN（避免 revoke blob 早于下方 img 切图导致闪白） */
function buildPreviewImageSrcForProbe(imagePath: string): string {
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
}

const normalizePreviewPageCode = (pageCode: unknown): string =>
  String(pageCode || '').trim().toLowerCase().replace(/_/g, '-');

const MOM_COMPOSITE_PAGE_CODES = new Set(['p5-6', 'p5-p6', 'p27-28', 'p27-p28']);
const MOM_COMPOSITE_IMAGE_PLACEMENTS: Record<'p5-6' | 'p27-28', { x: number; y: number; width: number; height: number }> = {
  'p5-6': { x: 2902, y: 718, width: 1315, height: 840 },
  'p27-28': { x: 3154, y: 639, width: 908, height: 580 },
};

const isMomCompositePageCode = (pageCode: unknown): boolean =>
  MOM_COMPOSITE_PAGE_CODES.has(normalizePreviewPageCode(pageCode));

const toMomCompositeUploadPageCode = (pageCode: unknown): 'p5-6' | 'p27-28' | null => {
  const normalized = normalizePreviewPageCode(pageCode);
  if (normalized === 'p5-6' || normalized === 'p5-p6') return 'p5-6';
  if (normalized === 'p27-28' || normalized === 'p27-p28') return 'p27-28';
  return null;
};

/** Continue/Next 队列里 Mom 两站 drawing 分两条 optional，各自 soft acknowledge */
const MOM_DRAWING_PROMPT_PREFIX = 'momDrawing:';

function momDrawingPromptSectionId(code: 'p5-6' | 'p27-28'): string {
  return `${MOM_DRAWING_PROMPT_PREFIX}${code}`;
}

function parseMomDrawingPromptSectionId(sectionId: string): 'p5-6' | 'p27-28' | null {
  if (!sectionId.startsWith(MOM_DRAWING_PROMPT_PREFIX)) return null;
  const rest = sectionId.slice(MOM_DRAWING_PROMPT_PREFIX.length);
  return rest === 'p5-6' || rest === 'p27-28' ? (rest as 'p5-6' | 'p27-28') : null;
}

/**
 * 顶栏占位兜底（未拿到 DOM 测量时）：12 + 48 + pb + safe-area 粗估值
 * 正常路径使用固定壳 ref 的 getBoundingClientRect().bottom
 */
const PREVIEW_FIXED_TOP_NAV_FALLBACK_PX = 48;

/** 相对 Tab 下方可视区域滚动；可附带 ref 下方 companion 区域（如按钮行） */
function scrollPreviewElementIntoComfortableCenter(
  el: HTMLElement,
  topInsetPx?: number,
  opts?: { anchorFraction?: number; bottomInsetPx?: number; companionBelowPx?: number },
) {
  if (typeof window === 'undefined') return;
  const rect = el.getBoundingClientRect();
  const topInset =
    typeof topInsetPx === 'number' && Number.isFinite(topInsetPx)
      ? topInsetPx
      : PREVIEW_FIXED_TOP_NAV_FALLBACK_PX;
  const bottomInset = opts?.bottomInsetPx ?? 0;
  const companionBelow = opts?.companionBelowPx ?? 0;
  const viewportH = window.innerHeight;
  const visibleHeight = Math.max(0, viewportH - topInset - bottomInset);
  const gap = 10;
  const effectiveBottom = rect.bottom + companionBelow;
  const effectiveHeight = effectiveBottom - rect.top;
  const anchorFraction = opts?.anchorFraction ?? 0.5;
  const maxBottomY = viewportH - bottomInset - gap;

  let delta: number;
  const fitsInVisibleBand = effectiveHeight <= visibleHeight - gap * 2;
  if (!fitsInVisibleBand) {
    // 高于可视区：顶对齐；仅在有 companion（如 giver 下方按钮）时再补底
    delta = rect.top - (topInset + gap);
    if (companionBelow > 0) {
      const projectedBottom = effectiveBottom - delta;
      if (projectedBottom > maxBottomY) {
        delta += projectedBottom - maxBottomY;
      }
    }
  } else {
    const visibleAnchorY = topInset + visibleHeight * anchorFraction;
    const elementMidY = rect.top + effectiveHeight / 2;
    delta = elementMidY - visibleAnchorY;
    const maxDeltaKeepTopClear = rect.top - (topInset + gap);
    if (delta > maxDeltaKeepTopClear) {
      delta = maxDeltaKeepTopClear;
    }
    const projectedBottom = effectiveBottom - delta;
    if (projectedBottom > maxBottomY) {
      delta += projectedBottom - maxBottomY;
    }
  }

  if (Math.abs(delta) < 1) return;
  window.scrollBy({ top: delta, behavior: 'smooth' });
}

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
  /** 换脸后的整页 stage（p27-28 拼贴 drawing 须以此为底图） */
  final_stage_url?: string;
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

const composeMomCompositeCanvas = async (
  baseImageUrl: string,
  overlayFile: File,
  placement: { x: number; y: number; width: number; height: number },
  overlayMode: 'placement' | 'full-page' = 'placement',
): Promise<HTMLCanvasElement> => {
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
    return canvas;
  }

  const { sx, sy, sw, sh } = computeCenteredCropForAspectRatio(
    overlayImage.naturalWidth || overlayImage.width,
    overlayImage.naturalHeight || overlayImage.height,
    placement.width / placement.height,
  );
  ctx.drawImage(overlayImage, sx, sy, sw, sh, placement.x, placement.y, placement.width, placement.height);
  return canvas;
};

/** multipart 上传：`canvas.toBlob` → FormData `image`（仅 WebP） */
const composeMomCompositeImageBlob = (
  canvas: HTMLCanvasElement,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob && blob.size > 0) resolve(blob);
        else reject(new Error('Canvas toBlob (image/webp) produced empty blob'));
      },
      'image/webp',
      0.92,
    );
  });

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

  const preferNativeImg =
    useNativeImg ||
    shouldBypassNextImageOptimization(src) ||
    shouldBypassNextImageOptimization(currentSrc);

  const {
    priority: _priority,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    fill: _fill,
    sizes: _sizes,
    quality: _quality,
    onLoadingComplete: _onLoadingComplete,
    unoptimized: _unoptimized,
    ...restImageProps
  } = props || {};

  if (imgError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`} style={style}>
        <p className="text-gray-500 text-sm">Page image failed to load</p>
      </div>
    );
  }

  if (preferNativeImg) {
    const protectedSrc = toLowResPreviewSrc(currentSrc);
    const protectProps = getProtectedPreviewImageProps();
    return (
      <img
        src={protectedSrc}
        alt={alt}
        width={width}
        height={height}
        className={[PREVIEW_PROTECTED_IMAGE_CLASS, className].filter(Boolean).join(' ')}
        style={{ WebkitTouchCallout: 'none', ...style }}
        onError={handleNativeImgError}
        onLoad={(e) => {
          onLoad?.(e);
          onLoadingComplete?.(e.currentTarget);
        }}
        {...protectProps}
        {...restImageProps}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={[PREVIEW_PROTECTED_IMAGE_CLASS, className].filter(Boolean).join(' ')}
      style={{ WebkitTouchCallout: 'none', ...style }}
      quality={PREVIEW_DISPLAY_QUALITY}
      draggable={false}
      onContextMenu={preventPreviewImageContextMenu}
      onDragStart={preventPreviewImageContextMenu}
      unoptimized={
        shouldBypassNextImageOptimization(src) ||
        shouldBypassNextImageOptimization(currentSrc)
      }
      onError={handleNextImageError}
      onLoad={onLoad}
      onLoadingComplete={onLoadingComplete}
      {...restImageProps}
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
  displayAspectRatio,
  recipient,
  coverTextVariables,
}: {
  bookId: string | null;
  option: CoverOption;
  baseSrc: string;
  displayAspectRatio: number;
  recipient: string;
  coverTextVariables: ReturnType<typeof buildCoverTextVariables>;
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
    const coverId = resolveCoverNumericId(option);

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
  const canDrawName = canDrawCoverTexts(texts, coverTextVariables);

  // 如果已经有缓存的合成图片，直接使用，避免再次 Canvas 绘制
  const upperBookId = (bookId || '').toUpperCase();
  const coverId = resolveCoverNumericId(option);
  const variablesKey = getCoverTextCacheKey(coverTextVariables);
  const composedKey = `${upperBookId}_${coverId}_${variablesKey}_${baseSrc}_${COVER_COMPOSE_CACHE_VERSION}`;
  const handleCoverRendered = useCallback((dataUrl: string) => {
    coverComposedImageCache[composedKey] = dataUrl;
    setComposedUrl(dataUrl);
  }, [composedKey]);

  useEffect(() => {
    if (!canDrawName) {
      setComposedUrl(null);
      return;
    }
    if (coverComposedImageCache[composedKey]) {
      setComposedUrl(coverComposedImageCache[composedKey]);
    }
  }, [composedKey, canDrawName]);

  const coverDims = getCoverDisplayDimensions(displayAspectRatio);

  if (composedUrl) {
    return (
      <CoverSpreadFrame cropRightHalf={false}>
        <Image
          src={composedUrl}
          alt={`Cover ${option.id} - ${option.name}`}
          width={coverDims.width}
          height={coverDims.height}
          unoptimized
          className={coverNaturalImageClass}
        />
      </CoverSpreadFrame>
    );
  }

  if (canDrawName) {
    return (
      <CoverSpreadFrame cropRightHalf={false}>
        <CoverNameCanvas
          src={baseSrc}
          name={trimmedName}
          variables={coverTextVariables}
          texts={texts as any}
          className={coverNaturalImageClass}
          onRendered={handleCoverRendered}
        />
      </CoverSpreadFrame>
    );
  }

  // 无文本配置或没有名字时，回退为普通封面图片
  return (
    <CoverSpreadFrame cropRightHalf={false}>
      <Image
        src={baseSrc}
        alt={`Cover ${option.id} - ${option.name}`}
        width={coverDims.width}
        height={coverDims.height}
        unoptimized={shouldBypassNextImageOptimization(baseSrc)}
        className={coverNaturalImageClass}
      />
    </CoverSpreadFrame>
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
  viewMode: 'double',
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
  showLoadingPlaceholder = true,
  doubleImageAreaClassName,
  leftSingleFrameClassName,
  rightSingleFrameClassName,
  scrollAnchorSingleRightRef,
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
  showLoadingPlaceholder?: boolean;
  /** 双页模式：仅包住整页预览图区域（不含下方按钮） */
  doubleImageAreaClassName?: string;
  /** 单页模式左半图外框 class（如缺失项高亮） */
  leftSingleFrameClassName?: string;
  /** 单页模式右半图外框 class */
  rightSingleFrameClassName?: string;
  /** 单页模式：滚动定位锚点（如 Mom drawing 应对齐右侧含按钮的半页） */
  scrollAnchorSingleRightRef?: React.Ref<HTMLDivElement | null>;
}) {
  const t = useTranslations('Preview');
  const protectedImgProps = getProtectedPreviewImageProps();
  const protectedImgClass = PREVIEW_PROTECTED_IMAGE_CLASS;
  const protectedImgStyle = { WebkitTouchCallout: 'none' as const };
  const notifiedRef = useRef(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
    notifiedRef.current = false;
  }, [src]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    try {
      onImageLoaded?.(pageId);
    } catch {}
  };

  const showImageLoadingPlaceholder = showLoadingPlaceholder && !showOverlay && !isImageLoaded;

  const imageLoadingPlaceholder = showImageLoadingPlaceholder ? (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white"
      aria-hidden={!showImageLoadingPlaceholder}
    >
      <DreamazeLogoRainbowLoader size={60} />
    </div>
  ) : null;

  if (viewMode === 'single') {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        {/* 左半部分 */}
        <div className="w-full flex justify-center">
          <div
            className={`relative max-w-[500px] w-full ${leftSingleFrameClassName ?? ''}`.trim()}
            style={{ aspectRatio: '512/519' }}
          >
            {showOverlay ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt={`Page ${pageNumber} - Left Half`}
                    className={`${protectedImgClass} object-cover rounded-lg`}
                    style={{ 
                      objectPosition: 'left center',
                      width: '100%',
                      height: '100%',
                      ...protectedImgStyle,
                    }}
                    onLoad={handleImageLoad}
                    {...protectedImgProps}
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
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg bg-white">
                <img
                  src={src}
                  alt={`Page ${pageNumber} - Left Half`}
                  className={`${protectedImgClass} object-cover rounded-lg`}
                  style={{ 
                    objectPosition: 'left center',
                    width: '100%',
                    height: '100%',
                    ...protectedImgStyle,
                  }}
                  onError={() => {
                    console.error(`图片加载失败: ${src}`);
                  }}
                  onLoad={() => {
                    console.log(`图片加载成功: ${src}`);
                    handleImageLoad();
                  }}
                  {...protectedImgProps}
                />
                {imageLoadingPlaceholder}
              </div>
            )}
          </div>
        </div>
        
        {/* 右半部分 */}
        <div ref={scrollAnchorSingleRightRef ?? undefined} className="w-full flex justify-center">
          <div
            className={`relative max-w-[500px] w-full ${rightSingleFrameClassName ?? ''}`.trim()}
            style={{ aspectRatio: '512/519' }}
          >
            {showOverlay ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt={`Page ${pageNumber} - Right Half`}
                    className={`${protectedImgClass} object-cover rounded-lg`}
                    style={{ 
                      objectPosition: 'right center',
                      width: '100%',
                      height: '100%',
                      ...protectedImgStyle,
                    }}
                    onLoad={handleImageLoad}
                    {...protectedImgProps}
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
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg bg-white">
                <img
                  src={src}
                  alt={`Page ${pageNumber} - Right Half`}
                  className={`${protectedImgClass} object-cover rounded-lg`}
                  style={{ 
                    objectPosition: 'right center',
                    width: '100%',
                    height: '100%',
                    ...protectedImgStyle,
                  }}
                  onError={() => {
                    console.error(`图片加载失败: ${src}`);
                  }}
                  onLoad={() => {
                    console.log(`图片加载成功: ${src}`);
                    handleImageLoad();
                  }}
                  {...protectedImgProps}
                />
                {imageLoadingPlaceholder}
              </div>
            )}
            {customOverlayContent && isImageLoaded && !showOverlay && (
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
  const doubleFrame = `w-full relative ${doubleImageAreaClassName ?? ''}`.trim();
  return (
    <div className="w-full relative">
      {showOverlay ? (
        <div className={doubleFrame}>
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
          {customOverlayContent && isImageLoaded && !showOverlay && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {customOverlayContent}
            </div>
          )}
        </div>
      ) : (
        <div className={`${doubleFrame} bg-white rounded-lg`} style={{ aspectRatio: '1600 / 600' }}>
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
          {imageLoadingPlaceholder}
          {customOverlayContent && isImageLoaded && (
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
    prev.customOverlayContent === next.customOverlayContent &&
    prev.doubleImageAreaClassName === next.doubleImageAreaClassName &&
    prev.leftSingleFrameClassName === next.leftSingleFrameClassName &&
    prev.rightSingleFrameClassName === next.rightSingleFrameClassName &&
    prev.scrollAnchorSingleRightRef === next.scrollAnchorSingleRightRef
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

interface BindingTypePrice {
  sku_code?: string;
  binding_type?: string;
  binding_type_label?: string;
  attributes?: {
    binding_type?: string;
  };
  price?: number | string;
  current_price?: number | string;
  final_unit_price?: number | string;
  unit_price?: number | string;
  original_unit_price?: number | string;
  original_price?: number | string;
  market_price?: number | string;
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
  const { user, isLoggedIn, openLoginModal } = useUserStore();
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

  const displayViewMode = viewMode;

  const previewStoreUserData = usePreviewStore((s) => s.userData);
  const isGuest = !isLoggedIn;

  const openPreviewUnlockLogin = useCallback(() => {
    openLoginModal({
      title: t('unlockFullBookTitle'),
      footerNote: t('unlockFullBookFooter'),
      sendCodeButtonLabel: t('continueWithEmailCode'),
      loginSource: 'preview_unlock',
    });
  }, [openLoginModal, t]);

  const handleGuestRateLimitLogin = useCallback(() => {
    setGuestUploadRateLimitError(null);
    openPreviewUnlockLogin();
  }, [openPreviewUnlockLogin]);

  // KS 流程：通过查询参数关闭 Others 标签
  const isKs = searchParams.get('ks') === '1';
  // 圣诞 bundle：通过查询参数关闭 Others(Options) 标签
  const isHideOptions = searchParams.get('hideOptions') === '1';
  const tabParam = searchParams.get('tab');
  const isCartOptionEdit =
    !!searchParams.get('fromCartItemId') &&
    (tabParam === 'giftOptions' || tabParam === 'options' || tabParam === 'giftBox' || tabParam === 'addons');
  // regenerate-preview 复用当前 batch、或从购物车只编辑 options 时，不再用本地 previewUserData 触发二次 render
  const shouldSkipInitialRender = searchParams.get('skipRender') === '1' || isCartOptionEdit;
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
      if (ud && !shouldSkipInitialRender) {
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
          const batch = unwrapPreviewBatch(res);
          
          if (batch) {
             console.log('[Preview] Loaded batch directly:', batch);
             
             // 从 batch 中获取 recipient_name
             // 注意：如果是从 personalized-product 进入的（store 中有数据），优先使用 store 中的名字
             const storeUserData = usePreviewStore.getState().userData as any;
             const storeName = storeUserData?.characters?.[0]?.full_name;
             
             recipientNameFromBatch = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name || null;
             // 如果 store 中有名字（从 personalized-product 进入），使用 store 中的名字
             // 否则使用 batch 中的名字
             if (!shouldSkipInitialRender && storeName && typeof storeName === 'string' && storeName.trim()) {
               setRecipient(storeName);
               console.log('[Preview] Set recipient from store (from personalized-product):', storeName);
             } else if (recipientNameFromBatch && typeof recipientNameFromBatch === 'string' && recipientNameFromBatch.trim()) {
               setRecipient(recipientNameFromBatch);
               console.log('[Preview] Set recipient from batch:', recipientNameFromBatch);
             }
             
             if (getBatchDisplayPages(batch, { includeFullBook: isLoggedIn }).length > 0) {
               // 构造 previewData
               const initialData = {
                  preview_id: undefined as any,
                  preview_data: mapBatchToPreviewDataPages(batch, isLoggedIn),
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
            
            if ((!recipientNameFromBatch || recipientNameFromBatch.trim() === '') && (shouldSkipInitialRender || !storeName || !storeName.trim())) {
              const rname =
                match?.preview?.recipient_name ||
                match?.full_name ||
                match?.customization_data?.full_name ||
                match?.customization_data?.attributes?.full_name;
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

  // 预览页固定使用 double page 视图
  const hasSetInitialViewMode = useRef(false);
  useEffect(() => {
    if (hasSetInitialViewMode.current) return;
    hasSetInitialViewMode.current = true;
    setViewMode('double');
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
  const coverTextVariables = useMemo(
    () =>
      buildCoverTextVariables({
        name: recipient,
        dadName: resolveCoverDadName(previewStoreUserData, previewData),
      }),
    [recipient, previewStoreUserData, previewData],
  );
  // 顶部队列提示（原 “Your story is coming to life…”）：
  // - 依据 batch.queue.preview_pending 展示「Preparing / N books ahead / It’s your turn」
  // - 在 p3-4 还没出现在 preview_data 之前保持显示
  // - 只有当 p3-4 出现且该页图片 onLoad 后才隐藏
  const [isStoryComingTargetPageLoaded, setIsStoryComingTargetPageLoaded] = useState(false);
  const storyComingTargetPageIdRef = useRef<number | null>(null);
  /** 预览页底图 onLoad / Canvas 绘制完成标记，用于延迟显示 p3-4 等交互按钮 */
  const [previewPageReadySrcById, setPreviewPageReadySrcById] = useState<Record<number, string>>({});
  const markPreviewPageReady = useCallback((pageId: number, readySrc: string) => {
    setPreviewPageReadySrcById(prev => {
      if (prev[pageId] === readySrc) return prev;
      return { ...prev, [pageId]: readySrc };
    });
  }, []);
  const isPreviewPageReady = useCallback(
    (pageId: number, expectedSrc: string) => previewPageReadySrcById[pageId] === expectedSrc,
    [previewPageReadySrcById]
  );

  // 为 Others 标签页添加局部状态，用于记录选中的选项
  const [selectedBookCover, setSelectedBookCover] = React.useState<number | null>(null);
  const [selectedBinding, setSelectedBinding] = React.useState<number | null>(null);
  const [selectedGiftBox, setSelectedGiftBox] = React.useState<number | null>(null);
  const [detailModal, setDetailModal] = React.useState<GiftBoxOption | null>(null);
  // 当前展示图片的索引，用于翻页
  const [currentIndex, setCurrentIndex] = React.useState(0);
  // p3-4 扉页合成：缓存“基础底图”（不含文字/不含用户上传照片），避免二次编辑时在已合成图上叠字
  const p34BaseImageUrlRef = useRef<string | null>(null);
  // p3-4 分层模型：缓存 giver 图片数据（data URL），用于 dedication 重绘时始终携带最新 giver
  const p34GiverDataRef = useRef<string | null>(null);
  const shouldUploadP34ComposedRef = useRef(false);
  const previewBottomSentinelRef = useRef<HTMLDivElement>(null);
  const guestPreviewHasScrolledRef = useRef(false);
  const guestWasAtBottomRef = useRef(false);
  /** 仅「用户裁剪上传 Giver」触发的上传成功后才应勾选 Opening Photo；纯提交寄语不走此项 */
  const p34UploadCompletesNameOnBookRef = useRef(false);
  const p34ComposeUploadInFlightRef = useRef(false);
  const p34ComposeUploadedRef = useRef(false);
  /** 扉页寄语合成图上传成功后的 CDN URL；轮询重建 batch 时优先保留，避免被旧 final 覆盖 */
  const p34LastComposedImageUrlRef = useRef<string | null>(null);
  type P34PendingCompose = {
    giverUrl?: string;
    dedication?: string;
  };
  type P34PreUploadSnapshot = {
    giverImageUrl: string | null;
    giverData: string | null;
    dedication: string;
    isDedicationSubmitted: boolean;
    isNameOnBookCompleted: boolean;
  };
  const [p34ComposeUploading, setP34ComposeUploading] = useState(false);
  const [p34PendingCompose, setP34PendingCompose] = useState<P34PendingCompose | null>(null);
  const p34PendingComposeRef = useRef<P34PendingCompose | null>(null);
  const p34PreUploadSnapshotRef = useRef<P34PreUploadSnapshot | null>(null);

  const refreshPreviewDataFromBatch = useCallback(
    async (spuCode: string, batchId: string, includeFullBook: boolean) => {
      const res = await fetchPreviewBatch(spuCode, batchId);
      const batch = unwrapPreviewBatch(res);
      if (!batch) return null;
      setPreviewData((prev) => {
        const prevByPageCode: Record<string, any> = {};
        try {
          (prev?.preview_data || []).forEach((p: any) => {
            const code = getPreviewPageCodeLookupKey(p?.page_code);
            if (code) prevByPageCode[code] = p;
          });
        } catch {}
        return {
          ...(prev || {}),
          preview_data: mapBatchToPreviewDataPages(batch, includeFullBook, {
            localP34Composed: p34LastComposedImageUrlRef.current,
            prevByPageCode,
          }),
          status: batch.status || (prev as any)?.status || 'completed',
          batch_id: batch.batch_id || (prev as any)?.batch_id,
          queue_info: batch.queue ?? (prev as any)?.queue_info,
          batch_options: batch.options ?? (prev as any)?.batch_options ?? null,
        } as any;
      });
      return batch;
    },
    [],
  );

  const [guestUploadRateLimitError, setGuestUploadRateLimitError] = useState<UploadRateLimitError | null>(null);
  // sidebar「Opening Photo」完成态：用户上传过图片也算完成（且上传合成后清空 giverImageUrl 时不回退）
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
  /** 上传中时优先展示本地合成预览（blob URL），行为对齐扉页：先看得见图再等 CDN */
  const [momPendingCompositeUrlByPage, setMomPendingCompositeUrlByPage] = React.useState<
    Partial<Record<'p5-6' | 'p27-28', string>>
  >({});
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
    setMomPendingCompositeUrlByPage((prev) => {
      for (const u of Object.values(prev)) {
        if (u) URL.revokeObjectURL(u);
      }
      return {};
    });
    setIsNameOnBookCompleted(false);
    setAcknowledgedOptionalMissingSections(new Set());
    setGuestUploadRateLimitError(null);
    shouldUploadP34ComposedRef.current = false;
    p34UploadCompletesNameOnBookRef.current = false;
    p34ComposeUploadInFlightRef.current = false;
    p34ComposeUploadedRef.current = false;
    p34LastComposedImageUrlRef.current = null;
    setP34ComposeUploading(false);
    setP34PendingCompose(null);
    p34PendingComposeRef.current = null;
    p34PreUploadSnapshotRef.current = null;
  }, [p34CacheKey, setEditField, setGiverImageUrl]);

  useEffect(() => {
    p34PendingComposeRef.current = p34PendingCompose;
  }, [p34PendingCompose]);

  const saveP34PreUploadSnapshot = useCallback(() => {
    p34PreUploadSnapshotRef.current = {
      giverImageUrl,
      giverData: p34GiverDataRef.current,
      dedication,
      isDedicationSubmitted,
      isNameOnBookCompleted,
    };
  }, [giverImageUrl, dedication, isDedicationSubmitted, isNameOnBookCompleted]);

  const revertP34PendingUpload = useCallback(() => {
    const snap = p34PreUploadSnapshotRef.current;
    if (snap) {
      setGiverImageUrl(snap.giverImageUrl);
      p34GiverDataRef.current = snap.giverData;
      setDedication(snap.dedication);
      setIsDedicationSubmitted(snap.isDedicationSubmitted);
      setIsNameOnBookCompleted(snap.isNameOnBookCompleted);
    }
    const pendingGiverUrl = p34PendingComposeRef.current?.giverUrl;
    if (pendingGiverUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingGiverUrl);
    }
    setP34PendingCompose(null);
    setP34ComposeUploading(false);
    p34PreUploadSnapshotRef.current = null;
    shouldUploadP34ComposedRef.current = false;
    p34ComposeUploadedRef.current = false;
    p34UploadCompletesNameOnBookRef.current = false;
  }, [setGiverImageUrl, setDedication]);

  const applyP34PendingUploadSuccess = useCallback((pending: P34PendingCompose | null) => {
    if (pending?.dedication !== undefined) {
      setDedication(pending.dedication);
      setIsDedicationSubmitted(true);
    }
    if (pending?.giverUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pending.giverUrl);
      setGiverImageUrl(null);
    }
    setP34PendingCompose(null);
    setP34ComposeUploading(false);
    p34PreUploadSnapshotRef.current = null;
  }, [setDedication, setGiverImageUrl]);

  useEffect(() => {
    p34BaseImageUrlRef.current = null;
    p34GiverDataRef.current = null;
    p34LastComposedImageUrlRef.current = null;
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
      const pendingDedication = p34PendingComposeRef.current?.dedication;
      const dedicationSource = pendingDedication !== undefined ? pendingDedication : dedication;
      const dedicationTextToPersist = typeof dedicationSource === 'string' ? dedicationSource.trim() : '';
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
        applyP34PendingUploadSuccess(p34PendingComposeRef.current);
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
                    final_image_url: imageUrl,
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
        p34LastComposedImageUrlRef.current = imageUrl;
        if (p34UploadCompletesNameOnBookRef.current) {
          setIsNameOnBookCompleted(true);
        }
        setGuestUploadRateLimitError(null);
      } else {
        console.warn('[P3-4 Compose] uploaded but no image_url in response', resp);
        revertP34PendingUpload();
        toast.error('Upload failed, please try again.');
      }
    } catch (e) {
      console.error('[P3-4 Compose] upload failed', e);
      const uploadRateLimitError = getUploadRateLimitError(e);
      if (uploadRateLimitError) {
        // Canvas 会在依赖变化时反复触发 onRendered；429 后若仍保持 shouldUpload=true 会形成上传风暴并反复清空/弹出弹窗
        shouldUploadP34ComposedRef.current = false;
        revertP34PendingUpload();
        setGuestUploadRateLimitError(uploadRateLimitError);
      } else {
        revertP34PendingUpload();
        toast.error('Upload failed, please try again.');
      }
    } finally {
      p34ComposeUploadInFlightRef.current = false;
      p34UploadCompletesNameOnBookRef.current = false;
    }
  }, [previewData, searchParams, dedication, applyP34PendingUploadSuccess, revertP34PendingUpload]);

  // Opening Photo 完成态：仅在上传成功或已有后端 giver 时保持完成（见 uploadP34ComposedImage / 初始回填）
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
    const momPage = targetPage as MomCompositePreviewPage;
    // p5-6：无换脸，用 base；p27-28：仅允许在 final_stage 上拼贴（与蒙版/后端就绪一致，不用 final_image 回退）
    const baseImageRaw =
      pageCode === 'p27-28'
        ? String(momPage.final_stage_url || '').trim()
        : String(momPage.base_image_url || '').trim();
    if (!baseImageRaw) {
      toast.error(
        pageCode === 'p27-28'
          ? 'Please wait until the page is fully ready before uploading your drawing.'
          : 'Page image is not ready yet.',
      );
      return 'skipped';
    }

    setGuestUploadRateLimitError(null);
    try {
      const endpoint = `products/PICBOOK_MOM/pages/${pageCode}/upload-composite-image`;

      const canvas = await composeMomCompositeCanvas(
        normalizePreviewImageUrlForCanvas(String(baseImageRaw)),
        file,
        placement,
        options?.overlayMode,
      );
      const blob = await composeMomCompositeImageBlob(canvas);

      const objectUrl = URL.createObjectURL(blob);
      setMomPendingCompositeUrlByPage((prev) => {
        const next = { ...prev };
        const old = prev[pageCode];
        if (old) URL.revokeObjectURL(old);
        next[pageCode] = objectUrl;
        return next;
      });

      setMomDrawingUploadingPageCode(pageCode);

      const form = new FormData();
      form.append('batch_id', String(batchId));
      const compositeFileName =
        pageCode === 'p27-28' ? 'p27-28_composite.webp' : 'p5-6_composite.webp';
      form.append('image', blob, compositeFileName);
      // 直连后端；FormData 勿手动 Content-Type（需带 multipart boundary）
      const resp = (await fetchDreamazebookApi(endpoint, {
        method: 'POST',
        body: form,
        timeoutMs: 120000,
      })) as MomCompositeUploadResponse;
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
        const dropMomPendingBlob = () => {
          setMomPendingCompositeUrlByPage((prev) => {
            const old = prev[pageCode];
            if (old) URL.revokeObjectURL(old);
            const { [pageCode]: _removed, ...rest } = prev;
            return rest;
          });
        };
        const cdnSrc = buildPreviewImageSrcForProbe(imageUrl);
        if (typeof document !== 'undefined') {
          const probe = document.createElement('img');
          probe.onload = dropMomPendingBlob;
          probe.onerror = dropMomPendingBlob;
          probe.src = cdnSrc;
        } else {
          dropMomPendingBlob();
        }
        return 'ok';
      } else {
        console.warn('[Mom Composite] uploaded but no image_url in response', resp);
        return 'skipped';
      }
    } catch (e) {
      console.error('[Mom Composite] upload failed', e);
      // 保留本地合成预览便于重试 / 校对；用户在失败时仍可看到刚选的图（与扉页离线预览思路一致）
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

  // 添加 options 状态
  const [bookOptions, setBookOptions] = useState<BookOptions | null>(null);
  // cover_1 真实宽高比：cover_3/4 缩略图外框与之对齐
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
        const match = findCartItemForPreview(items, previewIdParam, fromCartItemIdParam);
        if (!match) return;

        console.log('Preview Page: Found cart match for prefill:', match);

        const pv = match?.preview;
        const custAttrs = match?.customization_data?.attributes || {};
        const topAttrs = (match as any)?.attributes || {};
        const adjustments = (match as any)?.price_adjustments || {};

        // 服务器多为 option_key：cover_style / binding_type / giftbox；
        // 新购物车：customization_data.attributes + price_adjustments.*.selected；旧数据：preview / item.attributes
        const coverKey =
          pv?.cover_type ||
          pv?.cover ||
          pv?.cover_option ||
          pv?.cover_key ||
          topAttrs.cover_style ||
          custAttrs.cover_style ||
          adjustments.cover_style?.selected;

        const bindingKey =
          pv?.binding_type ||
          pv?.binding ||
          pv?.binding_option ||
          pv?.binding_key ||
          topAttrs.binding_type ||
          custAttrs.binding_type ||
          adjustments.binding_type?.selected;

        const giftKey =
          pv?.gift_box ||
          pv?.wrap ||
          pv?.wrap_option ||
          pv?.gift_box_key ||
          topAttrs.giftbox ||
          custAttrs.giftbox ||
          adjustments.giftbox?.selected;

        let changed = false;

        const cartOptionKeyMatches = (optKey: unknown, cartVal: unknown) =>
          String(optKey ?? '')
            .trim()
            .toLowerCase() === String(cartVal ?? '')
              .trim()
              .toLowerCase();

        if (selectedBookCover == null && coverKey) {
          const cover = bookOptions?.cover_options?.find(
            (o) =>
              cartOptionKeyMatches(o.option_key, coverKey) || String(o.id) === String(coverKey),
          );
          if (cover) {
            setSelectedBookCover(cover.id);
            changed = true;
          }
        }

        if (selectedBinding == null && bindingKey) {
          const binding = bookOptions?.binding_options?.find(
            (o) =>
              cartOptionKeyMatches(o.option_key, bindingKey) || String(o.id) === String(bindingKey),
          );
          if (binding) {
            setSelectedBinding(binding.id);
            changed = true;
          }
        }

        if (selectedGiftBox == null && giftKey) {
          const gift = bookOptions?.gift_box_options?.find(
            (o) =>
              (o.option_key ? cartOptionKeyMatches(o.option_key, giftKey) : false) ||
              String(o.id) === String(giftKey) ||
              cartOptionKeyMatches(o.name, giftKey),
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

    const coverId = resolveCoverNumericId(activeOption);
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
  // 防止 AddToCart 事件被多次触发
  const addToCartTrackedRef = useRef(false);
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
  const firstMissingMomDrawingPageCode = useMemo(() => {
    if (!isMomBook || !hasMomCompositePages) return null;
    const pages = (previewData as MomCompositePreviewData | null)?.preview_data || [];
    for (const page of pages) {
      const code = toMomCompositeUploadPageCode(page?.page_code);
      if (code && !uploadedMomDrawingPageCodes.has(code)) return code;
    }
    return null;
  }, [hasMomCompositePages, isMomBook, previewData?.preview_data, uploadedMomDrawingPageCodes]);

  /** Mom 书 preview 中出现的合成页，按阅读顺序用于 Continue 提示队列 */
  const momDrawingPromptSectionIdsOrdered = useMemo(() => {
    if (!isMomBook) return [] as string[];
    const pages = (previewData as MomCompositePreviewData | null)?.preview_data || [];
    const targetCodes = new Set(
      pages
        .map((p) => toMomCompositeUploadPageCode(p?.page_code))
        .filter((code): code is 'p5-6' | 'p27-28' => Boolean(code)),
    );
    const out: string[] = [];
    if (targetCodes.has('p5-6')) out.push(momDrawingPromptSectionId('p5-6'));
    if (targetCodes.has('p27-28')) out.push(momDrawingPromptSectionId('p27-28'));
    return out;
  }, [isMomBook, previewData?.preview_data]);

  // 为每个部分创建 ref（用于滚动定位）
  const giverRef = useRef<HTMLDivElement>(null);
  const dedicationRef = useRef<HTMLDivElement>(null);
  const momDrawingP56Ref = useRef<HTMLDivElement>(null);
  const momDrawingP2728Ref = useRef<HTMLDivElement>(null);
  const coverDesignRef = useRef<HTMLDivElement>(null);
  const bindingRef = useRef<HTMLDivElement>(null);
  const giftBoxRef = useRef<HTMLDivElement>(null);
  /** 固定 Tab 外层（含 safe-area、底部留白），用于滚动时精确扣除遮挡高度 */
  const previewFixedNavShellRef = useRef<HTMLDivElement>(null);
  const missingPulseTimerRef = useRef<number | null>(null);
  const [missingSection, setMissingSection] = useState<string | null>(null);
  const [isMissingSectionPulsing, setIsMissingSectionPulsing] = useState(false);
  const [acknowledgedOptionalMissingSections, setAcknowledgedOptionalMissingSections] = useState<Set<string>>(() => new Set());
  /** p3-4 双页：整块容器同时作为 Opening Photo / Special Message 滚动锚点 */
  const setOpeningSpreadBothRefs = useCallback((node: HTMLDivElement | null) => {
    giverRef.current = node;
    dedicationRef.current = node;
  }, []);
  /** p3-4 单页：外层仅 Opening Photo；寄语锚点在右侧半页（GiverDedicationCanvas.singleRightHalfRef / PreviewPageItem） */
  const setOpeningSpreadGiverOuterRef = useCallback((node: HTMLDivElement | null) => {
    giverRef.current = node;
  }, []);
  // 封面 R2 URL 构建缓存：避免在 render 中对每个 option 重复计算/重复打 log
  const coverR2UrlsCacheRef = useRef<Map<string, any>>(new Map());
  // 显式打开调试：在 URL 上加 ?debugCoverR2=1
  const debugCoverR2 = process.env.NODE_ENV === 'development' && searchParams.get('debugCoverR2') === '1';

  // 监听 URL tab 参数，跳转到指定部分
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!hideOthers && (tabParam === 'giftOptions' || tabParam === 'options')) {
      setActiveTab('Others');
      return;
    }
    if (!hideOthers && (tabParam === 'giftBox' || tabParam === 'addons')) {
      setActiveTab('Others');
      // 延迟滚动以确保 DOM 渲染
      setTimeout(() => {
        if (giftBoxRef.current) {
          scrollPreviewTargetIntoComfortableCenter(giftBoxRef.current);
        }
      }, 300);
    }
  }, [hideOthers, searchParams, setActiveTab]);
  
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

  const buildProtectedPreviewDisplayUrl = (imagePath: string) =>
    toLowResPreviewSrc(buildImageUrl(imagePath));

  const buildCoverR2Urls = (rawBookId: string | null, option: CoverOption) => {
    const baseDomain = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks';
    if (!rawBookId) {
      return null;
    }
    let normalizedBookId = String(rawBookId).trim();
    if (normalizedBookId === 'PICBOOK_GOODNIGHT3') {
      normalizedBookId = 'PICBOOK_GOODNIGHT';
    }

    const coverId = resolveCoverNumericId(option);

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
    const cropRightHalf = shouldCropCoverRightHalf(coverId);

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

  // 测量 cover_1 真实宽高比，供 cover_3/4 缩略图裁切框使用
  useEffect(() => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        setCoverThumbAspectRatio(null);
        return;
      }
      if (!bookOptions?.cover_options || bookOptions.cover_options.length === 0) return;

      setCoverThumbAspectRatio(null);

      const cover1 =
        bookOptions.cover_options.find((o) =>
          String(o.option_key || '').toLowerCase().includes('cover_1'),
        ) ||
        bookOptions.cover_options.find((o) => String(o.option_key || '') === '1') ||
        bookOptions.cover_options.find((o) => String(o.id) === '1') ||
        null;
      if (!cover1) return;

      const urls = buildCoverR2Urls(bookId, cover1);
      const src = urls?.canvasBase || urls?.base;
      if (!src) return;

      let cancelled = false;
      const img = new window.Image();
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

  const coverDisplayAspectRatio = coverThumbAspectRatio ?? 1;

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

  const pickFirstPrice = (...values: any[]): number => {
    for (const value of values) {
      const price = parseMoney(value);
      if (price > 0) return price;
    }
    return 0;
  };

  const sameText = (a: any, b: any): boolean =>
    String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

  const getBindingTypePrices = (): BindingTypePrice[] => {
    const anyInfo: any = bookInfo as any;
    const prices = anyInfo?.binding_type_prices || anyInfo?.data?.binding_type_prices;
    return Array.isArray(prices) ? prices : [];
  };

  const findBindingTypePrice = (option: BindingOption): BindingTypePrice | null => {
    const prices = getBindingTypePrices();
    if (prices.length === 0) return null;

    return prices.find((price) =>
      sameText(option.option_key, price.binding_type || price.attributes?.binding_type) ||
      sameText(option.name, price.binding_type_label),
    ) || null;
  };

  const getBindingDisplayPrice = (option: BindingOption): {
    finalPrice: number;
    originalPrice: number;
    sourceSku?: string;
  } => {
    const skuPrice = findBindingTypePrice(option);
    if (skuPrice) {
      const finalPrice = pickFirstPrice(
        skuPrice.final_unit_price,
        skuPrice.current_price,
        skuPrice.price,
        skuPrice.unit_price,
      );
      if (finalPrice <= 0) {
        const fallbackPrice = getBookBasePrice() + (Number(option.price) || 0);
        return {
          finalPrice: fallbackPrice,
          originalPrice: fallbackPrice,
          sourceSku: skuPrice.sku_code,
        };
      }
      const originalPrice = pickFirstPrice(
        skuPrice.original_unit_price,
        skuPrice.original_price,
        skuPrice.market_price,
      );

      return {
        finalPrice,
        originalPrice: originalPrice > finalPrice ? originalPrice : finalPrice,
        sourceSku: skuPrice.sku_code,
      };
    }

    const finalPrice = getBookBasePrice() + (Number(option.price) || 0);
    return {
      finalPrice,
      originalPrice: finalPrice,
    };
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
      preview_page_id: pickPreviewPageIdFromBatchPage(p),
      face_swap_logs: Array.isArray(p?.face_swap_logs) ? p.face_swap_logs : [],
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
  const startBatchPollingRef = useRef<(spuCode: string, batchId: string) => void>(() => {});
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
        const batch = unwrapPreviewBatch(res);
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
        if (getBatchDisplayPages(batch, { includeFullBook: useUserStore.getState().isLoggedIn }).length > 0) {
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
            const includeFullBook = useUserStore.getState().isLoggedIn;
            const prevByPageCode: Record<string, any> = {};
            try {
              (prev?.preview_data || []).forEach((p: any) => {
                const code = getPreviewPageCodeLookupKey(p?.page_code);
                if (code) prevByPageCode[code] = p;
              });
            } catch {}
            const nextPreviewData = mapBatchToPreviewDataPages(batch, includeFullBook, {
              localP34Composed: p34LastComposedImageUrlRef.current,
              prevByPageCode,
            });
            if (nextPreviewData.length === 0) return prev as any;

            if (!prev || !prev.preview_data || prev.preview_data.length === 0) {
              console.log('[Polling] Initializing previewData from batch pages:', nextPreviewData.length, 'pages');
              return {
                preview_id: undefined as any,
                preview_data: nextPreviewData,
                status: batch.status || 'processing',
                batch_id: batch.batch_id,
                queue_info: batch.queue,
                batch_options: batch.options ?? null,
              } as any;
            }

            console.log('[Polling] Rebuilding preview_data from batch pages:', nextPreviewData.length, 'pages');
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
          if (!batchHasPendingFaceSwapLogs(batch)) {
            clearBatchPolling();
          }
        }
      } catch (_e) {
        console.error('[Polling] Error:', _e);
      }
    }, 3000);
  };
  startBatchPollingRef.current = startBatchPolling;

  const handleFaceSwapPageUpdated = useCallback((pageCode: string, nextPage: PreviewPageWithFaceSwapLogs) => {
    setPreviewData((prev) => {
      if (!prev?.preview_data) return prev as any;
      return {
        ...prev,
        preview_data: prev.preview_data.map((p: any) =>
          p.page_code === pageCode ? { ...p, ...nextPage, page_id: p.page_id } : p,
        ),
      };
    });
  }, []);

  const handleFaceSwapRegenerateStarted = useCallback(() => {
    const spu = searchParams.get('bookid');
    const batchId = currentBatchIdRef.current || searchParams.get('previewid');
    if (spu && batchId) {
      startBatchPollingRef.current(spu, batchId);
    }
  }, [searchParams]);

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
        let latestBatch: any = null;
        try {
          const path = `/products/${spuCode}/preview/batches/${batchId}`;
          // 客户端强制走同域 /api 代理
          const url = path;
          const res = await api.get(url) as ApiResponse<any>;
          latestBatch = unwrapPreviewBatch(res);
          if (latestBatch) {
            // 从最新的 batch 中获取 recipient_name 并更新
            // 注意：如果是从 personalized-product 进入的（store 中有数据），不覆盖 store 中的名字
            const storeUserData = usePreviewStore.getState().userData as any;
            const storeName = storeUserData?.characters?.[0]?.full_name;
            
            // 只有在 store 中没有名字时，才从 batch 更新
            if (!storeName || !storeName.trim()) {
              const recipientName = latestBatch.recipient_name || latestBatch.options?.recipient_name || latestBatch.options?.full_name;
              if (recipientName && typeof recipientName === 'string' && recipientName.trim()) {
                setRecipient(recipientName);
                console.log('[PreviewBatchCompleted] Updated recipient from batch:', recipientName);
              }
            }
          }
          if (latestBatch?.pages || latestBatch?.order_pages) {
            const includeFullBook = useUserStore.getState().isLoggedIn;
            setPreviewData((prev) => {
              const prevByPageCode: Record<string, any> = {};
              try {
                (prev?.preview_data || []).forEach((p: any) => {
                  const code = getPreviewPageCodeLookupKey(p?.page_code);
                  if (code) prevByPageCode[code] = p;
                });
              } catch {}
              return {
                ...(prev || {}),
                preview_data: mapBatchToPreviewDataPages(latestBatch, includeFullBook, {
                  localP34Composed: p34LastComposedImageUrlRef.current,
                  prevByPageCode,
                }),
                status: 'completed',
                batch_id: latestBatch.batch_id,
                queue_info: latestBatch.queue,
                batch_options: latestBatch.options ?? (prev as any)?.batch_options ?? null,
              } as any;
            });
          }
        } catch {}
        if (!batchHasPendingFaceSwapLogs(latestBatch)) {
          clearBatchPolling();
        }
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
      const guestSessionId = readGuestSessionId();
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
            ...(guestSessionId ? { [GUEST_SESSION_HEADER]: guestSessionId } : {}),
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

      const responseGuestSessionId =
        resp.headers.get('x-guest-session-id') ||
        resp.headers.get(GUEST_SESSION_HEADER) ||
        resp.headers.get(GUEST_SESSION_HEADER.toLowerCase());
      if (responseGuestSessionId) {
        // This render response owns the new batch; subsequent batch polling must use the same guest session.
        writeGuestSessionId(responseGuestSessionId, { force: true });
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
      const apiRequestData = buildPreviewRenderPayload(String(bookId), character);
      
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
                      const batch = unwrapPreviewBatch(res);
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
        const previewIdParam = searchParams.get('previewid');
        if (shouldSkipInitialRender && previewIdParam) {
          console.log('[Preview] skip initial render for reused preview:', previewIdParam);
          setIsProcessing(false);
          hasProcessedUserDataRef.current = true;
          hasPostedCreateRef.current = true;
          try {
            localStorage.removeItem('previewUserData');
            localStorage.removeItem('previewBookId');
            usePreviewStore.getState().clear();
          } catch {}
          return;
        }
        
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
          const apiRequestData = buildPreviewRenderPayload(String(bookId), character);
          
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

  const scrollPreviewTargetIntoComfortableCenter = useCallback((
    el: HTMLElement,
    scrollOpts?: { companionBelowPx?: number; anchorFraction?: number },
  ) => {
    const shell = previewFixedNavShellRef.current;
    const measuredBottom = shell?.getBoundingClientRect().bottom;
    const topInset =
      typeof measuredBottom === 'number' && Number.isFinite(measuredBottom) && measuredBottom > 0
        ? measuredBottom + 10
        : PREVIEW_FIXED_TOP_NAV_FALLBACK_PX;

    let anchorFraction: number | undefined = scrollOpts?.anchorFraction;
    if (typeof window !== 'undefined') {
      try {
        const isMobile = !window.matchMedia('(min-width: 768px)').matches;
        if (isMobile && anchorFraction === undefined) {
          anchorFraction = 0.38;
        } else if (displayViewMode === 'double' && anchorFraction === undefined) {
          anchorFraction = 0.4;
        }
      } catch {
        /* ignore */
      }
    }

    scrollPreviewElementIntoComfortableCenter(el, topInset, {
      ...(anchorFraction !== undefined ? { anchorFraction } : {}),
      ...(scrollOpts?.companionBelowPx ? { companionBelowPx: scrollOpts.companionBelowPx } : {}),
    });
  }, [displayViewMode]);

  // 点击侧边栏项，滚动到对应部分
  const scrollToSection = (sectionId: string) => {
    let ref: React.RefObject<HTMLDivElement | null> | null = null;
    switch(sectionId) {
      case "giver": ref = giverRef; break;
      case "dedication": ref = dedicationRef; break;
      case "momDrawing": {
        const first = firstMissingMomDrawingPageCode;
        if (first === 'p27-28') ref = momDrawingP2728Ref;
        else ref = momDrawingP56Ref;
        break;
      }
      case "momDrawing:p5-6": ref = momDrawingP56Ref; break;
      case "momDrawing:p27-28": ref = momDrawingP2728Ref; break;
      case "coverDesign": ref = coverDesignRef; break;
      case "binding": ref = bindingRef; break;
      case "giftBox": ref = giftBoxRef; break;
      default: break;
    }
    if (ref && ref.current) {
      let scrollOpts: { companionBelowPx?: number; anchorFraction?: number } | undefined;
      if (sectionId === 'giver' && typeof window !== 'undefined') {
        try {
          if (!window.matchMedia('(min-width: 768px)').matches) {
            scrollOpts = {
              anchorFraction: 0.32,
              ...(displayViewMode === 'single' ? { companionBelowPx: 56 } : {}),
            };
          }
        } catch {
          /* ignore */
        }
      }
      scrollPreviewTargetIntoComfortableCenter(ref.current, scrollOpts);
    }
  };

  const getMissingSectionToastMessage = (sectionId: string): string => {
    switch (sectionId) {
      case 'dedication':
        return 'Click “Edit” to make it more personal.';
      case 'momDrawing:p5-6':
        return 'Add your drawing.';
      case 'momDrawing:p27-28':
        return 'Add your another drawing.';
      case 'coverDesign':
        return 'Please choose a cover design.';
      case 'binding':
        return 'Please choose a book format.';
      case 'giftBox':
        return 'Please choose gift box / extras.';
      default:
        if (sectionId.startsWith('momDrawing:')) {
          return 'Add your drawing on the marked story pages.';
        }
        return 'Please complete the highlighted step.';
    }
  };

  const triggerMissingSectionFeedback = (sectionId: string) => {
    toast(getMissingSectionToastMessage(sectionId), { duration: 3200 });
    setMissingSection(sectionId);
    setIsMissingSectionPulsing(true);

    if (missingPulseTimerRef.current) window.clearTimeout(missingPulseTimerRef.current);

    // 与 .dreamaze-missing-section-pulse 一致：0.9s × 2
    missingPulseTimerRef.current = window.setTimeout(() => {
      setIsMissingSectionPulsing(false);
      missingPulseTimerRef.current = null;
    }, 2000);

    setTimeout(() => {
      scrollToSection(sectionId);
    }, 120);
  };

  const isOptionalPromptSection = (sectionId: string) =>
    sectionId === 'dedication' ||
    sectionId.startsWith(`${MOM_DRAWING_PROMPT_PREFIX}`);

  const focusMissingSection = (sectionId: string, options?: { acknowledgeOptional?: boolean }) => {
    if (sectionId === "giver" || sectionId === "dedication" || sectionId.startsWith("momDrawing")) {
      setActiveTab("Book preview");
    } else {
      setActiveTab("Others");
    }
    if (options?.acknowledgeOptional && isOptionalPromptSection(sectionId)) {
      setAcknowledgedOptionalMissingSections((prev) => {
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });
    }
    triggerMissingSectionFeedback(sectionId);
  };

  useEffect(() => {
    return () => {
      if (missingPulseTimerRef.current) window.clearTimeout(missingPulseTimerRef.current);
    };
  }, []);

  // 各部分的完成状态判断
  const completedSections = {
    // Opening Photo：可选
    giver: isNameOnBookCompleted,
    // dedication：默认寄语始终展示，编辑为可选
    dedication: true,
    momDrawing: isMomDrawingCompleted,
    ...Object.fromEntries(
      momDrawingPromptSectionIdsOrdered.map((id) => {
        const code = parseMomDrawingPromptSectionId(id);
        return [id, code ? uploadedMomDrawingPageCodes.has(code) : true];
      }),
    ),
    coverDesign: selectedBookCover !== null,
    binding: selectedBinding !== null,
    giftBox: selectedGiftBox !== null,
  };

  const isSectionStillMissing = (sectionId: string) => !Boolean((completedSections as Record<string, boolean>)[sectionId]);
  const getMissingSectionClass = (sectionId: string) =>
    missingSection === sectionId && isSectionStillMissing(sectionId)
      ? `dreamaze-missing-section ${isMissingSectionPulsing ? 'dreamaze-missing-section-pulse' : ''}`
      : '';
  const getMissingButtonClass = (sectionId: string) =>
    missingSection === sectionId && isSectionStillMissing(sectionId)
      ? `dreamaze-missing-button ${isMissingSectionPulsing ? 'dreamaze-missing-button-pulse' : ''}`
      : '';
  const getNextMissingSectionForPrompt = (sections: string[]) =>
    sections.find((sectionId) => {
      if (Boolean((completedSections as Record<string, boolean>)[sectionId])) return false;
      return !isOptionalPromptSection(sectionId) || !acknowledgedOptionalMissingSections.has(sectionId);
    }) || null;

  const continuePromptSections = [
    'dedication',
    ...momDrawingPromptSectionIdsOrdered,
    ...(isHideOptions ? [] : ['coverDesign', 'binding', 'giftBox']),
  ];

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

  // 点击 Continue 按钮处理：创建订单并进入 checkout
  const handleContinue = async () => {
    try {
      console.debug('[Checkout] Clicked');
      const fromCartItemId = searchParams.get('fromCartItemId');
      const firstPromptSection = getNextMissingSectionForPrompt(continuePromptSections);

      if (firstPromptSection) {
        focusMissingSection(firstPromptSection, {
          acknowledgeOptional: isOptionalPromptSection(firstPromptSection),
        });
        console.warn('[Checkout] Blocked by incomplete section:', firstPromptSection);
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
          const payload = buildPreviewRenderPayload(searchParams.get('bookid') || '', character);

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
      console.debug('[Checkout] completedSections:', completedSections);

      // 检查是否有预览数据（现在 preview_id 等于 batch_id，做兼容）
      const effectivePreviewId = previewData?.preview_id ?? (previewData as any)?.batch_id;
      console.debug('[Checkout] preview_id:', previewData?.preview_id, 'batch_id:', (previewData as any)?.batch_id, 'effective:', effectivePreviewId);
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

      // 构建加购数据（/cart/add 与 create-order 前置步骤共用）
      const coverKey = getCoverKey(selectedBookCover);
      const bindingKey = getBindingKey(selectedBinding);
      const giftKey = getGiftBoxKey(selectedGiftBox);

      // 获取 old_preview_id（使用保存的原始 previewid，而不是当前 URL 中可能已更新的 previewid）
      // 如果存在原始 previewid，说明是从 edit 或 add additional product 进入的，需要携带 old_preview_id
      const oldPreviewId = originalPreviewIdRef.current;

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
            gift_message: getGiftMessageForCart(),
            replace: false,
          },
        },
      };

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
          gift_message: getGiftMessageForCart(),
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
        if (!addToCartTrackedRef.current) {
          addToCartTrackedRef.current = true;
          const contentId = getContentIdBySpu(bookInfo);

          if (contentId) {
            const cartValue = 0;
            // fbTrack('AddToCart', {
            //   value: cartValue,
            //   currency: 'USD',
            //   content_ids: [contentId],
            //   content_type: 'product',
            //   contents: [{ id: contentId, quantity: 1 }]
            // });
          }
        }

        router.push('/shopping-cart');
        return;
      }

      // Step 1: 加入购物车
      console.debug('[Checkout] Sending request /cart/add with data:', cartData);
      const addResponse = await api.post('/cart/add', cartData) as ApiResponse<CartAddResponse>;
      console.debug('[Checkout] /cart/add response:', addResponse);

      if (!addResponse.success) {
        return;
      }

      const cartItemId = addResponse.data?.id ?? addResponse.data?.cart_item_id;
      if (!cartItemId) {
        console.error('[Checkout] Missing cart item id from /cart/add response');
        return;
      }

      if (!addToCartTrackedRef.current) {
        addToCartTrackedRef.current = true;
        const contentId = getContentIdBySpu(bookInfo);

        // if (contentId) {
        //   fbTrack('AddToCart', {
        //     value: 0,
        //     currency: 'USD',
        //     content_ids: [contentId],
        //     content_type: 'product',
        //     contents: [{ id: contentId, quantity: 1 }]
        //   });
        // }
      }

      // Step 2: 创建订单（payload 与购物车页 useCheckout 一致）
      const orderBody = {
        cart_item_ids: [cartItemId],
        payment_method: 'card' as const,
      };
      console.debug('[Checkout] Sending request /checkout/create-order with data:', orderBody);

      const { success, code, data } = await api.post<ApiResponse<{ order: { id: number } }>>(
        API_ORDER_CREATE,
        orderBody
      );
      console.debug('[Checkout] /checkout/create-order response:', { success, code, data });

      if (success) {
        router.push(ORDER_CHECKOUT_URL(data!.order!.id) + '&paymentMethod=card');
      } else if (code == 401) {
        openPreviewUnlockLogin();
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      if (error?.status == 401 || error?.response?.status == 401) {
        openPreviewUnlockLogin();
      }
      //toast.error(error.response?.data?.message || '创建订单失败，请重试');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handlePreviewPrimaryAction = async () => {
    if (isGuest) {
      openPreviewUnlockLogin();
      return;
    }
    if (!hideOthers && activeTab === 'Book preview') {
      setActiveTab('Others');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    await handleContinue();
  };

  useEffect(() => {
    if (!isGuest) {
      guestPreviewHasScrolledRef.current = false;
      guestWasAtBottomRef.current = false;
      return;
    }

    const markScrolled = () => {
      if (window.scrollY > 32) {
        guestPreviewHasScrolledRef.current = true;
      }
    };

    window.addEventListener('scroll', markScrolled, { passive: true });
    window.addEventListener('touchmove', markScrolled, { passive: true });
    return () => {
      window.removeEventListener('scroll', markScrolled);
      window.removeEventListener('touchmove', markScrolled);
    };
  }, [isGuest]);

  const previewContentLength = previewData?.preview_data?.length ?? 0;
  const guestUnlockReady = useMemo(
    () => hasGuestPreviewUnlockReady(previewData?.preview_data, previewPagesCount),
    [previewData?.preview_data, previewPagesCount],
  );
  const guestUnlockReadyRef = useRef(guestUnlockReady);
  guestUnlockReadyRef.current = guestUnlockReady;

  useEffect(() => {
    if (!isGuest || activeTab !== 'Book preview') {
      guestWasAtBottomRef.current = false;
      return undefined;
    }

    const mq = window.matchMedia('(max-width: 767px)');

    const isNearPageBottom = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      return scrollTop + viewportHeight >= scrollHeight - 96;
    };

    const maybeOpenGuestUnlock = () => {
      if (!mq.matches) return;
      if (!guestUnlockReadyRef.current) return;
      if (!guestPreviewHasScrolledRef.current) return;
      if (useUserStore.getState().isLoginModalOpen) return;

      const atBottom = isNearPageBottom();
      if (atBottom && !guestWasAtBottomRef.current) {
        openPreviewUnlockLogin();
      }
      guestWasAtBottomRef.current = atBottom;
    };

    const handleScroll = () => {
      maybeOpenGuestUnlock();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // P10 刚就绪且用户已在底部时，主动补一次检查
    maybeOpenGuestUnlock();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isGuest, activeTab, openPreviewUnlockLogin, previewContentLength, guestUnlockReady]);

  useEffect(() => {
    if (!isGuest || activeTab !== 'Book preview' || !guestUnlockReady) return undefined;
    const el = previewBottomSentinelRef.current;
    if (!el) return undefined;

    const mq = window.matchMedia('(max-width: 767px)');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!mq.matches) return;
        if (!guestUnlockReadyRef.current) return;
        if (!guestPreviewHasScrolledRef.current) return;
        if (useUserStore.getState().isLoginModalOpen) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          openPreviewUnlockLogin();
          guestWasAtBottomRef.current = true;
        }
      },
      { threshold: 0, rootMargin: '0px 0px 24px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isGuest, activeTab, openPreviewUnlockLogin, previewContentLength, guestUnlockReady]);

  useEffect(() => {
    if (!isGuest) return undefined;
    return useUserStore.subscribe((state, prevState) => {
      if (prevState.isLoginModalOpen && !state.isLoginModalOpen) {
        guestWasAtBottomRef.current = true;
      }
    });
  }, [isGuest]);

  const prevLoggedInRef = useRef(isLoggedIn);
  const subscribeToPreviewChannelRef = useRef(subscribeToPreviewChannel);
  subscribeToPreviewChannelRef.current = subscribeToPreviewChannel;

  useEffect(() => {
    const justLoggedIn = !prevLoggedInRef.current && isLoggedIn;
    prevLoggedInRef.current = isLoggedIn;
    if (!justLoggedIn) return;

    const spuCode = searchParams.get('bookid');
    const batchId = currentBatchIdRef.current || searchParams.get('previewid');
    if (!spuCode || !batchId) return;

    // 登录后切换到 user 频道，并重新拉取 batch（含 order_pages）以展示整本书
    previewChannelNameRef.current = null;
    subscribeToPreviewChannelRef.current(spuCode, batchId);
    startBatchPollingRef.current(spuCode, batchId);

    void refreshPreviewDataFromBatch(spuCode, batchId, true).catch((error) => {
      console.warn('[Preview] Failed to refresh full book after login:', error);
    });
  }, [isLoggedIn, refreshPreviewDataFromBatch, searchParams]);

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
  // Dad 默认寄语含段落空行（\n\n），拆行后超过通用 10 行上限，需单独放宽编辑限制
  const dedicationMaxLines = isPicbookDad(bookId) ? 14 : MAX_LINES;
  const buildDefaultMessage = (name: string, lang: string, bookIdParam?: string) => {
    const bookIdUpper = (bookIdParam || bookId || '').toUpperCase();
    
    // 根据bookId判断书籍类型
    let templateType: 'goodnight' | 'santa' | 'bravery' | 'birthday' | 'mama' | 'dad' | 'default' = 'default';
    
    if (bookIdUpper.includes('GOODNIGHT')) {
      templateType = 'goodnight';
    } else if (bookIdUpper === 'PICBOOK_MOM') {
      templateType = 'mama';
    } else if (bookIdUpper === 'PICBOOK_DAD') {
      templateType = 'dad';
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
        case 'dad':
          return `亲爱的爸爸，\n\n谢谢你成为我的避风港、\n最棒的啦啦队、\n以及总让我的世界更明亮的人。\n\n无论我长多大，\n我想我心里总有一部分\n还想牵着你的手。\n\n谢谢你用所有微不足道却最重要的小事来爱我。\n\n爱你。`;
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
        case 'dad':
          return `Dear Dad,\n\nthank you for being my safe place,\nmy biggest cheerleader,\nand the one who always makes my world feel brighter.\n\nNo matter how big I grow,\nI think a part of me\nwill always want to hold your hand.\n\nThank you for loving me\nin all the little ways that matter most.\n\nLove you.`;
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

    // 限制行数：按换行符拆分后行数不能超过 dedicationMaxLines
    const lines = value.split('\n');
    if (lines.length > dedicationMaxLines) {
      return;
    }

    // 限制字数
    if (value.length > MAX_CHARS) {
      return;
    }

    setMessage(value);
  };

  const openDedicationEditor = useCallback(() => {
    setMessage(dedication);
    setEditField('dedication');
  }, [dedication, setEditField]);

  const handleDedicationCancel = useCallback(() => {
    setMessage(dedication);
    setEditField(null);
  }, [dedication, setEditField]);

  const handleDedicationContinue = useCallback(() => {
    const trimmed = message.trim();
    const savedTrimmed = (dedication || '').trim();
    if (trimmed !== savedTrimmed) {
      messageUserTouchedRef.current = true;
      setGuestUploadRateLimitError(null);
      saveP34PreUploadSnapshot();
      shouldUploadP34ComposedRef.current = true;
      p34UploadCompletesNameOnBookRef.current = false;
      p34ComposeUploadedRef.current = false;
      p34LastComposedImageUrlRef.current = null;
      setP34PendingCompose({ dedication: message });
      setP34ComposeUploading(true);
    }
    setEditField(null);
  }, [dedication, message, saveP34PreUploadSnapshot, setEditField]);

  const getGiftMessageForCart = useCallback(
    () => (isDedicationSubmitted ? message.trim() : ''),
    [isDedicationSubmitted, message],
  );

  const p34PageMetaForUpload = useMemo(() => {
    const pages = (previewData as any)?.preview_data;
    if (!Array.isArray(pages)) return null;
    const p34 = pages.find((p: any) => {
      const code = String(p?.page_code || '');
      return code === 'p3-4' || code === 'p3-p4';
    });
    if (!p34) return null;
    const templateRaw = (p34 as any).base_stage_url || p34BaseImageUrlRef.current;
    return {
      baseSrc: buildImageUrl(String(templateRaw || '')),
      giverData: (p34 as any).giver_data || null,
    };
  }, [previewData, buildImageUrl]);

  const p34UploadComposeProps = useMemo(() => {
    if (!p34PendingCompose || !p34PageMetaForUpload) return null;
    const dedicationForUpload = p34PendingCompose.dedication ?? dedication;
    const isDadDefaultDedicationLeft =
      isPicbookDad(bookId) &&
      (dedicationForUpload || '').trim() === (defaultMessage || '').trim();
    return {
      giverImageUrl: p34PendingCompose.giverUrl ?? (giverImageUrl || p34PageMetaForUpload.giverData),
      dedicationText: dedicationForUpload,
      dedicationTextAlign:
        isPicbookDad(bookId) &&
        (dedicationForUpload || '').trim() === (defaultMessage || '').trim()
          ? ('left' as const)
          : ('center' as const),
      dedicationSidePaddingRatio: isPicbookDad(bookId) ? 0.12 : 0.06,
      dedicationSidePaddingLeftRatio: isDadDefaultDedicationLeft ? 0.2 : undefined,
      giverImageScale:
        (bookId || '').toUpperCase() === 'PICBOOK_BRAVEY' ||
        (bookId || '').toUpperCase() === 'PICBOOK_BIRTHDAY'
          ? 1.2
          : ['PICBOOK_GOODNIGHT3', 'PICBOOK_MOM', 'PICBOOK_DAD', 'PICBOOK_SANTA', 'PICBOOK_MELODY'].includes(
                (bookId || '').toUpperCase(),
              )
            ? 0.7
            : undefined,
    };
  }, [
    p34PendingCompose,
    p34PageMetaForUpload,
    dedication,
    giverImageUrl,
    bookId,
    defaultMessage,
  ]);

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

  const previewHeaderTitle = bookInfo?.default_name || 'Preview';

  const previewBackHref = useMemo(() => {
    if (isCartOptionEdit) {
      return '/shopping-cart';
    }

    const params = new URLSearchParams();
    const fromCartItemId = searchParams.get('fromCartItemId');
    const bookIdParam = searchParams.get('bookid');
    if (bookIdParam) params.set('book', bookIdParam);
    const lang = searchParams.get('lang');
    if (lang) params.set('language', lang);
    if (isKs) params.set('ks', '1');
    const packageItemId = searchParams.get('package_item_id');
    if (packageItemId) params.set('package_item_id', packageItemId);
    const packageId = searchParams.get('package_id');
    if (packageId) params.set('package_id', packageId);
    if (fromCartItemId) params.set('fromCartItemId', fromCartItemId);
    if (isHideOptions) params.set('hideOptions', '1');
    if (searchParams.get('skipPrefillOptions') === '1') params.set('skipPrefillOptions', '1');
    const coverType = searchParams.get('cover_type');
    if (coverType) params.set('cover_type', coverType);
    const bindingType = searchParams.get('binding_type');
    if (bindingType) params.set('binding_type', bindingType);
    return `/personalize?${params.toString()}`;
  }, [searchParams, isKs, isHideOptions, isCartOptionEdit]);

  const previewBackLabel = isCartOptionEdit
    ? 'Back to shopping cart'
    : activeTab === 'Others' && !hideOthers
      ? 'Back to the preview page'
      : 'Back to edit';

  const showBackToPreviewPage = activeTab === 'Others' && !hideOthers && !isCartOptionEdit;

  const handlePreviewBackToBookPreview = useCallback(() => {
    setActiveTab('Book preview');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [setActiveTab]);

  const previewBottomButtonLabel = isGuest
    ? activeTab === 'Book preview'
      ? t('continuePreview')
      : t('continueToCheckout')
    : hideOthers || activeTab === 'Book preview'
      ? hideOthers
        ? t('completeMyBook')
        : t('chooseCoverAndFormat')
      : t('continueToCheckout');

  const hidePreviewBottomBar = editField === 'giver' || pendingMomDrawingFile;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <style>{`
        @keyframes dreamazeMissingPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(207, 15, 2, 0.18); }
          50% { box-shadow: 0 0 28px rgba(207, 15, 2, 0.22); }
        }

        @keyframes dreamazeMissingButtonPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(207, 15, 2, 0.12); }
          50% { box-shadow: 0 0 14px rgba(207, 15, 2, 0.24); }
        }

        .dreamaze-missing-section {
          border-radius: 12px;
          box-shadow: 0 0 18px rgba(207, 15, 2, 0.14);
          transition: box-shadow 180ms ease;
        }

        .dreamaze-missing-section-pulse {
          animation: dreamazeMissingPulse 0.9s ease-in-out 2;
        }

        .dreamaze-missing-button {
          border-color: #cf0f02 !important;
          box-shadow: 0 0 0 3px rgba(207, 15, 2, 0.08);
        }

        .dreamaze-missing-button-pulse {
          animation: dreamazeMissingButtonPulse 0.9s ease-in-out 2;
        }

        .preview-protected-image {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-user-drag: none;
        }
      `}</style>
      <div
        ref={previewFixedNavShellRef}
        className="sticky top-0 z-50 h-12 bg-white flex items-center px-4 sm:px-32"
      >
        <div className="relative flex items-center justify-between w-full sm:hidden">
          {showBackToPreviewPage ? (
            <button
              type="button"
              onClick={handlePreviewBackToBookPreview}
              className="flex items-center text-gray-700 hover:text-blue-500"
              aria-label={previewBackLabel}
            >
              <IoIosArrowBack size={24} />
            </button>
          ) : (
            <Link
              href={previewBackHref}
              className="flex items-center text-gray-700 hover:text-blue-500"
              aria-label={previewBackLabel}
            >
              <IoIosArrowBack size={24} />
            </Link>
          )}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <span className="text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] font-medium text-center truncate max-w-[200px]">
              {previewHeaderTitle}
            </span>
          </div>
          <div className="w-6 md:hidden" aria-hidden="true" />
        </div>
        <div className="hidden sm:flex items-center justify-between flex-1 min-w-0">
          {showBackToPreviewPage ? (
            <button
              type="button"
              onClick={handlePreviewBackToBookPreview}
              className="flex items-center text-sm shrink-0"
            >
              <span className="mr-2">←</span> {previewBackLabel}
            </button>
          ) : (
            <Link href={previewBackHref} className="flex items-center text-sm shrink-0">
              <span className="mr-2">←</span> {previewBackLabel}
            </Link>
          )}
          <div className="hidden sm:block flex-1" aria-hidden="true" />
        </div>
      </div>

      <div className={`mx-auto overflow-x-hidden ${isGuest ? 'pb-4 md:pb-[76px]' : 'pb-[76px]'}`}>
        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full">
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

                  const coverUrls =
                    activeOption
                      ? buildCoverR2Urls(searchParams.get('bookid'), activeOption)
                      : searchParams.get('bookid')
                        ? buildCoverR2Urls(searchParams.get('bookid'), { id: 1, option_key: '1' } as CoverOption)
                        : null;

                  if (coverUrls) {
                    const { canvasBase, cropRightHalf } = coverUrls;
                    const activeCoverId = resolveCoverNumericId(activeOption ?? { id: 1, option_key: '1' });
                    const coverDims = getCoverDisplayDimensions(coverDisplayAspectRatio);

                    // Make it personal 顶部封面：cover_3/4 也使用后端 preview 页，这样排队/换脸中状态与 Options tab 保持一致。
                    if (activeCoverId === '3' || activeCoverId === '4') {
                      const target = `cover_${activeCoverId}`;
                      const coverPage = (previewData?.preview_data || []).find((p: any) => {
                        const code = String((p as any)?.page_code || '').toLowerCase().replace(/-/g, '_');
                        return code === target;
                      });
                      const raw = coverPage ? getPreviewDisplayImageRaw(coverPage) : '';
                      const backendSrc = raw ? buildProtectedPreviewDisplayUrl(String(raw)) : '';
                      const coverHasSwap = !!(coverPage as any)?.has_face_swap;
                      const coverHasBase = !!(coverPage as any)?.base_image_url || !!(coverPage as any)?.image_url;
                      const coverFailed = String((coverPage as any)?.status || '').toLowerCase() === 'failed';
                      const coverNeedsOverlay =
                        coverHasSwap && coverHasBase && !hasMeaningfulFinalImage(coverPage) && !coverFailed;
                      const coverProgress = coverPage ? Math.round(pageProgress[(coverPage as any).page_id] ?? 0) : 0;
                      const coverOverlayMode = coverFailed ? 'failed' : (coverProgress > 0 ? 'progress' : 'loading');
                      const coverHasFinal = coverPage ? hasMeaningfulFinalImage(coverPage) : false;
                      // 尚未有可展示的后端图时（排队/生成中、或已有 cover 行但无 URL、或进度在跑且尚无 final）保留蒙版；
                      // 批次 completed 或已有 final 后不再仅用「进度=100」挡图（避免 100% 蒙版不消）。
                      const waitingForBackendCoverDisplay =
                        !backendSrc &&
                        !coverFailed &&
                        !isCompleted &&
                        (isProcessingLike ||
                          (!!coverPage && coverProgress > 0 && !coverHasFinal));
                      const showCoverBusyOverlay =
                        coverFailed ||
                        coverNeedsOverlay ||
                        waitingForBackendCoverDisplay;

                      return (
                        <div className="relative w-full max-w-[400px]">
                          <CoverSpreadFrame
                            cropRightHalf={cropRightHalf}
                            frameAspectRatio={coverDisplayAspectRatio}
                            className="relative w-full overflow-hidden rounded-lg shadow-md"
                          >
                            {backendSrc ? (
                              <OptimizedImage
                                src={backendSrc}
                                alt="Book Cover"
                                width={coverDims.width}
                                height={coverDims.height}
                                priority
                                className={coverFitFrameImageClass}
                                style={coverSpreadImageStyle}
                              />
                            ) : (
                              <OptimizedImage
                                src={canvasBase}
                                alt="Book Cover"
                                width={coverDims.width}
                                height={coverDims.height}
                                priority
                                className={coverFitFrameImageClass}
                                style={coverSpreadImageStyle}
                              />
                            )}
                          </CoverSpreadFrame>
                          {showCoverBusyOverlay && (
                            <div
                              className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-white/70"
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
                    if (activeOption && coverTextConfig && canDrawCoverTexts(coverTextConfig.texts, coverTextVariables)) {
                      const coverIdInner = resolveCoverNumericId(activeOption);
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
                          <CoverSpreadFrame cropRightHalf={false}>
                            <CoverNameCanvas
                              // 使用本地域名代理过的图片地址，避免 Canvas CORS 污染
                              src={canvasBase}
                              name={recipient.trim()}
                              variables={coverTextVariables}
                              texts={coverTextConfig.texts}
                              className={coverNaturalImageClass}
                            />
                          </CoverSpreadFrame>
                        );
                      }
                    }

                    // 无 page_properties.json 的封面保持原有展示逻辑
                    return (
                      <CoverSpreadFrame cropRightHalf={false}>
                        <OptimizedImage
                          src={canvasBase}
                          alt="Book Cover"
                          width={coverDims.width}
                          height={coverDims.height}
                          priority
                          className={coverNaturalImageClass}
                        />
                      </CoverSpreadFrame>
                    );
                  }

                  // 回退到原有逻辑（非 Cloudflare 场景）
                  const fallbackCoverDims = getCoverDisplayDimensions(coverDisplayAspectRatio);
                  return bookInfo?.default_cover ? (
                    <CoverSpreadFrame cropRightHalf={false}>
                      {isCoverLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white">
                          <DreamazeLogoRainbowLoader size={60} />
                        </div>
                      )}
                      <OptimizedImage
                        src={buildProtectedPreviewDisplayUrl(bookInfo.default_cover)}
                        fallbackSrc={'/imgs/picbook/goodnight/封面1.jpg'}
                        alt="Book Cover"
                        width={fallbackCoverDims.width}
                        height={fallbackCoverDims.height}
                        priority
                        className={`${coverNaturalImageClass} ${isCoverLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                        onError={(e) => {
                          console.error(`封面图片加载失败: ${buildImageUrl(bookInfo.default_cover)} (raw: ${bookInfo.default_cover})`);
                          setIsCoverLoading(false);
                        }}
                        onLoadingComplete={() => {
                          setIsCoverLoading(false);
                        }}
                      />
                    </CoverSpreadFrame>
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
              <div className="w-full mb-8">
                <div className="w-full flex flex-col items-center gap-8">
                  {(() => {
                    // 展示 batch 正文页；cover_3/4 等在 Gift Options 展示
                    const displayedPages = getDisplayedPreviewPages(previewData.preview_data);
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
                    const src = buildProtectedPreviewDisplayUrl(String(displayUrlRaw || ''));
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
                    // p27-28 必须有 final_stage_url（换脸后 stage），与无 stage 时的蒙版一致，否则不允许上传
                    const momDrawingStageReady =
                      momCompositePageCode !== 'p27-28' ||
                      Boolean(
                        String((page as MomCompositePreviewPage).final_stage_url || '').trim(),
                      );
                    const canUploadMomComposite =
                      isMomCompositePage &&
                      isMomCompositeUploadReady &&
                      !isSwapping &&
                      !pageFailed &&
                      momDrawingStageReady;
                    const momCompositeLocalPreviewSrc =
                      momCompositePageCode && momPendingCompositeUrlByPage[momCompositePageCode]
                        ? momPendingCompositeUrlByPage[momCompositePageCode]
                        : null;
                    // 轮到该页前（progress 为 0）显示 loading；开始后显示进度；失败页显示说明
                    const overlayMode = pageFailed ? 'failed' : (progress > 0 ? 'progress' : 'loading');

                      // p3-4 展示策略同上：只有当 final 与 base/image 不同，才默认展示 final。
                      // 这样 edited book 能展示历史最终图；create book（final==base 或无 final）则会走 Canvas 展示默认寄语。
                      const p34FinalSrc =
                        isGiverDedicationPage && hasMeaningfulFinalImage(page)
                          ? buildProtectedPreviewDisplayUrl(String((page as any).final_image_url || ''))
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
                      const giverPhotoButtonLabel = p34GiverOverlaySrc
                        ? 'Change photo'
                        : 'Add a favorite photo';
                      const dedicationButtonLabel = isDedicationSubmitted
                        ? 'Edit your message'
                        : 'Write a dedication';
                      const upperBookId = (searchParams.get('bookid') || '').toUpperCase();
                      const giverImageScale =
                        upperBookId === 'PICBOOK_BRAVEY' ||
                        upperBookId === 'PICBOOK_BIRTHDAY'
                          ? 1.2
                          : (upperBookId === 'PICBOOK_GOODNIGHT3' ||
                              upperBookId === 'PICBOOK_MOM' ||
                              upperBookId === 'PICBOOK_DAD' ||
                              upperBookId === 'PICBOOK_SANTA' ||
                              upperBookId === 'PICBOOK_MELODY')
                              ? 0.7
                              : undefined;
                      // Dad：仅默认寄语左对齐；用户编辑提交后与它书一致居中
                      const dedicationTextAlign =
                        isPicbookDad(upperBookId) &&
                        (dedication || '').trim() === (defaultMessage || '').trim()
                          ? 'left'
                          : 'center';
                      const isDadDefaultDedicationLeft =
                        isPicbookDad(upperBookId) &&
                        (dedication || '').trim() === (defaultMessage || '').trim();
                      const dedicationSidePaddingRatio = isPicbookDad(upperBookId) ? 0.12 : 0.06;
                      const dedicationSidePaddingLeftRatio = isDadDefaultDedicationLeft
                        ? 0.2
                        : undefined;
                      // 如果是“曾经编辑过的书”，后端会返回 p3-4 的 final_image_url。
                      // 默认应直接展示 final 图；只有当用户打开编辑弹窗/发生本地修改时，才使用 Canvas 分层合成。
                      const p34HasLocalChanges =
                        !!giverImageUrl ||
                        !!editField ||
                        (p34ComposeUploadedRef.current && isDedicationSubmitted);

                      // 单页模式：p3-4 始终拆成左右单页展示；有 final 时只把 final 当作底图，不再整张跨页显示。
                      if (isGiverDedicationPage && displayViewMode === 'single') {
                        if (isSwapping || pageFailed) {
                          return (
                            <div key={page.page_id} ref={setOpeningSpreadGiverOuterRef} className="w-full flex flex-col items-center">
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
                                  scrollAnchorSingleRightRef={dedicationRef}
                                  onImageLoaded={(loadedPageId) => {
                                    if (pageIdForStoryComingHide && loadedPageId === pageIdForStoryComingHide) {
                                      setIsStoryComingTargetPageLoaded(true);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                        if (p34FinalSrc && !p34HasLocalChanges) {
                          return (
                            <div key={page.page_id} className="w-full flex flex-col items-center">
                              <div className="w-full max-w-5xl relative">
                                {p34ComposeUploading ? (
                                  <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-white/70">
                                    <DreamazeLogoRainbowLoader size={60} />
                                  </div>
                                ) : null}
                                <GiverDedicationCanvas
                                  className="w-full"
                                  imageUrl={p34FinalSrc}
                                  mode="single"
                                  giverText=""
                                  dedicationText=""
                                  giverImageUrl={null}
                                  giverImageScale={giverImageScale}
                                  dedicationTextAlign={dedicationTextAlign}
                                  dedicationSidePaddingRatio={dedicationSidePaddingRatio}
                                  dedicationSidePaddingLeftRatio={dedicationSidePaddingLeftRatio}
                                  singleLeftHalfRef={giverRef}
                                  singleRightHalfRef={dedicationRef}
                                  leftImageFrameClassName={getMissingSectionClass('giver')}
                                  rightImageFrameClassName={getMissingSectionClass('dedication')}
                                  leftBelow={(
                                    <div className="mt-2 w-full flex justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          giverFileInputRef.current?.click();
                                        }}
                                        className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('giver')}`}
                                      >
                                        {giverPhotoButtonLabel}
                                      </button>
                                    </div>
                                  )}
                                  rightBelow={(
                                    <div className="mt-2 w-full flex flex-col items-center">
                                      <button
                                        type="button"
                                        onClick={openDedicationEditor}
                                        className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('dedication')}`}
                                      >
                                        {dedicationButtonLabel}
                                      </button>
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        }
                        return (
                        <div key={page.page_id} className="w-full flex flex-col items-center">
                          <div className="w-full max-w-5xl relative">
                            {p34ComposeUploading ? (
                              <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-white/70">
                                <DreamazeLogoRainbowLoader size={60} />
                              </div>
                            ) : null}
                            <GiverDedicationCanvas
                              className="w-full"
                              imageUrl={p34BaseSrc}
                              mode="single"
                              giverText={giver}
                              dedicationText={dedication}
                              giverImageUrl={p34GiverOverlaySrc}
                              giverImageScale={giverImageScale}
                              dedicationTextAlign={dedicationTextAlign}
                              dedicationSidePaddingRatio={dedicationSidePaddingRatio}
                              dedicationSidePaddingLeftRatio={dedicationSidePaddingLeftRatio}
                              singleLeftHalfRef={giverRef}
                              singleRightHalfRef={dedicationRef}
                              leftImageFrameClassName={getMissingSectionClass('giver')}
                              rightImageFrameClassName={getMissingSectionClass('dedication')}
                              leftBelow={(
                                <div className="mt-2 w-full flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      giverFileInputRef.current?.click();
                                    }}
                                    className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('giver')}`}
                                  >
                                    {giverPhotoButtonLabel}
                                  </button>
                                </div>
                              )}
                              rightBelow={(
                                <div className="mt-2 w-full flex flex-col items-center">
                                  <button
                                    type="button"
                                    onClick={openDedicationEditor}
                                    className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('dedication')}`}
                                  >
                                    {dedicationButtonLabel}
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
                        <div className="pointer-events-none absolute inset-0">
                          {p34ComposeUploading ? (
                            <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-white/70">
                              <DreamazeLogoRainbowLoader size={60} />
                            </div>
                          ) : null}
                          <div className="hidden md:block">
                            <div className="absolute bottom-[20%] left-0 w-1/2 flex justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  giverFileInputRef.current?.click();
                                }}
                                className={`pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('giver')}`}
                              >
                                {giverPhotoButtonLabel}
                              </button>
                            </div>
                            <div className="absolute bottom-[20%] right-0 w-1/2 flex flex-col items-center">
                              <button
                                type="button"
                                onClick={openDedicationEditor}
                                className={`pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('dedication')}`}
                              >
                                {dedicationButtonLabel}
                              </button>
                            </div>
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
                            momCompositePageCode &&
                            !uploadedMomDrawingPageCodes.has(momCompositePageCode)
                              ? getMissingButtonClass(momDrawingPromptSectionId(momCompositePageCode))
                              : ''
                          } ${
                              momDrawingUploadingPageCode === momCompositePageCode ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {momDrawingUploadingPageCode === momCompositePageCode
                              ? 'Uploading...'
                              : uploadedMomDrawingPageCodes.has(momCompositePageCode)
                                ? 'Replace drawing'
                                : momCompositePageCode === 'p27-28'
                                  ? 'Add another drawing'
                                  : 'Upload a drawing of Mama'}
                          </button>
                        </div>
                      ) : null;
                      const momCompositeButtonOverlay = momCompositeButton && displayViewMode !== 'single' ? (
                        <div className="pointer-events-none hidden md:block absolute inset-0">
                          <div
                            className={`absolute right-0 w-1/2 flex justify-center ${
                              momCompositePageCode === 'p27-28' ? 'bottom-[30%]' : 'bottom-[20%]'
                            }`}
                          >
                            <div className="pointer-events-auto">
                              {momCompositeButton}
                            </div>
                          </div>
                        </div>
                      ) : null;
                      const momDrawingRightSingleGlow =
                        displayViewMode === 'single' &&
                        momCompositePageCode &&
                        !uploadedMomDrawingPageCodes.has(momCompositePageCode)
                          ? getMissingSectionClass(momDrawingPromptSectionId(momCompositePageCode))
                          : undefined;
                      const openingDoubleImageGlow =
                        displayViewMode === 'double' && isGiverDedicationPage
                          ? `${getMissingSectionClass('giver')} ${getMissingSectionClass('dedication')}`.trim()
                          : undefined;
                      const momDoubleImageGlow =
                        displayViewMode === 'double' &&
                        !isGiverDedicationPage &&
                        momCompositePageCode &&
                        !uploadedMomDrawingPageCodes.has(momCompositePageCode)
                          ? getMissingSectionClass(momDrawingPromptSectionId(momCompositePageCode))
                          : undefined;
                      const faceSwapLogs = Array.isArray((page as any).face_swap_logs)
                        ? (page as any).face_swap_logs
                        : [];
                      const showFaceSwapVersionCarousel =
                        hasSwap &&
                        !isGiverDedicationPage &&
                        !isMomCompositePage &&
                        faceSwapLogs.length > 0 &&
                        !pageFailed &&
                        !momCompositeLocalPreviewSrc;
                      if (showFaceSwapVersionCarousel) {
                        return (
                          <div
                            key={`faceswap-${String((page as any)?.page_code || page.page_id)}`}
                            className="w-full flex flex-col items-center"
                          >
                            <FaceSwapVersionCarousel
                                spuCode={String(searchParams.get('bookid') || '')}
                                batchId={
                                  currentBatchId ||
                                  searchParams.get('previewid') ||
                                  (previewData as any)?.batch_id ||
                                  null
                                }
                                page={page as unknown as PreviewPageWithFaceSwapLogs}
                                buildImageUrl={buildProtectedPreviewDisplayUrl}
                                onPageUpdated={handleFaceSwapPageUpdated}
                                onRegenerateStarted={handleFaceSwapRegenerateStarted}
                                onImageLoaded={(loadedPageId) => {
                                  if (pageIdForStoryComingHide && loadedPageId === pageIdForStoryComingHide) {
                                    setIsStoryComingTargetPageLoaded(true);
                                  }
                                  markPreviewPageReady(loadedPageId, src);
                                }}
                              />
                          </div>
                        );
                      }
                      return (
                      <div
                        key={page.page_id}
                        ref={
                          isGiverDedicationPage
                            ? setOpeningSpreadBothRefs
                            : momCompositePageCode === 'p5-6'
                              ? displayViewMode === 'single'
                                ? undefined
                                : momDrawingP56Ref
                              : momCompositePageCode === 'p27-28'
                                ? displayViewMode === 'single'
                                  ? undefined
                                  : momDrawingP2728Ref
                                : undefined
                        }
                        className="w-full flex flex-col items-center"
                      >
                        <div className="w-full max-w-5xl">
                          <PreviewPageItem
                            pageId={page.page_id}
                            pageNumber={page.page_number}
                            src={
                              momCompositeLocalPreviewSrc
                                ? momCompositeLocalPreviewSrc
                                : (p34FinalSrc && isGiverDedicationPage && !p34HasLocalChanges)
                                  ? p34FinalSrc
                                  : src
                            }
                            viewMode={displayViewMode}
                            showOverlay={isSwapping || pageFailed}
                            progress={progress}
                            overlayMode={overlayMode as any}
                            content={page.content}
                            showLoadingPlaceholder={hasSwap || !displayUrlRaw}
                            doubleImageAreaClassName={openingDoubleImageGlow || momDoubleImageGlow}
                            rightSingleFrameClassName={momDrawingRightSingleGlow}
                            scrollAnchorSingleRightRef={
                              displayViewMode === 'single' && momCompositePageCode === 'p5-6'
                                ? momDrawingP56Ref
                                : displayViewMode === 'single' && momCompositePageCode === 'p27-28'
                                  ? momDrawingP2728Ref
                                  : undefined
                            }
                            customOverlayContent={pageFailed ? undefined : (isGiverDedicationPage ? (
                              (p34FinalSrc && !p34HasLocalChanges) ? p34ButtonsOverlay : (
                                <div className="w-full h-full relative">
                                  {p34ComposeUploading ? (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-white/70">
                                      <DreamazeLogoRainbowLoader size={60} />
                                    </div>
                                  ) : null}
                                  <GiverDedicationCanvas
                                    className="w-full h-full"
                                    imageUrl={p34BaseSrc}
                                    mode="double"
                                    giverText={giver}
                                    dedicationText={dedication}
                                    giverImageUrl={p34GiverOverlaySrc}
                                    giverImageScale={giverImageScale}
                                    dedicationTextAlign={dedicationTextAlign}
                                    dedicationSidePaddingRatio={dedicationSidePaddingRatio}
                                    dedicationSidePaddingLeftRatio={dedicationSidePaddingLeftRatio}
                                    overlayContent={p34ButtonsOverlay}
                                    onVisualReady={() =>
                                      markPreviewPageReady(page.page_id, `${p34BaseSrc}:canvas`)
                                    }
                                  />
                                </div>
                              )
                            ) : (momCompositeButtonOverlay || undefined))}
                            onImageLoaded={(loadedPageId) => {
                              if (pageIdForStoryComingHide && loadedPageId === pageIdForStoryComingHide) {
                                setIsStoryComingTargetPageLoaded(true);
                              }
                              const readySrc =
                                momCompositeLocalPreviewSrc ??
                                (p34FinalSrc && isGiverDedicationPage && !p34HasLocalChanges
                                  ? p34FinalSrc
                                  : src);
                              markPreviewPageReady(loadedPageId, readySrc);
                            }}
                          />
                          {(() => {
                            const p34InteractionReadyKey =
                              p34FinalSrc && !p34HasLocalChanges
                                ? p34FinalSrc
                                : `${p34BaseSrc}:canvas`;
                            const showP34MobileButtons =
                              isGiverDedicationPage &&
                              displayViewMode === 'double' &&
                              !pageFailed &&
                              !isSwapping &&
                              isPreviewPageReady(page.page_id, p34InteractionReadyKey);
                            if (!showP34MobileButtons) return null;
                            return (
                              <div className="mt-2 w-full grid grid-cols-2 gap-2 md:hidden">
                                <div className="w-full flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      giverFileInputRef.current?.click();
                                    }}
                                    className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('giver')}`}
                                  >
                                    {giverPhotoButtonLabel}
                                  </button>
                                </div>
                                <div className="w-full flex flex-col items-center">
                                  <button
                                    type="button"
                                    onClick={openDedicationEditor}
                                    className={`text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm ${getMissingButtonClass('dedication')}`}
                                  >
                                    {dedicationButtonLabel}
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                          {momCompositeButton &&
                            displayViewMode !== 'single' &&
                            isPreviewPageReady(
                              page.page_id,
                              momCompositeLocalPreviewSrc ?? src
                            ) && (
                            <div className="mt-2 w-full flex justify-center md:hidden">
                              {momCompositeButton}
                            </div>
                          )}
                          {momCompositeButton &&
                            displayViewMode === 'single' &&
                            isPreviewPageReady(
                              page.page_id,
                              momCompositeLocalPreviewSrc ?? src
                            ) && (
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
              </div>
            )}

            <div ref={previewBottomSentinelRef} className="h-4 w-full shrink-0" aria-hidden="true" />
          </main>
        ) : (
          // Others 标签页内容
          <main className="flex-1 flex flex-col items-center justify-center w-full gap-[64px]">
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

              {/* 封面选项 */}
              {!isLoadingOptions && bookOptions && bookOptions.cover_options && bookOptions.cover_options.length > 0 && (
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
                        const coverDims = getCoverDisplayDimensions(coverDisplayAspectRatio);

                        // 仅对 cover 1 / 2 在按钮缩略图中叠加名字，其余封面保持原图
                        const coverId = resolveCoverNumericId(option);

                        if (coverId === '1' || coverId === '2') {
                          return (
                            <div className="relative w-full mb-2 overflow-hidden">
                              <CoverOptionImageWithName
                                bookId={searchParams.get('bookid')}
                                option={option}
                                // 同样使用本地域名代理地址，保证缩略图 Canvas 也能正常叠加名字
                                baseSrc={canvasBase}
                                displayAspectRatio={coverDisplayAspectRatio}
                                recipient={recipient}
                                coverTextVariables={coverTextVariables}
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
                          const backendSrc = raw ? buildProtectedPreviewDisplayUrl(String(raw)) : '';
                          const coverHasSwap = !!(coverPage as any)?.has_face_swap;
                          const coverHasBase = !!(coverPage as any)?.base_image_url || !!(coverPage as any)?.image_url;
                          const coverFailed = String((coverPage as any)?.status || '').toLowerCase() === 'failed';
                          const coverNeedsOverlay =
                            coverHasSwap && coverHasBase && !hasMeaningfulFinalImage(coverPage) && !coverFailed;
                          const coverProgress = coverPage ? Math.round(pageProgress[(coverPage as any).page_id] ?? 0) : 0;
                          const coverOverlayMode = coverFailed ? 'failed' : (coverProgress > 0 ? 'progress' : 'loading');
                          const coverHasFinal = coverPage ? hasMeaningfulFinalImage(coverPage) : false;
                          const waitingForBackendCoverDisplay =
                            !backendSrc &&
                            !coverFailed &&
                            !isCompleted &&
                            (isProcessingLike ||
                              (!!coverPage && coverProgress > 0 && !coverHasFinal));
                          const showThumbBusyOverlay =
                            coverFailed ||
                            coverNeedsOverlay ||
                            waitingForBackendCoverDisplay;

                          return (
                            <div className="relative w-full mb-2">
                              <CoverSpreadFrame
                                cropRightHalf={cropRightHalf}
                                frameAspectRatio={coverDisplayAspectRatio}
                                className="relative w-full overflow-hidden"
                              >
                                {backendSrc ? (
                                  <OptimizedImage
                                    src={backendSrc}
                                    alt={`Cover ${option.id} - ${option.name}`}
                                    width={coverDims.width}
                                    height={coverDims.height}
                                    className={coverFitFrameImageClass}
                                    style={coverSpreadImageStyle}
                                  />
                                ) : (
                                  <Image
                                    src={base}
                                    alt={`Cover ${option.id} - ${option.name}`}
                                    width={coverDims.width}
                                    height={coverDims.height}
                                    className={coverFitFrameImageClass}
                                    style={coverSpreadImageStyle}
                                  />
                                )}
                              </CoverSpreadFrame>
                              {showThumbBusyOverlay && (
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
                              width={coverDims.width}
                              height={coverDims.height}
                              className={coverNaturalImageClass}
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
              {!isLoadingOptions && (!bookOptions || !bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
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
            <section ref={bindingRef} className="w-full mt-2 max-w-4xl mx-auto">
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
                        const { finalPrice, originalPrice, sourceSku } = getBindingDisplayPrice(option);
                        
                        // 调试日志
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[Book Format Price]', {
                            bindingTypePrices: (bookInfo as any)?.binding_type_prices,
                            sourceSku,
                            finalPrice,
                            originalPrice,
                            optionName: option.name,
                            optionKey: option.option_key,
                          });
                        }
                        
                        return originalPrice > finalPrice
                          ? <DisplayPrice value={originalPrice} discount={finalPrice.toFixed(2)} />
                          : <DisplayPrice value={finalPrice} />;
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
                          Processing...
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
          accept="image/jpeg,image/png,image/webp"
          onChange={handleGiverFileSelect}
          className="hidden"
        />
        <input
          ref={momDrawingFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
                  const pageCode =
                    activeMomDrawingPageCode ?? activeMomDrawingPageCodeRef.current ?? null;
                  if (!pageCode) {
                    closeMomDrawingCropper();
                    return;
                  }
                  closeMomDrawingCropper();
                  void uploadMomCompositeImage(pageCode, file);
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
                  const displayedPages = getDisplayedPreviewPages(previewData?.preview_data);
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
                        // 用户上传后：等 Canvas 合成并上传成功后再更新展示
                        try {
                          setGuestUploadRateLimitError(null);
                          saveP34PreUploadSnapshot();
                          const objUrl = URL.createObjectURL(file);
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result;
                            if (typeof result === 'string' && result.startsWith('data:')) {
                              p34GiverDataRef.current = result;
                            }
                            setP34PendingCompose({ giverUrl: objUrl });
                            shouldUploadP34ComposedRef.current = true;
                            p34UploadCompletesNameOnBookRef.current = true;
                            p34ComposeUploadedRef.current = false;
                            setP34ComposeUploading(true);
                          };
                          reader.onerror = () => {
                            URL.revokeObjectURL(objUrl);
                            toast.error('Upload failed, please try again.');
                          };
                          reader.readAsDataURL(file);
                        } catch {
                          toast.error('Upload failed, please try again.');
                        }
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
              // 寄语弹窗：标题两侧 X / ✓；Cancel 丢弃本次修改，✓ 仅在文案变更时保存
              <div className="bg-white w-[600px] max-w-[95vw] min-h-[400px] max-h-[90vh] overflow-y-auto rounded-sm pt-6 pr-6 pb-6 pl-6 flex flex-col gap-5">
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleDedicationCancel}
                      aria-label="Cancel"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#222222] hover:text-gray-600"
                    >
                      <IoCloseOutline className="text-2xl leading-none" />
                    </button>
                    <h2 className="flex-1 text-center text-lg font-semibold text-[#222222]">
                      Make this message yours
                    </h2>
                    <button
                      type="button"
                      onClick={handleDedicationContinue}
                      aria-label="Save message"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#222222] hover:text-gray-600"
                    >
                      <IoCheckmarkOutline className="text-2xl leading-none" />
                    </button>
                  </div>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    Use our heartfelt message as a starting point, or replace it with your own words.
                  </p>
                  <div className="flex text-gray-500 text-sm">
                    <span>
                      There&apos;s a {dedicationMaxLines} line limit (including blank lines)
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
                          {message.split('\n').length}/{dedicationMaxLines} line
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* 吸底 Complete / Continue 按钮 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white items-center justify-end h-[76px] pt-4 pb-4 gap-3 shadow-[0px_0px_16px_0px_#0000000D] ${
          hidePreviewBottomBar ? 'hidden' : isGuest ? 'hidden md:flex' : 'flex'
        } px-4 md:px-[120px]`}
      >
        <button
          type="button"
          onClick={handlePreviewPrimaryAction}
          disabled={isAddingToCart}
          className="bg-[#222222] text-[#F5E3E3] h-[44px] w-full md:w-auto md:min-w-[220px] px-8 rounded hover:bg-[#333333] disabled:bg-gray-400 disabled:cursor-not-allowed text-[16px] leading-[24px] tracking-[0.5px] flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F5E3E3]" />
              Processing...
            </>
          ) : (
            previewBottomButtonLabel
          )}
        </button>
      </div>

      {p34ComposeUploading && p34PageMetaForUpload?.baseSrc && p34UploadComposeProps && (
        <div aria-hidden className="fixed -left-[9999px] top-0 h-px w-px overflow-hidden pointer-events-none">
          <GiverDedicationCanvas
            imageUrl={p34PageMetaForUpload.baseSrc}
            mode="double"
            giverText={giver}
            dedicationText={p34UploadComposeProps.dedicationText}
            giverImageUrl={p34UploadComposeProps.giverImageUrl}
            giverImageScale={p34UploadComposeProps.giverImageScale}
            dedicationTextAlign={p34UploadComposeProps.dedicationTextAlign}
            dedicationSidePaddingRatio={p34UploadComposeProps.dedicationSidePaddingRatio}
            dedicationSidePaddingLeftRatio={p34UploadComposeProps.dedicationSidePaddingLeftRatio}
            onRendered={uploadP34ComposedImage}
          />
        </div>
      )}

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

