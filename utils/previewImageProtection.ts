import { shouldBypassNextImageOptimization } from '@/utils/previewImageOptimization';
import type { DragEvent, ImgHTMLAttributes, MouseEvent, SyntheticEvent } from 'react';

/** 预览页展示用最大宽度（配合 Next Image 压缩） */
export const PREVIEW_DISPLAY_MAX_WIDTH = 960;
export const PREVIEW_DISPLAY_QUALITY = 55;

export const PREVIEW_PROTECTED_IMAGE_CLASS = 'preview-protected-image';

export function pickLowResPreviewRaw(page: Record<string, unknown> | null | undefined): string | null {
  if (!page) return null;
  const candidates = [
    page.low_res_image_url,
    page.low_res_url,
    page.preview_low_res_url,
    page.final_image_low_res_url,
    page.preview_image_url,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

/**
 * 展示用预览图 URL：优先保留后端低清字段；S3/R2 大图不走 /_next/image（会 400/500）。
 * 本地静态资源可走 Next Image 压缩。
 */
export function toLowResPreviewSrc(src: string | null | undefined): string {
  const raw = String(src || '').trim();
  if (!raw) return raw;
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  if (raw.startsWith('/_next/image')) return raw;

  const isRemote = raw.startsWith('http://') || raw.startsWith('https://');

  // S3/R2 预览 CDN 与 OptimizedImage 一致：跳过 Next 优化，直接加载原 URL
  if (shouldBypassNextImageOptimization(raw)) {
    return raw;
  }

  if (isRemote || !raw.startsWith('/')) {
    return raw;
  }

  if (typeof window === 'undefined') {
    return raw;
  }

  const absoluteUrl = `${window.location.origin}${raw}`;
  const params = new URLSearchParams({
    url: absoluteUrl,
    w: String(PREVIEW_DISPLAY_MAX_WIDTH),
    q: String(PREVIEW_DISPLAY_QUALITY),
  });
  return `/_next/image?${params.toString()}`;
}

export function getProtectedPreviewImageProps(): Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  'draggable' | 'onContextMenu' | 'onDragStart'
> {
  return {
    draggable: false,
    onContextMenu: (event: MouseEvent<HTMLImageElement>) => {
      event.preventDefault();
    },
    onDragStart: (event: DragEvent<HTMLImageElement>) => {
      event.preventDefault();
    },
  };
}

export function preventPreviewImageContextMenu(event: MouseEvent | SyntheticEvent) {
  event.preventDefault();
}
