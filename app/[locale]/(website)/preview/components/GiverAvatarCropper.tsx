'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';
import EasyCrop, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import api from '@/utils/api';
import { getApiOrigin } from '@/utils/apiBaseUrl';
import { MdRotateLeft, MdRotateRight, MdFlip, MdRefresh } from '@/utils/icons';
import useUserStore from '@/stores/userStore';

type Props = {
  // 预览页：返回已上传到后端的图片 URL
  // 个性化页：也可以仅使用裁剪后的本地文件（见 onDoneFile）
  onDone: (url: string) => void;
  onCancel: () => void;
  // 可选：固定裁剪比例（例如头像 1:1）。不传则自由裁剪
  aspectRatio?: number | undefined;
  /**
   * 可选：固定导出裁剪结果的画布尺寸（像素）。
   * - 仅影响最终导出（getCroppedCanvas）的 width/height
   * - 通常与 aspectRatio 搭配使用，避免变形
   * - 若提供该值，将优先于 maxSize 生效
   */
  outputSize?: { width: number; height: number };
  // 可选：导出格式和质量
  exportMime?: 'image/jpeg' | 'image/png' | 'image/webp';
  exportQuality?: number; // 0-1，仅 JPEG/WebP 生效
  // 可选：限制导出最大尺寸（防止超大图）
  maxSize?: number; // 最大边长，像素
  // 可选：产品SPU代码，用于调用特殊图片上传接口
  spu?: string;
  // 可选：页面ID或页面编号，用于调用特殊图片上传接口
  page?: string | number;
  // 可选：批次ID，用于调用特殊图片上传接口
  batchId?: string;
  // 可选：初始图片URL，如果提供则直接使用，不触发文件选择器
  initialSrc?: string;
  /**
   * 可选：如果希望拿到裁剪后的 File，由外部决定如何处理/上传，
   * 则传入该回调。常用于个性化页面本地 base64 上传场景。
   */
  onDoneFile?: (file: File) => void | Promise<void>;
  /**
   * 结果模式：
   * - 'specialUpload'（默认）：走特殊上传接口，返回后端 image_url（Preview Giver 使用）
   * - 'file'：不调用后端上传，仅返回裁剪后的 File（Personalize 使用）
   */
  resultMode?: 'specialUpload' | 'file';
  /**
   * 弹层标题/副标题：个人化表单与预览扉页 giver 上传文案不同
   */
  uiVariant?: 'personalize' | 'openingPage';
};

const CROPPER_COPY: Record<'personalize' | 'openingPage', { title: string; subtitle: string }> = {
  personalize: {
    title: 'Add image',
    subtitle: 'Place the full head inside the circle',
  },
  openingPage: {
    title: 'Add a Photo for the Opening Page of Your Book',
    subtitle: 'Spark beautiful memories from the very first page.',
  },
};

type UploadRateLimitError = {
  title: string;
  message: string;
  retryText?: string;
};

const formatRetryAfter = (retryAfterSeconds: unknown, retryAfterMinutes: unknown): string | undefined => {
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
    return formatRetryAfter(undefined, Math.ceil(seconds / 60));
  }

  return undefined;
};

const getUploadRateLimitError = (error: unknown): UploadRateLimitError | null => {
  const err = error as any;
  const data = err?.response?.data;
  const status = err?.response?.status;
  if (status !== 429 && data?.code !== 'UPLOAD_RATE_LIMITED') return null;

  const retryText = formatRetryAfter(data?.retry_after, data?.retry_after_minutes);
  return {
    title: 'Upload limit reached',
    message:
      'You have reached the guest daily upload limit. Please sign in to continue uploading your images.',
    retryText,
  };
};

const ACCEPTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ACCEPTED_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_PIXELS = 36_000_000;

const getFileValidationError = (file: File): string | null => {
  const type = file.type?.toLowerCase();
  if (type && !ACCEPTED_IMAGE_MIME_TYPES.has(type)) {
    return 'Please upload a JPG, PNG, or WebP image.';
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    return 'Please upload an image smaller than 20MB.';
  }
  return null;
};

const loadImageDimensions = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (!width || !height) {
        reject(new Error('Could not read image dimensions.'));
        return;
      }
      resolve({ width, height });
    };
    img.onerror = () => reject(new Error('Could not read this image. Please try another file.'));
    img.src = src;
  });

// 复制 hooks 内部的地址规范化逻辑，便于将后端 path 转为可访问 URL
function toAbsoluteUrl(raw: string): string {
  if (!raw) return raw as unknown as string;
  let path = raw;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        path = arr[0];
      }
    } catch {}
  }
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (cleanPath.startsWith('user_uploads/')) {
    return `https://s3-pro-dre002.s3.us-east-1.amazonaws.com/${cleanPath}`;
  }
  return `${getApiOrigin()}/${cleanPath}`;
}

const getRadianAngle = (degree: number) => (degree * Math.PI) / 180;

const getSafeAreaSize = (width: number, height: number) =>
  Math.ceil(Math.max(width, height) * Math.SQRT2);

async function getCroppedCanvasFromArea(
  imageSrc: string,
  crop: Area,
  rotation: number
): Promise<HTMLCanvasElement> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = imageSrc;
  });

  const rotationRad = getRadianAngle(rotation);
  const safeSize = getSafeAreaSize(image.width, image.height);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process this image.');

  canvas.width = safeSize;
  canvas.height = safeSize;
  ctx.translate(safeSize / 2, safeSize / 2);
  ctx.rotate(rotationRad);
  ctx.translate(-safeSize / 2, -safeSize / 2);

  const x = (safeSize - image.width) / 2;
  const y = (safeSize - image.height) / 2;
  ctx.drawImage(image, x, y);

  const data = ctx.getImageData(
    Math.round(x + crop.x),
    Math.round(y + crop.y),
    Math.round(crop.width),
    Math.round(crop.height)
  );

  const out = document.createElement('canvas');
  out.width = Math.round(crop.width);
  out.height = Math.round(crop.height);
  const outCtx = out.getContext('2d');
  if (!outCtx) throw new Error('Could not process this image.');
  outCtx.putImageData(data, 0, 0);
  return out;
}

type PersonalizeCircleCropEditorProps = {
  src: string;
  isUploading: boolean;
  isCropperReady: boolean;
  onCancel: () => void;
  onApply: () => void;
  onReadyChange: (ready: boolean) => void;
  cropStateRef: React.MutableRefObject<{ area: Area | null; rotation: number }>;
};

function PersonalizeCircleCropEditor({
  src,
  isUploading,
  isCropperReady,
  onCancel,
  onApply,
  onReadyChange,
  cropStateRef,
}: PersonalizeCircleCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    onReadyChange(false);
    cropStateRef.current = { area: null, rotation: 0 };
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [src, onReadyChange, cropStateRef]);

  const handleCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      cropStateRef.current = { area: croppedAreaPixels, rotation: 0 };
      onReadyChange(true);
    },
    [cropStateRef, onReadyChange]
  );

  return (
    <>
      <div className="relative w-full aspect-square bg-[#111111] md:max-w-[400px] md:mx-auto">
        <EasyCrop
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={0}
          aspect={1}
          cropShape="round"
          showGrid={false}
          zoomWithScroll
          restrictPosition
          objectFit="cover"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          style={{ mediaStyle: { maxWidth: 'unset' } }}
          classes={{
            containerClassName: '!absolute !inset-0',
            cropAreaClassName: '!border-2 !border-white/90 !shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]',
          }}
        />
      </div>

      <div className="flex justify-end mt-3 gap-2 px-6 md:px-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className="px-3 py-1 w-[120px] h-[44px] rounded border border-[#222222] text-[#222222] bg-white hover:bg-[#F5F5F5]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isUploading || !isCropperReady}
          className="px-3 py-1 w-[120px] h-[44px] rounded bg-black text-[#F5E3E3] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5E3E3] border-t-transparent" />
          )}
          {isUploading ? 'Loading...' : 'Apply'}
        </button>
      </div>
    </>
  );
}

export default function GiverAvatarCropper({
  onDone,
  onCancel,
  aspectRatio,
  outputSize,
  maxSize,
  exportMime = 'image/jpeg',
  exportQuality = 0.92,
  spu,
  page,
  batchId,
  initialSrc,
  onDoneFile,
  resultMode = 'specialUpload',
  uiVariant = 'openingPage',
}: Props) {
  const { title: headerTitle, subtitle: headerSubtitle } = CROPPER_COPY[uiVariant];
  const isPersonalizeCircle = uiVariant === 'personalize';
  const openLoginModal = useUserStore((s) => s.openLoginModal);
  const [src, setSrc] = useState<string | undefined>(initialSrc);
  const cropperRef = useRef<ReactCropperElement>(null);
  const personalizeCropRef = useRef<{ area: Area | null; rotation: number }>({ area: null, rotation: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isApplyingRef = useRef(false);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperReady, setIsCropperReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<UploadRateLimitError | null>(null);

  useEffect(() => {
    if (!isPersonalizeCircle) {
      setIsCropperReady(false);
    }
  }, [src, isPersonalizeCircle]);

  // 如果有initialSrc，直接使用；否则在组件挂载时自动触发文件选择器
  useEffect(() => {
    if (!initialSrc) {
      // 使用setTimeout确保DOM已经渲染完成
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialSrc]);

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) {
      // 如果用户取消了选择，关闭弹窗
      onCancel();
      return;
    }
    const validationError = getFileValidationError(file);
    if (validationError) {
      setSrc(undefined);
      setError(validationError);
      setRateLimitError(null);
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await loadImageDimensions(url);
      if (width * height > MAX_UPLOAD_IMAGE_PIXELS) {
        URL.revokeObjectURL(url);
        setSrc(undefined);
        setError('This photo is too large to process. Please choose a smaller photo.');
        setRateLimitError(null);
        return;
      }
      setSrc((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return url;
      });
      setError(null);
      setRateLimitError(null);
    } catch (err) {
      URL.revokeObjectURL(url);
      setSrc(undefined);
      setError(err instanceof Error ? err.message : 'Could not read this image. Please try another file.');
      setRateLimitError(null);
    }
  }, [onCancel]);

  const handleRateLimitLogin = useCallback(() => {
    setRateLimitError(null);
    openLoginModal();
  }, [openLoginModal]);

  const rotateLeft = () => cropperRef.current?.cropper.rotate(-90);
  const rotateRight = () => cropperRef.current?.cropper.rotate(90);
  const flipH = () => {
    const next = sx === 1 ? -1 : 1;
    cropperRef.current?.cropper.scaleX(next);
    setSx(next);
  };
  const flipV = () => {
    const next = sy === 1 ? -1 : 1;
    cropperRef.current?.cropper.scaleY(next);
    setSy(next);
  };
  const resetAll = () => {
    cropperRef.current?.cropper.reset();
    setSx(1); setSy(1);
  };

  // （删除旧的文件上传分支，统一走特殊图片上传接口）

  // 将blob转换为base64格式
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 上传特殊图片到指定页面
  const uploadSpecialImage = async (base64Data: string): Promise<string> => {
    if (!spu || page === undefined || page === null || !batchId) {
      throw new Error('Missing required parameters: spu or page or batchId');
    }

    const pageParam = String(page);
    const requestBody: {
      data: string;
      batch_id?: string;
    } = {
      data: base64Data,
    };

    // 按后端要求携带 batch_id
    requestBody.batch_id = batchId;

    // api 实例已通过拦截器返回 response.data，这里直接拿到 data 对象
    const resp: any = await api.post(`/products/${encodeURIComponent(spu)}/pages/p3-4/upload-special-image`, requestBody, {
      timeout: 120000, // 图片上传需要更长时间，设置为 120 秒
    });
    // 后端返回 data.image_url，需要返回给父组件使用
    const imageUrl = resp?.data?.image_url || resp?.image_url || '';
    if (imageUrl) {
      console.log('Special image uploaded successfully, image_url:', imageUrl);
    } else {
      console.warn('Special image uploaded but no image_url in response:', resp);
    }
    return imageUrl;
  };

  const scaleCanvasToMaxSize = (canvas: HTMLCanvasElement, limit?: number) => {
    if (!limit || (canvas.width <= limit && canvas.height <= limit)) {
      return canvas;
    }
    const ratio = Math.min(limit / canvas.width, limit / canvas.height);
    const targetW = Math.round(canvas.width * ratio);
    const targetH = Math.round(canvas.height * ratio);
    const scaled = document.createElement('canvas');
    scaled.width = targetW;
    scaled.height = targetH;
    const ctx = scaled.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, targetW, targetH);
    }
    return scaled;
  };

  const exportCanvas = (canvas: HTMLCanvasElement) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        isApplyingRef.current = false;
        setIsUploading(false);
        setError('Could not export this image. Please try again or choose a smaller image.');
        return;
      }
      try {
        if (resultMode === 'file') {
          const file = new File(
            [blob],
            'cropped-image.' + (exportMime === 'image/png' ? 'png' : exportMime === 'image/webp' ? 'webp' : 'jpg'),
            { type: exportMime }
          );
          if (onDoneFile) {
            await onDoneFile(file);
          }
        } else {
          if (!spu || page === undefined || page === null) {
            throw new Error('Missing required parameters: spu or page');
          }
          const base64Data = await blobToBase64(blob);
          const url = await uploadSpecialImage(base64Data);
          if (!url) {
            throw new Error('Upload failed. Please try again.');
          }
          onDone(url);
        }
      } catch (e: unknown) {
        const uploadRateLimitError = getUploadRateLimitError(e);
        if (uploadRateLimitError) {
          setRateLimitError(uploadRateLimitError);
          setError(null);
        } else {
          setError(e instanceof Error ? e.message : 'Upload failed');
        }
      } finally {
        isApplyingRef.current = false;
        setIsUploading(false);
        if (src) URL.revokeObjectURL(src);
      }
    }, exportMime, exportQuality);
  };

  const onApply = async () => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    setIsUploading(true);
    setError(null);
    setRateLimitError(null);

    try {
      let canvas: HTMLCanvasElement | null = null;

      if (isPersonalizeCircle) {
        const { area, rotation } = personalizeCropRef.current;
        if (!area || !src || !isCropperReady) {
          throw new Error('Image is still loading. Please try again in a moment.');
        }
        canvas = await getCroppedCanvasFromArea(src, area, rotation);
        canvas = scaleCanvasToMaxSize(canvas, maxSize);
      } else {
        const cropper = cropperRef.current?.cropper;
        if (!cropper || !isCropperReady) {
          throw new Error('Image is still loading. Please try again in a moment.');
        }
        const cropOpts: { imageSmoothingEnabled: boolean; imageSmoothingQuality: 'high'; width?: number; height?: number } = {
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        };
        const hasOutputSize = !!(outputSize?.width && outputSize?.height);
        if (hasOutputSize) {
          cropOpts.width = outputSize!.width;
          cropOpts.height = outputSize!.height;
        }
        canvas = cropper.getCroppedCanvas(cropOpts);
        if (!canvas || !canvas.width || !canvas.height) {
          throw new Error('Could not process this image. Please try again or choose a smaller JPG, PNG, or WebP image.');
        }
        if (!hasOutputSize) {
          canvas = scaleCanvasToMaxSize(canvas, maxSize);
        }
      }

      if (!canvas || !canvas.width || !canvas.height) {
        throw new Error('Could not process this image. Please try again or choose a smaller JPG, PNG, or WebP image.');
      }

      exportCanvas(canvas);
    } catch (e: unknown) {
      isApplyingRef.current = false;
      setIsUploading(false);
      const uploadRateLimitError = getUploadRateLimitError(e);
      if (uploadRateLimitError) {
        setRateLimitError(uploadRateLimitError);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Process failed');
      }
    }
  };

  return (
    <div className={`w-full ${isPersonalizeCircle ? 'max-w-none md:max-w-[860px]' : 'max-w-[860px]'}`}>
      {src && (
        <div className={isPersonalizeCircle ? 'px-6 md:px-0' : ''}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{headerTitle}</h2>
            <button
              type="button"
              className="shrink-0 text-xl leading-none text-gray-500 hover:text-gray-700"
              onClick={onCancel}
              aria-label="Close"
            >
              &#x2715;
            </button>
          </div>
          <p className="text-gray-500 mt-2">{headerSubtitle}</p>
        </div>
      )}

      <div className="mt-4 hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          onChange={onFile}
        />
      </div>

      {src && (
        <div className={isPersonalizeCircle ? 'mt-4' : 'mt-4'}>
          {isPersonalizeCircle ? (
            <PersonalizeCircleCropEditor
              src={src}
              isUploading={isUploading}
              isCropperReady={isCropperReady}
              onCancel={onCancel}
              onApply={onApply}
              onReadyChange={setIsCropperReady}
              cropStateRef={personalizeCropRef}
            />
          ) : (
            <>
              <div className="h-[400px]">
                <Cropper
                  src={src}
                  style={{ height: 400, width: '100%' }}
                  ref={cropperRef}
                  viewMode={1}
                  dragMode="move"
                  guides
                  background={false}
                  autoCropArea={1}
                  checkOrientation={true}
                  aspectRatio={(typeof aspectRatio === 'number' ? aspectRatio : Number.NaN) as any}
                  ready={() => setIsCropperReady(true)}
                  zoomable
                  movable
                  rotatable
                  scalable
                />
              </div>

              <div className="flex flex-col items-center gap-2 mt-3">
                <div className="flex bg-[#F8F8F8] items-center py-[6px] px-[12px] gap-[21px]">
                  <button
                    onClick={rotateLeft}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Rotate Left"
                    aria-label="Rotate Left"
                  >
                    <MdRotateLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={rotateRight}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Rotate Right"
                    aria-label="Rotate Right"
                  >
                    <MdRotateRight className="w-6 h-6" />
                  </button>
                  <button
                    onClick={flipH}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Flip Horizontal"
                    aria-label="Flip Horizontal"
                  >
                    <MdFlip className="w-6 h-6" style={{ transform: 'scaleX(-1)' }} />
                  </button>
                  <button
                    onClick={flipV}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Flip Vertical"
                    aria-label="Flip Vertical"
                  >
                    <MdFlip className="w-6 h-6" style={{ transform: 'rotate(90deg) scaleX(-1)' }} />
                  </button>
                  <button
                    onClick={resetAll}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Reset"
                    aria-label="Reset"
                  >
                    <MdRefresh className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isUploading}
                  className="px-3 py-1 w-[120px] h-[44px] rounded border border-[#222222] text-[#222222] bg-white hover:bg-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onApply}
                  disabled={isUploading || !isCropperReady}
                  className="px-3 py-1 w-[120px] h-[44px] rounded bg-black text-[#F5E3E3] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5E3E3] border-t-transparent" />
                  )}
                  {isUploading ? 'Loading...' : 'Apply'}
                </button>
              </div>
            </>
          )}
          {rateLimitError && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
              onClick={() => setRateLimitError(null)}
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
                  onClick={() => setRateLimitError(null)}
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
                    <div className="text-base font-semibold text-[#222222]">{rateLimitError.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-[#6F7280]">{rateLimitError.message}</div>
                    {rateLimitError.retryText && (
                      <div className="mt-2 text-sm leading-relaxed text-[#8E92A7]">
                        You can try again in about {rateLimitError.retryText}, or sign in now.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRateLimitLogin}
                      className="mt-5 h-[40px] w-full rounded-sm bg-[#222222] px-5 text-sm font-medium text-[#F5E3E3] transition-colors hover:bg-black sm:w-auto"
                    >
                      Log in to continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className={`text-red-600 mt-2 ${isPersonalizeCircle ? 'px-6 md:px-0' : ''}`}>{error}</div>
          )}
        </div>
      )}
    </div>
  );
}


