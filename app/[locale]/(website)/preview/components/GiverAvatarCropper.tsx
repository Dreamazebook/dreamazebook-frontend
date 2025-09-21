'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';
import type { AxiosResponse } from 'axios';
import { uploadApi } from '@/utils/api.js';

type Props = {
  onDone: (url: string) => void;
  onCancel: () => void;
  // 可选：固定裁剪比例（例如头像 1:1）。不传则自由裁剪
  aspectRatio?: number | undefined;
  // 可选：导出格式和质量
  exportMime?: 'image/jpeg' | 'image/png' | 'image/webp';
  exportQuality?: number; // 0-1，仅 JPEG/WebP 生效
  // 可选：限制导出最大尺寸（防止超大图）
  maxSize?: number; // 最大边长，像素
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

export default function GiverAvatarCropper({ onDone, onCancel, aspectRatio, maxSize, exportMime = 'image/jpeg', exportQuality = 0.92 }: Props) {
  const [src, setSrc] = useState<string | undefined>();
  const cropperRef = useRef<ReactCropperElement>(null);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setError(null);
  }, []);

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

  const uploadBlob = async (blob: Blob): Promise<string> => {
    const form = new FormData();
    form.append('file', blob, 'giver-avatar.jpg');
    form.append('type', 'aiface');
    const resp: AxiosResponse<{ path?: string; url?: string }> = await uploadApi.post('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = resp.data;
    if (!data || (!data.path && !data.url)) {
      throw new Error('Invalid upload response');
    }
    return data.url || toAbsoluteUrl(data.path as string);
  };

  const onApply = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    setIsUploading(true);
    setError(null);
    try {
      // 限制最大导出尺寸（如果配置了 maxSize）
      let canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
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

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const url = await uploadBlob(blob);
          onDone(url);
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Giver Avatar</h2>
        <button className="text-xl text-gray-500 hover:text-gray-700" onClick={onCancel}>&#x2715;</button>
      </div>

      <div className="mt-4">
        <input type="file" accept="image/*" onChange={onFile} />
      </div>

      {src && (
        <div className="mt-4">
          <div className="h-[420px]">
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
              aspectRatio={aspectRatio as any}
              zoomable
              movable
              rotatable
              scalable
            />
          </div>

          <div className="flex gap-2 justify-between mt-3">
            <div className="flex gap-2">
              <button onClick={rotateLeft} className="px-3 py-1 rounded border">左旋转</button>
              <button onClick={rotateRight} className="px-3 py-1 rounded border">右旋转</button>
              <button onClick={flipH} className="px-3 py-1 rounded border">左右翻转</button>
              <button onClick={flipV} className="px-3 py-1 rounded border">上下翻转</button>
              <button onClick={resetAll} className="px-3 py-1 rounded border">重置</button>
            </div>
            <div className="flex gap-2">
              <button onClick={onCancel} className="px-3 py-1 rounded border">取消</button>
              <button onClick={onApply} disabled={isUploading} className="px-3 py-1 rounded bg-black text-white">
                {isUploading ? '上传中...' : '应用'}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}


