'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import api from '@/utils/api';
import { getApiOrigin } from '@/utils/apiBaseUrl';
import { MdRotateLeft, MdRotateRight, MdFlip, MdRefresh } from '@/utils/icons';
import useUserStore from '@/stores/userStore';
import PersonalizeLensCropEditor, {
  cropImageToCanvas,
  displayRectToNatural,
  isPersonalizeLensQualityValid,
  PERSONALIZE_LENS_APPLY_COOLDOWN_MS,
  PERSONALIZE_LENS_QUALITY_ERROR,
  type ImageLayout,
  type LensCropRect,
} from './PersonalizeLensCropEditor';

export type PersonalizeCropResult = {
  croppedFile: File;
  originalFile: File;
};

type Props = {
  onDone: (url: string) => void;
  onCancel: () => void;
  aspectRatio?: number | undefined;
  outputSize?: { width: number; height: number };
  exportMime?: 'image/jpeg' | 'image/png' | 'image/webp';
  exportQuality?: number;
  maxSize?: number;
  spu?: string;
  page?: string | number;
  batchId?: string;
  initialSrc?: string;
  originalFile?: File;
  onDoneFile?: (file: File | PersonalizeCropResult) => void | Promise<void>;
  resultMode?: 'specialUpload' | 'file';
  uiVariant?: 'personalize' | 'openingPage';
};

const CROPPER_COPY: Record<'openingPage', { title: string; subtitle: string }> = {
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  originalFile,
  onDoneFile,
  resultMode = 'specialUpload',
  uiVariant = 'openingPage',
}: Props) {
  const { title: headerTitle, subtitle: headerSubtitle } = CROPPER_COPY.openingPage;
  const isPersonalizeLens = uiVariant === 'personalize';
  const openLoginModal = useUserStore((s) => s.openLoginModal);
  const [src, setSrc] = useState<string | undefined>(initialSrc);
  const cropperRef = useRef<ReactCropperElement>(null);
  const personalizeCropRef = useRef<{ layout: ImageLayout | null; cropRect: LensCropRect | null }>({
    layout: null,
    cropRect: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isApplyingRef = useRef(false);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [applyDisabled, setApplyDisabled] = useState(false);
  const [isCropperReady, setIsCropperReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<UploadRateLimitError | null>(null);

  useEffect(() => {
    if (!isPersonalizeLens) {
      setIsCropperReady(false);
    }
  }, [src, isPersonalizeLens]);

  useEffect(() => {
    if (!initialSrc) {
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
      setQualityError(null);
    } catch (err) {
      URL.revokeObjectURL(url);
      setSrc(undefined);
      setError(err instanceof Error ? err.message : 'Could not read this image. Please try another file.');
      setRateLimitError(null);
    }
  }, [onCancel]);

  const handleRateLimitLogin = useCallback(() => {
    setRateLimitError(null);
    openLoginModal({ loginSource: 'preview_unlock' });
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
    setSx(1);
    setSy(1);
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const uploadSpecialImage = async (base64Data: string): Promise<string> => {
    if (!spu || page === undefined || page === null || !batchId) {
      throw new Error('Missing required parameters: spu or page or batchId');
    }

    const requestBody: { data: string; batch_id?: string } = { data: base64Data, batch_id: batchId };
    const resp: any = await api.post(
      `/products/${encodeURIComponent(spu)}/pages/p3-4/upload-special-image`,
      requestBody,
      { timeout: 120000 },
    );
    return resp?.data?.image_url || resp?.image_url || '';
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

  const canvasToFile = (canvas: HTMLCanvasElement): Promise<File> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not export this image. Please try again or choose a smaller image.'));
            return;
          }
          resolve(
            new File(
              [blob],
              'cropped-image.' +
                (exportMime === 'image/png' ? 'png' : exportMime === 'image/webp' ? 'webp' : 'jpg'),
              { type: exportMime },
            ),
          );
        },
        exportMime,
        exportQuality,
      );
    });

  const exportCanvas = (canvas: HTMLCanvasElement) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        isApplyingRef.current = false;
        setIsUploading(false);
        setApplyDisabled(false);
        setError('Could not export this image. Please try again or choose a smaller image.');
        return;
      }
      try {
        if (resultMode === 'file') {
          const file = new File(
            [blob],
            'cropped-image.' + (exportMime === 'image/png' ? 'png' : exportMime === 'image/webp' ? 'webp' : 'jpg'),
            { type: exportMime },
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
          onDone(toAbsoluteUrl(url));
        }
      } catch (e: unknown) {
        const uploadRateLimitError = getUploadRateLimitError(e);
        if (uploadRateLimitError) {
          setRateLimitError(uploadRateLimitError);
          setError(null);
        } else {
          setError(e instanceof Error ? e.message : 'Upload failed');
        }
        setApplyDisabled(false);
      } finally {
        isApplyingRef.current = false;
        setIsUploading(false);
        if (src && !isPersonalizeLens) URL.revokeObjectURL(src);
      }
    }, exportMime, exportQuality);
  };

  const onApplyOpeningPage = async () => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    setIsUploading(true);
    setError(null);
    setRateLimitError(null);

    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper || !isCropperReady) {
        throw new Error('Image is still loading. Please try again in a moment.');
      }
      const cropOpts: {
        imageSmoothingEnabled: boolean;
        imageSmoothingQuality: 'high';
        width?: number;
        height?: number;
      } = {
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      };
      const hasOutputSize = !!(outputSize?.width && outputSize?.height);
      if (hasOutputSize) {
        cropOpts.width = outputSize!.width;
        cropOpts.height = outputSize!.height;
      }
      let canvas = cropper.getCroppedCanvas(cropOpts);
      if (!canvas || !canvas.width || !canvas.height) {
        throw new Error('Could not process this image. Please try again or choose a smaller JPG, PNG, or WebP image.');
      }
      if (!hasOutputSize) {
        canvas = scaleCanvasToMaxSize(canvas, maxSize);
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

  const onApplyPersonalizeLens = async () => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    setApplyDisabled(true);
    setQualityError(null);
    setError(null);
    setRateLimitError(null);

    const cooldown = wait(PERSONALIZE_LENS_APPLY_COOLDOWN_MS);

    try {
      const { layout, cropRect } = personalizeCropRef.current;
      if (!layout || !cropRect || !src || !isCropperReady) {
        throw new Error('Image is still loading. Please try again in a moment.');
      }

      const naturalCrop = displayRectToNatural(cropRect, layout);
      await cooldown;

      if (!isPersonalizeLensQualityValid(naturalCrop)) {
        setQualityError(PERSONALIZE_LENS_QUALITY_ERROR);
        isApplyingRef.current = false;
        setApplyDisabled(false);
        return;
      }

      let canvas = await cropImageToCanvas(src, naturalCrop);
      canvas = scaleCanvasToMaxSize(canvas, maxSize);
      const croppedFile = await canvasToFile(canvas);

      if (!originalFile) {
        throw new Error('Original image is missing. Please choose the photo again.');
      }

      if (onDoneFile) {
        await onDoneFile({ croppedFile, originalFile });
      }

      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    } catch (e: unknown) {
      const uploadRateLimitError = getUploadRateLimitError(e);
      if (uploadRateLimitError) {
        setRateLimitError(uploadRateLimitError);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Process failed');
      }
      setApplyDisabled(false);
    } finally {
      isApplyingRef.current = false;
    }
  };

  if (isPersonalizeLens && src) {
    return (
      <>
        <PersonalizeLensCropEditor
          src={src}
          applyDisabled={applyDisabled}
          qualityError={qualityError}
          onCancel={onCancel}
          onApply={onApplyPersonalizeLens}
          onReadyChange={setIsCropperReady}
          cropStateRef={personalizeCropRef}
        />
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
          <div className="fixed bottom-[180px] left-0 right-0 z-[130] px-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full max-w-[860px]">
      {src && (
        <div>
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
        <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_ACCEPT} onChange={onFile} />
      </div>

      {src && (
        <div className="mt-4">
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
              onClick={onApplyOpeningPage}
              disabled={isUploading || !isCropperReady}
              className="px-3 py-1 w-[120px] h-[44px] rounded bg-black text-[#F5E3E3] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5E3E3] border-t-transparent" />
              )}
              {isUploading ? 'Loading...' : 'Apply'}
            </button>
          </div>
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
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}
