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
import api from '@/utils/api';
import echo from '@/app/config/echo';
import { useTranslations, useLocale } from 'next-intl';
import useImageUpload from '../hooks/useImageUpload';
import useUserStore from '@/stores/userStore';
import usePreviewStore from '@/stores/previewStore';
import toast from 'react-hot-toast';
import { PreviewResponse, PreviewCharacter, PreviewPage, FaceSwapBatch, ApiResponse, CartAddRequest, CartAddResponse } from '@/types/api';
import { BaseBook, DetailedBook } from '@/types/book';
import { API_CART_LIST } from '@/constants/api';

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

// 使用 React.createElement 创建 l-mirage 组件（带降级方案，避免部分浏览器出现蓝色问号占位）
const MirageLoader = ({ size = "60", speed = "2.5", color = "blue", style = {} }: {
  size?: string;
  speed?: string;
  color?: string;
  style?: React.CSSProperties;
}) => {
  const [isMirageReady, setIsMirageReady] = React.useState(false);
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'customElements' in window) {
        setIsMirageReady(!!customElements.get('l-mirage'));
      }
    } catch {}
  }, []);

  // 独立的 WebSocket 订阅：依赖 echo 和 user.id，确保用户信息晚到也能订阅
  // 已移动到主组件中，避免在此处无法访问到 user 和页面状态

  if (isMirageReady) {
    return React.createElement('l-mirage', { size, speed, color, style });
  }
  // 降级到简易 CSS spinner，保证在不支持 web component 的环境下也有正常的加载态
  const numericSize = parseInt(size, 10) || 60;
  return (
    <div
      className="animate-spin rounded-full border-b-2"
      style={{
        width: numericSize,
        height: numericSize,
        borderColor: color,
        ...style,
      }}
      aria-label="loading"
    />
  );
};

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
}: {
  pageId: number;
  pageNumber: number;
  src: string;
  viewMode: 'single' | 'double';
  showOverlay: boolean;
  progress: number;
  overlayMode?: 'progress' | 'loading';
  content?: string | null;
  customOverlayContent?: React.ReactNode;
}) {
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
                  />
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  {overlayMode === 'progress' ? (
                    <div className="text-center" style={{ width: 240 }}>
                      <div className="bg-gray-200 rounded-full overflow-hidden" style={{ width: 240, height: 8 }}>
                        <div
                          className="w-full h-full bg-[#012CCE] transition-[width] duration-200 ease-out"
                          style={{ width: `${Math.round(progress)}%` }}
                        />
                      </div>
                      <p className="text-gray-700 mt-2 text-sm">{Math.round(progress)}%</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MirageLoader size="60" speed="2.5" color="blue" />
                      <p className="text-gray-600 mt-2">loading...</p>
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
                  />
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  {overlayMode === 'progress' ? (
                    <div className="text-center" style={{ width: 240 }}>
                      <div className="bg-gray-200 rounded-full overflow-hidden" style={{ width: 240, height: 8 }}>
                        <div
                          className="w-full h-full bg-[#012CCE] transition-[width] duration-200 ease-out"
                          style={{ width: `${Math.round(progress)}%` }}
                        />
                      </div>
                      <p className="text-gray-700 mt-2 text-sm">{Math.round(progress)}%</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MirageLoader size="60" speed="2.5" color="blue" />
                      <p className="text-gray-600 mt-2">loading...</p>
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
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            {overlayMode === 'progress' ? (
              <div className="text-center" style={{ width: 240 }}>
                <div className="bg-gray-200 rounded-full overflow-hidden" style={{ width: 240, height: 8 }}>
                  <div
                    className="w-full h-full bg-[#012CCE] transition-[width] duration-200 ease-out"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
                <p className="text-gray-700 mt-2 text-sm">{Math.round(progress)}%</p>
              </div>
            ) : (
              <div className="text-center">
                <MirageLoader size="60" speed="2.5" color="blue" />
                <p className="text-gray-600 mt-2">loading...</p>
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
            }}
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
  const { user } = useUserStore();
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

  // KS 流程：通过查询参数关闭 Others 标签
  const isKs = searchParams.get('ks') === '1';

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
        const items = res?.data?.cart_items || res?.cart_items || [];
        if (!Array.isArray(items) || items.length === 0) return;
        // 优先用 previewid 匹配
        let match = null as any;
        if (previewIdParam) {
          match = items.find((ci: any) => String(ci.preview_id) === String(previewIdParam));
        }
        if (!match) return;
        const msg = match?.preview?.message || match?.preview?.dedication;
        console.debug('预填购物车留言命中:', { previewIdParam, hasMatch: !!match, msgExists: typeof msg === 'string' && !!msg.trim() });
        // 仅当当前 message 还是默认文案时覆盖，避免用户已编辑被覆盖
        if (typeof msg === 'string' && msg.trim()) {
          if (message === defaultMessage || !message || message.trim() === '') {
            setMessage(msg);
          }
          // 同步到画布渲染用的 dedication（后端 message 即前端 dedication）
          setDedication(msg);
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
          const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
          const path = `/products/${bookIdParam}/preview/batches/${previewIdParam}`;
          const url = base ? `${base}${path}` : path;
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
        const match = items.find((ci: any) => String(ci.preview_id) === String(previewIdParam));
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
            const msg = match?.preview?.message || match?.preview?.dedication || match?.message;
            if (msg) {
               setMessage(msg);
               setDedication(msg);
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

  // 为 Others 标签页添加局部状态，用于记录选中的选项
  const [selectedBookCover, setSelectedBookCover] = React.useState<number | null>(null);
  const [selectedBinding, setSelectedBinding] = React.useState<number | null>(null);
  const [selectedGiftBox, setSelectedGiftBox] = React.useState<number | null>(null);
  const [detailModal, setDetailModal] = React.useState<GiftBoxOption | null>(null);
  // 当前展示图片的索引，用于翻页
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState<string>("");
  
  // Giver图片编辑：隐藏的文件输入框
  const giverFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingGiverFile, setPendingGiverFile] = React.useState<string | null>(null);
  
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

  // 添加 options 状态
  const [bookOptions, setBookOptions] = useState<BookOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // 仅预填一次个性化产品的封面/装订/礼盒选项
  const hasPrefilledOptionsRef = useRef(false);
  useEffect(() => {
    if (hasPrefilledOptionsRef.current) return;
    if (!bookOptions) return;
    const previewIdParam = searchParams.get('previewid');
    if (!previewIdParam) return;
    (async () => {
      try {
        const res = await api.get(API_CART_LIST) as any;
        const items = res?.data?.items || res?.data?.cart_items || res?.cart_items || [];
        if (!Array.isArray(items) || items.length === 0) return;
        const match = items.find((ci: any) => String(ci.preview_id) === String(previewIdParam));
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

    const step = 98 / 900; // 3 分钟线性到 98%

    // 遍历每页：仅当上一页 final 已出现时，才启动下一页进度；
    // 若该页仅有 base（无 final）但未轮到它，则显示 loading（由 overlayMode 控制）
    let previousFinalAppeared = true;
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const pid = Number(p.page_id);
      const hasBase = !!(p as any).base_image_url || (!!p.image_url && (p as any).base_only === true);
      const hasFinal = !!(p as any).final_image_url && (p as any).base_only === false;

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
      const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
      const path = `/products/${encodeURIComponent(String(bookId))}`;
      const url = base ? `${base}${path}` : path;
      const resp = await api.get(url, { params: { language: displayLang } }) as any;
      const product = resp?.data?.data || resp?.data || {};

      const attributes: any[] = Array.isArray(product.attributes) ? product.attributes : [];
      const pages: any[] = Array.isArray(product.pages) ? product.pages : [];

      const coverAttr = attributes.find((a: any) => a?.name === 'cover_style');
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
        image_url: pageImgByCode[String(o?.value)] || '',
        is_default: !!o?.is_default,
        option_key: String(o?.value),
      }));

      const binding_options = (bindingAttr?.options || []).map((o: any, idx: number) => ({
        id: idx + 1,
        option_type: String(o?.value).toUpperCase(),
        option_key: String(o?.value),
        name: o?.label || String(o?.value),
        description: null,
        price: Number(o?.price_diff || 0),
        currency_code: 'USD',
        image_url: '',
        is_default: !!o?.is_default,
      }));

      const gift_box_options = (giftAttr?.options || []).map((o: any, idx: number) => ({
        id: idx + 1,
        name: o?.label || String(o?.value),
        price: Number(o?.price_diff || 0),
        currency_code: 'USD',
        image_url: '',
        is_default: !!o?.is_default,
        option_key: String(o?.value),
      }));

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
        setBookInfo(response.data!);
        // 记录预览页数量
        try {
          const count = Number((response.data as any)?.preview_pages_count);
          if (!Number.isNaN(count) && count > 0) setPreviewPagesCount(count);
        } catch {}
        // 记录有可替换文本（2）的页ID集合，供预览渲染时判断
        try {
          const pages = response.data?.pages || [];
          const targets = pages.filter(p => Number(p?.has_replaceable_text) === 2);
          const ids = targets.map(p => Number(p.id)).filter(n => !Number.isNaN(n));
          const nums = targets.map(p => Number(p.page_number)).filter(n => !Number.isNaN(n));
          setReplaceableTextPageIds(new Set(ids));
          setReplaceableTextPageNumbers(new Set(nums));
        } catch {}
        console.log('书籍信息获取成功:', response.data);
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

  // 定义侧边栏各项，并为每个项配置默认图标和完成后的图标
  const sidebarItems = [
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

  // 为每个部分创建 ref（用于滚动定位）
  const giverRef = useRef<HTMLDivElement>(null);
  const dedicationRef = useRef<HTMLDivElement>(null);
  const coverDesignRef = useRef<HTMLDivElement>(null);
  const bindingRef = useRef<HTMLDivElement>(null);
  const giftBoxRef = useRef<HTMLDivElement>(null);

  // 监听 URL tab 参数，跳转到指定部分
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'giftBox' || tabParam === 'addons') {
      setActiveTab('Others');
      // 延迟滚动以确保 DOM 渲染
      setTimeout(() => {
        if (giftBoxRef.current) {
          giftBoxRef.current.scrollIntoView({ behavior: "smooth" });
          setActiveSection('giftBox');
        }
      }, 300);
    }
  }, [searchParams, setActiveTab, setActiveSection]);
  
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
    // 与其他页面保持一致，PICBOOK_GOODNIGHT3 资源使用 PICBOOK_GOODNIGHT 目录
    if (normalizedBookId === 'PICBOOK_GOODNIGHT3') {
      normalizedBookId = 'PICBOOK_GOODNIGHT';
    }

    const rawCoverKey = option.option_key || String(option.id);
    const coverId = /^\d+$/.test(rawCoverKey) ? rawCoverKey : String(option.id);

    const folder = `${baseDomain}/${encodeURIComponent(normalizedBookId)}/covers/cover_${encodeURIComponent(coverId)}`;
    const cropRightHalf = ['1', '2', '3', '4'].includes(coverId);

    return {
      key: `${normalizedBookId}_${coverId}`,
      base: `${folder}/base.webp`,
      cropRightHalf,
    };
  };

  // 为装订方式构建 Cloudflare R2 图片 URL（hardcover / softcover / premium）
  const buildBindingImageUrl = (option: BindingOption) => {
    const baseDomain = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/product-options/covers';
    const rawKey = String(option.option_key || option.option_type || option.name || '').toLowerCase();

    if (rawKey.includes('hard')) {
      // 精装
      return `${baseDomain}/hardcover.webp`;
    }
    if (rawKey.includes('soft') || rawKey.includes('paper')) {
      // 软封 / 平装
      return `${baseDomain}/softcover.webp`;
    }
    if (rawKey.includes('premium')) {
      // 高级版
      return `${baseDomain}/premium.webp`;
    }

    // 兜底：保持之前行为
    if (option.image_url && option.image_url.startsWith('http')) {
      return option.image_url;
    }
    return '/format.png';
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
        const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
        const path = `/products/${spuCode}/preview/batches/${batchId}`;
        const url = base ? `${base}${path}` : path;
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
          const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
          const path = `/products/${spuCode}/preview/batches/${batchId}`;
          const url = base ? `${base}${path}` : path;
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
                } as any;
              }
            const updated = {
              ...prev,
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
                      image_url: imageUrl || p.image_url, 
                      has_face_swap: !!data?.has_face_elements,
                      base_only: data?.base_only ?? (data?.final_image_url ? false : data?.base_image_url ? true : p.base_only),
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
        : (process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api');
      const url = `${apiBase}/products/${encodeURIComponent(spuCode)}/preview/render`;
      let authHeader: string | undefined = undefined;
      try {
        const tk = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (tk) authHeader = `Bearer ${tk}`;
      } catch {}
      if (!authHeader && process.env.NEXT_PUBLIC_API_STATIC_TOKEN) {
        authHeader = `Bearer ${process.env.NEXT_PUBLIC_API_STATIC_TOKEN}`;
      }
      const resp = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`请求失败 (${resp.status}): ${text}`);
      }
      const reader = resp.body?.getReader();
      if (!reader) {
        throw new Error('当前环境不支持流式响应');
      }
      const decoder = new TextDecoder();
      let buffer = '';
      // 持续读取 NDJSON
      while (true) {
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
        return { skin_tone, hair_style, hair_color };
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

      const apiRequestData = {
        picbook_id: bookId,
        // 新接口：face_images 为对象数组，包含 filename/mime/data（data URL）
        face_images: faceImages.map((dataUrl: string, idx: number) => ({
          filename: `face_${idx + 1}.jpg`,
          mime: dataUrl?.slice(5, dataUrl.indexOf(';'))?.replace('data:', '') || 'image/jpeg',
          data: dataUrl,
        })),
        full_name: character?.full_name,
        language: character?.language || 'en', // 默认英语
        gender: genderStr,
        skincolor: character?.skincolor || 1, // 默认值
        attributes: toBackendAttrs(character)
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
                    const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
                    const path = `/products/${spu}/preview/batches/${bid}`;
                    const url = base ? `${base}${path}` : path;
                    api.get(url).then((res: any) => {
                      const batch = res?.data?.batch;
                      if (batch) {
                        const recipientName = batch.recipient_name || batch.options?.recipient_name || batch.options?.full_name;
                        if (recipientName && typeof recipientName === 'string' && recipientName.trim()) {
                          setRecipient(recipientName);
                          console.log('[Preview] Updated recipient from new batch:', recipientName);
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
            return { skin_tone, hair_style, hair_color };
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

          const apiRequestData = {
            picbook_id: bookId,
            // 新接口：face_images（data URL 列表转对象）
            face_images: faceImages.map((dataUrl: string, idx: number) => ({
              filename: `face_${idx + 1}.jpg`,
              mime: dataUrl?.slice(5, dataUrl.indexOf(';'))?.replace('data:', '') || 'image/jpeg',
              data: dataUrl,
            })),
            full_name: character?.full_name,
            language: character?.language,
            gender: genderStr,
            relationship: relationshipStr,
            skincolor: character?.skincolor,
            attributes: toBackendAttrs2(character)
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
    giver: giver.trim() !== "",
    dedication: dedication.trim() !== "",
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
      // 检查是否所有必要的部分都已完成
      // 允许未填写 giver 和 dedication 也能继续
      const incompleteSections = Object.entries(completedSections)
        .filter(([section, completed]) => section !== 'giver' && section !== 'dedication' && !completed)
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

      console.log('调用购物车API:', {
        url: '/cart/add',
        method: 'POST',
        data: cartData,
        hasOldPreviewId: !!oldPreviewId
      });
      
      console.debug('[AddToCart] Sending request /cart/add with data:', cartData);
      const response = await api.post('/cart/add', cartData) as ApiResponse<CartAddResponse>;
      console.debug('[AddToCart] Response:', response);

      if (response.success) {
        // 根据是否有 old_preview_id 显示不同的成功消息
        // if (oldPreviewId) {
        //   toast.success('购物车已更新！');
        // } else {
        //   toast.success('商品已成功添加到购物车！');
        // }
        // 跳转到购物车页面
        router.push('/shopping-cart');
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
  const defaultName = (recipient && recipient.trim()) ? recipient : "User"; // 使用 Full name 作为默认名
  // 默认寄语按预览语言（来自 personalize 传入的 ?lang）选择
  const selectedLang = (searchParams.get('lang') || 'en').toLowerCase();
  const isZhLang = selectedLang.startsWith('zh');
  // 获取bookId用于匹配不同的寄语模板
  const bookId = searchParams.get('bookid') || (bookInfo?.id != null ? String(bookInfo.id) : '') || bookInfo?.spu_code || '';
  const buildDefaultMessage = (name: string, lang: string, bookIdParam?: string) => {
    const bookIdUpper = (bookIdParam || bookId || '').toUpperCase();
    
    // 根据bookId判断书籍类型
    let templateType: 'goodnight' | 'santa' | 'bravery' | 'birthday' | 'default' = 'default';
    
    if (bookIdUpper.includes('GOODNIGHT')) {
      templateType = 'goodnight';
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
        default:
          return `Dear ${name},\n  The world is full of wonderful, surprising places to explore. May your days be full of discoveries, adventure and joy!`;
      }
    }
  };
  const defaultMessage = buildDefaultMessage(defaultName, selectedLang, bookId);

  const [message, setMessage] = React.useState(defaultMessage);
  // 跟踪上一次默认寄语，用于判断是否应同步更新（避免覆盖用户已编辑的内容）
  const prevDefaultMessageRef = React.useRef(defaultMessage);
  React.useEffect(() => {
    const prev = prevDefaultMessageRef.current;
    const userHasNotEdited = !message || message.trim() === '' || message === prev;
    if (userHasNotEdited) {
      setMessage(defaultMessage);
      setDedication(defaultMessage);
    } else if (!dedication || dedication.trim() === '' || dedication === ' ') {
      // 用户编辑了 message，但画布用的 dedication 仍为空，则仅同步画布默认值
      setDedication(defaultMessage);
    }
    prevDefaultMessageRef.current = defaultMessage;
  }, [defaultMessage, message, dedication]);
  
  // 当bookId或语言变化时，如果用户未编辑，则更新为新的模板
  React.useEffect(() => {
    const newDefaultMessage = buildDefaultMessage(defaultName, selectedLang, bookId);
    const prev = prevDefaultMessageRef.current;
    const userHasNotEdited = !message || message.trim() === '' || message === prev;
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
    if (!message || message.trim() === '' || message === prevTemplate) setMessage(nextTemplate);
    if (!dedication || dedication.trim() === '' || dedication === prevTemplate) setDedication(nextTemplate);
    prevRecipientRef.current = recipient;
  }, [recipient, selectedLang, defaultName, message, dedication, bookId]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                if (isKs && tab === 'Others') return;
                setActiveTab(tab);
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              hideOthers={isKs}
            />
          </div>
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full pt-14">
            <h1 className="text-[28px] mt-2 mb-4 text-center w-full">Your book for {recipient?.trim()}</h1>
            
            {/* 书籍封面 */}
            <div className="flex flex-col items-center w-full max-w-3xl">
              <div className="w-full flex justify-center mb-8">
                {(() => {
                  // 尝试获取当前选中的封面，或者默认使用 cover 3
                  let activeOption = null;
                  if (bookOptions?.cover_options) {
                    if (selectedBookCover) {
                      activeOption = bookOptions.cover_options.find((o) => o.id === selectedBookCover);
                    }
                    if (!activeOption) {
                      activeOption = bookOptions.cover_options.find((o) => String(o.id) === '3' || o.option_key === '3');
                    }
                    // 如果还没有 cover 3 (比如 ID 不匹配)，且没有选中项，则兜底取第一个
                    if (!activeOption && !selectedBookCover && bookOptions.cover_options.length > 0) {
                      activeOption = bookOptions.cover_options[0];
                    }
                  }

                  const coverUrls = activeOption ? buildCoverR2Urls(searchParams.get('bookid'), activeOption) : null;

                  if (coverUrls) {
                    const { base, cropRightHalf } = coverUrls;
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
                          <MirageLoader size="60" speed="2.5" color="blue" />
                          <p className="text-gray-600 mt-2">loading...</p>
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
                          <MirageLoader size="60" speed="2.5" color="blue" />
                          <p className="text-gray-600 mt-2">loading...</p>
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
            </div>
            {/* 寄语页已移除：改为叠加至第二张预览图 */}

            {/* 换脸状态信息（仅排队时展示提示条），放在寄语页下方 */}
            {(() => {
              const displayedPages = (previewData?.preview_data ?? []).filter((p: any) => !(p as any).is_cover);
              const hasAnyBase = displayedPages.some((p: any) => !!(p as any).base_image_url || (!!p.image_url && (p as any).base_only === true));
              if (hasAnyBase) return null; // 一旦出现任意 base 图，隐藏所有队列提示
              const pos = Number(queueStatus?.position ?? 0);
              const tot = Number(queueStatus?.total ?? 0);
              const hasPos = pos > 0 && tot > 0;
              const showNumbered = hasPos; // 一旦拿到队列信息就显示数字版本
              return (
                <div className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222]">
                  <p>
                    {showNumbered ? t('queueTip', { pos, tot }) : t('queueTipNoPos')} <br />
                    {t('selectOptions', { options: buildOptions({
                      cover: !completedSections.coverDesign,
                      binding: !completedSections.binding,
                      wrap: !completedSections.giftBox
                    }, displayLang) })}{' '}
                    {!isKs && (
                      <a
                        className="underline cursor-pointer text-blue-600"
                        onClick={() => setActiveTab('Others')}
                      >
                        Others
                      </a>
                    )}
                  </p>
                </div>
              );
            })()}

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
                    const hasBase = !!(page as any).base_image_url || (!!page.image_url && (page as any).base_only === true);
                    const hasFinal = !!(page as any).final_image_url && (page as any).base_only === false;
                    const needsOverlay = hasSwap && hasBase && !hasFinal;
                    const isSwapping = needsOverlay;
                    const progress = Math.round(pageProgress[page.page_id] ?? 0);
                    const src = buildImageUrl(page.image_url);
                    const isReplaceablePage = replaceableTextPageIds.has(page.page_id) || replaceableTextPageNumbers.has(page.page_number);
                    // 轮到该页前（progress 为 0）显示 loading；开始后显示进度
                    const overlayMode = (progress > 0 ? 'progress' : 'loading');
                      // 仅在 page_code === 'p3-4' 的页面渲染 Giver & Dedication
                      const isGiverDedicationPage = String((page as any).page_code || '') === 'p3-4';
                      // 单页模式：在 p3-4 直接用 GiverDedicationCanvas 取代基础图
                      if (isGiverDedicationPage && viewMode === 'single') {
                        return (
                        <div key={page.page_id} ref={giverRef} className="w-full flex flex-col items-center">
                          <div className="w-full max-w-5xl">
                            <GiverDedicationCanvas
                              className="w-full"
                              imageUrl={src}
                              mode="single"
                              giverText={giver}
                              dedicationText={dedication}
                              giverImageUrl={giverImageUrl}
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
                      <div key={page.page_id} ref={isGiverDedicationPage ? dedicationRef : undefined} className="w-full flex flex-col items-center">
                        <div className="w-full max-w-5xl">
                          <PreviewPageItem
                            pageId={page.page_id}
                            pageNumber={page.page_number}
                            src={src}
                            viewMode={viewMode}
                            showOverlay={isSwapping}
                            progress={progress}
                            overlayMode={overlayMode as any}
                            content={page.content}
                            customOverlayContent={isGiverDedicationPage ? (
                              <div className="w-full h-full relative">
                                <GiverDedicationCanvas
                                  className="w-full h-full"
                                  imageUrl={src}
                                  mode="double"
                                  giverText={giver}
                                  dedicationText={dedication}
                                  giverImageUrl={giverImageUrl}
                                />
                                <div className="pointer-events-none">
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
                              </div>
                            ) : undefined}
                          />
                        </div>
                      </div>
                    );
                  });
                  })()}
                </div>
                {(isCompleted) && (
                  <p className="text-center text-[#999999] mt-8">
                    We've specially curated {previewData.preview_data.length} pages for you – enjoy a sneak peek of your unique story!
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
                <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
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

                        const { base, cropRightHalf } = coverUrls;

                        return (
                          <div className={`relative w-full mb-2 ${cropRightHalf ? 'aspect-square overflow-hidden' : ''}`}>
                            <Image
                              src={base}
                              alt={`Cover ${option.id} - ${option.name}`}
                              width={cropRightHalf ? 400 : 200}
                              height={200}
                              className={`w-full ${cropRightHalf ? 'h-full object-cover object-right' : 'h-auto'}`}
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
                          ${option.price} {option.currency_code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 当没有封面选项时的提示 */}
              {!isLoadingOptions && !optionsError && bookOptions && (!bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无封面选项可用</p>
                </div>
              )}
              
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
            <section  ref={bindingRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-[28px] text-center mb-2">Choose your book format</h1>
              <p className="text-center text-gray-600 mb-4">
                Pick the format that best fits how you'll treasure or gift it.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookOptions?.binding_options?.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBinding(selectedBinding === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBinding === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <Image
                      src={buildBindingImageUrl(option)}
                      alt={option.name}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{option.name}</h2>
                    <p className="text-lg font-medium text-center mb-2">${option.price} {option.currency_code}</p>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
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
                ))}
              </div>
            </section>

            {/* Book Wrap Section */}
            <section ref={giftBoxRef} className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-[28px] text-center mb-2">Make the surprise complete</h1>
              <p className="text-center text-gray-600 mb-4">
                A lovely gift box makes the surprise truly unforgettable.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
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
                      src={(option.image_url && option.image_url.startsWith('http')) ? option.image_url : '/wrap.png'}
                      alt={option.name}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{option.name}</h2>
                    {option.price != null && (
                      <p className="text-lg font-medium text-center mb-2">${option.price} {option.currency_code}</p>
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
                          src={(detailModal.images && detailModal.images[currentIndex]) || detailModal.image_url || '/wrap.png'}
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
                        <h2 className="text-xl">{detailModal.name}</h2>
                        <p className="text-gray-600 mt-2">
                          {detailModal.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-6 h-[44px] justify-between">
                    <div className="flex items-end gap-3">
                      <span className="text-[#012CCE] text-3xl font-semibold">
                        ${detailModal.price ?? 0} {detailModal.currency_code ?? ''}
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
                      aspectRatio={1}
                      maxSize={1024}
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
                      onDone={(url) => {
                        if (url) {
                          // 后端返回的 image_url 是更新后的页面预览图片，需要更新预览数据中 p3-4 页面的 image_url
                          setPreviewData((prev) => {
                            if (!prev || !prev.preview_data) return prev;
                            return {
                              ...prev,
                              preview_data: prev.preview_data.map((p: any) =>
                                String((p as any).page_code || '') === 'p3-4'
                                  ? { ...p, image_url: url }
                                  : p
                              ),
                            } as any;
                          });
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
              // 寄语弹窗
              <div className="bg-white w-[600px] h-[464px] rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-7">
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
                      onChange={handleMessageChange}
                      placeholder="Please enter your message..."
                      className="w-full p-2 border border-[#E5E5E5] placeholder-[#999999] rounded focus:outline-none ring-0 resize-none"
                    />
                    <div className="flex justify-end space-x-4 text-[#999999] text-sm">
                      <span>
                        {message.length}/{MAX_CHARS} left
                      </span>
                      <span>
                        {message.split('\n').length}/{MAX_LINES} line
                      </span>
                    </div>
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => {
                      setDedication(message);
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
                    if (item.id === "giver" || item.id === "dedication") {
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
                  : 'bg-[#222222] hover:bg-[#333333]'
              } text-[#F5E3E3]`}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding to cart...
                </>
              ) : (
                'Add to cart'
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 手机端吸底进度条和 Continue 按钮 */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white border-t border-gray-200 shadow-lg">
        {/* 进度指示器 */}
        <div className="flex items-center justify-center gap-2 px-4 pt-4 pb-2">
          {(() => {
            // 排除 giver（personalize photo 是可选的）
            const steps = [
              { id: 'dedication', completed: completedSections.dedication },
              { id: 'coverDesign', completed: completedSections.coverDesign },
              { id: 'binding', completed: completedSections.binding },
              { id: 'giftBox', completed: completedSections.giftBox },
            ];
            
            return (
              <>
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step.completed ? 'bg-[#012CCE]' : 'bg-gray-300'
                      }`}
                    />
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-4 ${
                          step.completed ? 'bg-[#012CCE]' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
                {/* 向下箭头指示器 */}
                <div className="ml-2 text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L2 5H10L6 9Z" fill="currentColor"/>
                  </svg>
                </div>
              </>
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
                    'Add to cart'
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
    </div>
  );
}

