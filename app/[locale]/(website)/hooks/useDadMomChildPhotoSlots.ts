import { useState, useCallback } from 'react';
import { getApiOrigin } from '@/utils/apiBaseUrl';
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
  return `${getApiOrigin()}/${cleanPath}`;
};

interface UploadOptions {
  allowedTypes?: string[];
  maxFileSize?: number;
}

type Slot = UploadedImage | null;
export type DadMomChildSlotIndex = 0 | 1 | 2;

/** 固定 3 槽位：0 = Dad，1 = Mom，2 = Child */
export function useDadMomChildPhotoSlots(options: UploadOptions = {}) {
  const [slots, setSlots] = useState<[Slot, Slot, Slot]>([null, null, null]);
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

  const uploadToSlot = async (slotIndex: DadMomChildSlotIndex, file: File): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const ts = Date.now();
    const id = `${ts}-dad-slot-${slotIndex}`;
    const previewUrl = URL.createObjectURL(file);
    const pending: UploadedImage = { id, file, previewUrl, isUploading: true };

    setSlots(prev => {
      const next: [Slot, Slot, Slot] = [prev[0], prev[1], prev[2]];
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
          const next: [Slot, Slot, Slot] = [prev[0], prev[1], prev[2]];
          next[slotIndex] = null;
          return next;
        });
        URL.revokeObjectURL(previewUrl);
        return null;
      }
      setSlots(prev => {
        const next: [Slot, Slot, Slot] = [prev[0], prev[1], prev[2]];
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

  const clearSlot = useCallback((slotIndex: DadMomChildSlotIndex) => {
    setSlots(prev => {
      const next: [Slot, Slot, Slot] = [prev[0], prev[1], prev[2]];
      const cur = next[slotIndex];
      if (cur?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(cur.previewUrl);
      }
      next[slotIndex] = null;
      return next;
    });
    setError(null);
  }, []);

  const getUploadedPaths = useCallback((): string[] => {
    const out: string[] = [];
    for (const slot of slots) {
      if (slot?.dataUrl) out.push(slot.dataUrl);
    }
    return out;
  }, [slots]);

  const getDadMomChildPaths = useCallback((): [string | null, string | null, string | null] => {
    return [slots[0]?.dataUrl ?? null, slots[1]?.dataUrl ?? null, slots[2]?.dataUrl ?? null];
  }, [slots]);

  const initializeWithUrls = useCallback((urls: string[]) => {
    const ts = Date.now();
    const make = (u: string | undefined, i: number): Slot => {
      if (!u) return null;
      const absolute = toAbsoluteUrl(u);
      return {
        id: `${ts}-dad-init-${i}`,
        previewUrl: absolute,
        dataUrl: absolute,
        isUploading: false,
      };
    };
    setSlots([make(urls[0], 0), make(urls[1], 1), make(urls[2], 2)]);
    setError(null);
  }, []);

  const clearAllSlots = useCallback(() => {
    setSlots(prev => {
      prev.forEach(s => {
        if (s?.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(s.previewUrl);
        }
      });
      return [null, null, null];
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
    getDadMomChildPaths,
    initializeWithUrls,
    clearAllSlots,
  };
}
