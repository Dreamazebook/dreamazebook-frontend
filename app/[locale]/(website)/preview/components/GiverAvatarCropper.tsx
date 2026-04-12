'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';
import type { AxiosResponse } from 'axios';
import { uploadApi } from '@/utils/api.js';
import api from '@/utils/api';
import { MdRotateLeft, MdRotateRight, MdFlip, MdRefresh } from 'react-icons/md';

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
  onDoneFile?: (file: File) => void;
  /**
   * 结果模式：
   * - 'specialUpload'（默认）：走特殊上传接口，返回后端 image_url（Preview Giver 使用）
   * - 'file'：不调用后端上传，仅返回裁剪后的 File（Personalize 使用）
   */
  resultMode?: 'specialUpload' | 'file';
};

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';
  let origin = 'https://api.dreamazebook.com';
  try { origin = new URL(apiUrl).origin; } catch {}
  return `${origin}/${cleanPath}`;
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
}: Props) {
  const [src, setSrc] = useState<string | undefined>(initialSrc);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // 如果用户取消了选择，关闭弹窗
      onCancel();
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setError(null);
  }, [onCancel]);

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

  const onApply = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    setIsUploading(true);
    setError(null);
    try {
      // 获取裁剪结果：支持固定导出尺寸（outputSize），否则可选 maxSize 限制
      const cropOpts: any = { imageSmoothingEnabled: true, imageSmoothingQuality: 'high' };
      const hasOutputSize = !!(outputSize?.width && outputSize?.height);
      if (hasOutputSize) {
        cropOpts.width = outputSize!.width;
        cropOpts.height = outputSize!.height;
      }
      let canvas = cropper.getCroppedCanvas(cropOpts);
      if (!hasOutputSize) {
        // 限制最大导出尺寸（如果配置了 maxSize）
        if (maxSize && (canvas.width > maxSize || canvas.height > maxSize)) {
          const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height);
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
          canvas = scaled;
        }
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (resultMode === 'file') {
            // 个性化页面：直接返回裁剪后的 File，由外部自行上传/转 dataURL
            const file = new File([blob], 'cropped-image.' + (exportMime === 'image/png' ? 'png' : exportMime === 'image/webp' ? 'webp' : 'jpg'), {
              type: exportMime,
            });
            if (onDoneFile) {
              onDoneFile(file);
            }
          } else {
            // 预览页面：统一使用特殊图片上传接口（需要 spu + page）
            if (!spu || page === undefined || page === null) {
              throw new Error('Missing required parameters: spu or page');
            }
            const base64Data = await blobToBase64(blob);
            const url = await uploadSpecialImage(base64Data);
            onDone(url);
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
          setIsUploading(false);
          if (src) URL.revokeObjectURL(src);
        }
      }, exportMime, exportQuality);
    } catch (e: unknown) {
      setIsUploading(false);
      setError(e instanceof Error ? e.message : 'Process failed');
    }
  };

  return (
    <div className="w-full max-w-[860px]">
      {src && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Add image</h2>
            <p className="text-gray-500">Add a meaningful photo to fill your book with love.</p>
          </div>
          <button className="text-xl text-gray-500 hover:text-gray-700" onClick={onCancel}>&#x2715;</button>
        </div>
      )}

      <div className="mt-4 hidden">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={onFile} 
        />
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
              // Cropper.js：aspectRatio 默认为 NaN（即自由裁剪）
              aspectRatio={(typeof aspectRatio === 'number' ? aspectRatio : Number.NaN) as any}
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
              disabled={isUploading}
              className="px-3 py-1 w-[120px] h-[44px] rounded bg-black text-[#F5E3E3] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Adding...' : 'Apply'}
            </button>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}


