import { useState, useCallback } from 'react';
import type { UploadedImage } from './useMultiImageUpload';

const toAbsoluteUrl = (raw: string): string => {
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
  try {
    origin = new URL(apiUrl).origin;
  } catch {}
  return `${origin}/${cleanPath}`;
};

interface UploadOptions {
  allowedTypes?: string[];
  maxFileSize?: number;
}

type Slot = UploadedImage | null;

/** 固定 2 槽位：0 = Mom，1 = Child，与 Good Night 单槽逻辑分离，避免条件 hook */
export function useMomChildPhotoSlots(options: UploadOptions = {}) {
  const [slots, setSlots] = useState<[Slot, Slot]>([null, null]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes =
      options.allowedTypes && options.allowedTypes.length > 0
        ? options.allowedTypes
        : ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPEG, JPG, PNG or WebP file only');
      return false;
    }

    const maxSize = typeof options.maxFileSize === 'number' ? options.maxFileSize : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Pictures cannot exceed 20M');
      return false;
    }

    return true;
  };

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    try {
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true';
      if (FRONTEND_PREVIEW) {
        return toAbsoluteUrl('/personalize/face.png');
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return dataUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    }
  };

  const uploadToSlot = async (slotIndex: 0 | 1, file: File): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const ts = Date.now();
    const id = `${ts}-slot-${slotIndex}`;
    const previewUrl = URL.createObjectURL(file);
    const pending: UploadedImage = { id, file, previewUrl, isUploading: true };

    setSlots(prev => {
      const next: [Slot, Slot] = [prev[0], prev[1]];
      const old = next[slotIndex];
      if (old?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(old.previewUrl);
      }
      next[slotIndex] = pending;
      return next;
    });

    try {
      const dataUrl = await uploadSingleFile(file);
      if (!dataUrl) {
        setSlots(prev => {
          const next: [Slot, Slot] = [prev[0], prev[1]];
          next[slotIndex] = null;
          return next;
        });
        URL.revokeObjectURL(previewUrl);
        return null;
      }
      setSlots(prev => {
        const next: [Slot, Slot] = [prev[0], prev[1]];
        const cur = next[slotIndex];
        if (cur) {
          next[slotIndex] = { ...cur, dataUrl, isUploading: false };
        }
        return next;
      });
      return dataUrl;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearSlot = useCallback((slotIndex: 0 | 1) => {
    setSlots(prev => {
      const next: [Slot, Slot] = [prev[0], prev[1]];
      const cur = next[slotIndex];
      if (cur?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(cur.previewUrl);
      }
      next[slotIndex] = null;
      return next;
    });
    setError(null);
  }, []);

  /** 顺序：[Mom, Child]，仅含已上传完成的槽位 */
  const getUploadedPaths = useCallback((): string[] => {
    const out: string[] = [];
    const a = slots[0]?.dataUrl;
    const b = slots[1]?.dataUrl;
    if (a) out.push(a);
    if (b) out.push(b);
    return out;
  }, [slots]);

  /** 固定双槽顺序，用于提交与校验 */
  const getMomChildPaths = useCallback((): [string | null, string | null] => {
    return [slots[0]?.dataUrl ?? null, slots[1]?.dataUrl ?? null];
  }, [slots]);

  const initializeWithUrls = useCallback((urls: string[]) => {
    const ts = Date.now();
    const make = (u: string | undefined, i: number): Slot => {
      if (!u) return null;
      const absolute = toAbsoluteUrl(u);
      return {
        id: `${ts}-init-${i}`,
        previewUrl: absolute,
        dataUrl: absolute,
        isUploading: false,
      };
    };
    setSlots([make(urls[0], 0), make(urls[1], 1)]);
    setError(null);
  }, []);

  const clearAllSlots = useCallback(() => {
    setSlots(prev => {
      prev.forEach(s => {
        if (s?.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(s.previewUrl);
        }
      });
      return [null, null];
    });
    setError(null);
  }, []);

  return {
    slots,
    isUploading,
    uploadProgress,
    error,
    uploadToSlot,
    clearSlot,
    getUploadedPaths,
    getMomChildPaths,
    initializeWithUrls,
    clearAllSlots,
  };
}
