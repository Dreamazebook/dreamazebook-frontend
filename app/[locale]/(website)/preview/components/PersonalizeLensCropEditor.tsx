'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type LensCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageLayout = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
};

export const PERSONALIZE_LENS_MIN_WIDTH = 300;
export const PERSONALIZE_LENS_MIN_HEIGHT = 250;
export const PERSONALIZE_LENS_INSTRUCTION =
  "Place only the hero's full head and hair inside the frame.";
export const PERSONALIZE_LENS_QUALITY_ERROR =
  "This photo isn't clear enough. Please choose a clearer one.";
export const PERSONALIZE_LENS_APPLY_COOLDOWN_MS = 500;

const MIN_DISPLAY_FRAME = 48;
const HANDLE_SIZE = 28;
const HANDLE_HIT = 44;

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

type Props = {
  src: string;
  applyDisabled: boolean;
  qualityError: string | null;
  onCancel: () => void;
  onApply: () => void;
  onReadyChange: (ready: boolean) => void;
  cropStateRef: React.MutableRefObject<{ layout: ImageLayout | null; cropRect: LensCropRect | null }>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function computeImageLayout(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ImageLayout {
  const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
  const displayWidth = naturalWidth * scale;
  const displayHeight = naturalHeight * scale;
  return {
    offsetX: (containerWidth - displayWidth) / 2,
    offsetY: (containerHeight - displayHeight) / 2,
    displayWidth,
    displayHeight,
    naturalWidth,
    naturalHeight,
  };
}

function getImageBounds(layout: ImageLayout) {
  return {
    left: layout.offsetX,
    top: layout.offsetY,
    right: layout.offsetX + layout.displayWidth,
    bottom: layout.offsetY + layout.displayHeight,
  };
}

function createInitialCropRect(layout: ImageLayout): LensCropRect {
  const frameWidth = layout.displayWidth * 0.78;
  const frameHeight = frameWidth * (PERSONALIZE_LENS_MIN_HEIGHT / PERSONALIZE_LENS_MIN_WIDTH);
  const height = Math.min(frameHeight, layout.displayHeight * 0.82);
  const width = height * (PERSONALIZE_LENS_MIN_WIDTH / PERSONALIZE_LENS_MIN_HEIGHT);
  return {
    x: layout.offsetX + (layout.displayWidth - width) / 2,
    y: layout.offsetY + (layout.displayHeight - height) / 2,
    width,
    height,
  };
}

function constrainCropRect(rect: LensCropRect, layout: ImageLayout): LensCropRect {
  const bounds = getImageBounds(layout);
  const maxWidth = bounds.right - bounds.left;
  const maxHeight = bounds.bottom - bounds.top;
  const width = clamp(rect.width, MIN_DISPLAY_FRAME, maxWidth);
  const height = clamp(rect.height, MIN_DISPLAY_FRAME, maxHeight);
  const x = clamp(rect.x, bounds.left, bounds.right - width);
  const y = clamp(rect.y, bounds.top, bounds.bottom - height);
  return { x, y, width, height };
}

function resizeCropRect(
  rect: LensCropRect,
  mode: Exclude<DragMode, 'move'>,
  pointerX: number,
  pointerY: number,
  layout: ImageLayout,
): LensCropRect {
  const bounds = getImageBounds(layout);
  let { x, y, width, height } = rect;

  if (mode === 'nw') {
    const right = x + width;
    const bottom = y + height;
    x = clamp(pointerX, bounds.left, right - MIN_DISPLAY_FRAME);
    y = clamp(pointerY, bounds.top, bottom - MIN_DISPLAY_FRAME);
    width = right - x;
    height = bottom - y;
  } else if (mode === 'ne') {
    const bottom = y + height;
    const right = clamp(pointerX, x + MIN_DISPLAY_FRAME, bounds.right);
    y = clamp(pointerY, bounds.top, bottom - MIN_DISPLAY_FRAME);
    width = right - x;
    height = bottom - y;
  } else if (mode === 'sw') {
    const right = x + width;
    const bottom = clamp(pointerY, y + MIN_DISPLAY_FRAME, bounds.bottom);
    x = clamp(pointerX, bounds.left, right - MIN_DISPLAY_FRAME);
    width = right - x;
    height = bottom - y;
  } else if (mode === 'se') {
    const right = clamp(pointerX, x + MIN_DISPLAY_FRAME, bounds.right);
    const bottom = clamp(pointerY, y + MIN_DISPLAY_FRAME, bounds.bottom);
    width = right - x;
    height = bottom - y;
  }

  return constrainCropRect({ x, y, width, height }, layout);
}

export function displayRectToNatural(rect: LensCropRect, layout: ImageLayout): LensCropRect {
  const scaleX = layout.naturalWidth / layout.displayWidth;
  const scaleY = layout.naturalHeight / layout.displayHeight;
  return {
    x: (rect.x - layout.offsetX) * scaleX,
    y: (rect.y - layout.offsetY) * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

export async function cropImageToCanvas(src: string, naturalCrop: LensCropRect): Promise<HTMLCanvasElement> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image.'));
    img.src = src;
  });

  const canvas = document.createElement('canvas');
  const width = Math.max(1, Math.round(naturalCrop.width));
  const height = Math.max(1, Math.round(naturalCrop.height));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process this image.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    naturalCrop.x,
    naturalCrop.y,
    naturalCrop.width,
    naturalCrop.height,
    0,
    0,
    width,
    height,
  );
  return canvas;
}

export function isPersonalizeLensQualityValid(naturalCrop: LensCropRect): boolean {
  return naturalCrop.width >= PERSONALIZE_LENS_MIN_WIDTH && naturalCrop.height >= PERSONALIZE_LENS_MIN_HEIGHT;
}

export default function PersonalizeLensCropEditor({
  src,
  applyDisabled,
  qualityError,
  onCancel,
  onApply,
  onReadyChange,
  cropStateRef,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ImageLayout | null>(null);
  const [cropRect, setCropRect] = useState<LensCropRect | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startRect: LensCropRect;
  } | null>(null);

  useEffect(() => {
    onReadyChange(false);
    cropStateRef.current = { layout: null, cropRect: null };
    setLayout(null);
    setCropRect(null);
  }, [src, onReadyChange, cropStateRef]);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const { width, height } = viewport.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const nextLayout = computeImageLayout(
        width,
        height,
        img.naturalWidth || img.width,
        img.naturalHeight || img.height,
      );
      const nextCrop = createInitialCropRect(nextLayout);
      setLayout(nextLayout);
      setCropRect(nextCrop);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateLayout = () => {
      const img = viewport.querySelector('img');
      if (!img || !img.naturalWidth || !img.naturalHeight) return;
      const { width, height } = viewport.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const nextLayout = computeImageLayout(width, height, img.naturalWidth, img.naturalHeight);
      setLayout((prev) => {
        setCropRect((currentCrop) => {
          if (!prev || !currentCrop) {
            return createInitialCropRect(nextLayout);
          }
          const natural = displayRectToNatural(currentCrop, prev);
          const scaleX = nextLayout.displayWidth / prev.displayWidth;
          const scaleY = nextLayout.displayHeight / prev.displayHeight;
          return constrainCropRect(
            {
              x: nextLayout.offsetX + (natural.x / prev.naturalWidth) * nextLayout.displayWidth,
              y: nextLayout.offsetY + (natural.y / prev.naturalHeight) * nextLayout.displayHeight,
              width: natural.width * scaleX,
              height: natural.height * scaleY,
            },
            nextLayout,
          );
        });
        return nextLayout;
      });
    };

    const observer = new ResizeObserver(updateLayout);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    cropStateRef.current = { layout, cropRect };
    onReadyChange(Boolean(layout && cropRect));
  }, [layout, cropRect, cropStateRef, onReadyChange]);

  const finishDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (mode: DragMode) => (event: React.PointerEvent) => {
      if (!layout || !cropRect) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      dragRef.current = {
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startRect: cropRect,
      };
    },
    [layout, cropRect],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !layout) return;
      event.preventDefault();

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      if (drag.mode === 'move') {
        const next = constrainCropRect(
          {
            ...drag.startRect,
            x: drag.startRect.x + dx,
            y: drag.startRect.y + dy,
          },
          layout,
        );
        setCropRect(next);
        return;
      }

      const pointerX =
        drag.mode === 'nw' || drag.mode === 'sw'
          ? drag.startRect.x + dx
          : drag.startRect.x + drag.startRect.width + dx;
      const pointerY =
        drag.mode === 'nw' || drag.mode === 'ne'
          ? drag.startRect.y + dy
          : drag.startRect.y + drag.startRect.height + dy;

      setCropRect(resizeCropRect(drag.startRect, drag.mode, pointerX, pointerY, layout));
    },
    [layout],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!dragRef.current) return;
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      finishDrag();
    },
    [finishDrag],
  );

  const handleFramePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!layout || !cropRect) return;
      if ((event.target as HTMLElement).dataset.handle) return;
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      dragRef.current = {
        mode: 'move',
        startX: event.clientX,
        startY: event.clientY,
        startRect: cropRect,
      };
    },
    [layout, cropRect],
  );

  const corners: Array<{ mode: Exclude<DragMode, 'move'>; style: React.CSSProperties }> = cropRect
    ? [
        { mode: 'nw', style: { left: cropRect.x - HANDLE_HIT / 2, top: cropRect.y - HANDLE_HIT / 2 } },
        { mode: 'ne', style: { left: cropRect.x + cropRect.width - HANDLE_HIT / 2, top: cropRect.y - HANDLE_HIT / 2 } },
        { mode: 'sw', style: { left: cropRect.x - HANDLE_HIT / 2, top: cropRect.y + cropRect.height - HANDLE_HIT / 2 } },
        { mode: 'se', style: { left: cropRect.x + cropRect.width - HANDLE_HIT / 2, top: cropRect.y + cropRect.height - HANDLE_HIT / 2 } },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black touch-none">
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={finishDrag}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        />

        {layout && cropRect && (
          <>
            <div
              className="absolute border-2 border-white"
              style={{
                left: cropRect.x,
                top: cropRect.y,
                width: cropRect.width,
                height: cropRect.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.58)',
                cursor: 'move',
              }}
              onPointerDown={handleFramePointerDown}
            />

            {corners.map(({ mode, style }) => (
              <div
                key={mode}
                data-handle="true"
                className="absolute z-[2] flex items-center justify-center"
                style={{ ...style, width: HANDLE_HIT, height: HANDLE_HIT, touchAction: 'none' }}
                onPointerDown={handlePointerDown(mode)}
              >
                <div
                  className="rounded-full border-2 border-white bg-white/95 shadow-[0_1px_6px_rgba(0,0,0,0.35)]"
                  style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }}
                />
              </div>
            ))}
          </>
        )}
      </div>

      <div
        className="shrink-0 rounded-t-[20px] bg-white px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
        style={{ touchAction: 'none' }}
      >
        <p className="text-[15px] leading-[22px] text-[#222222]">{PERSONALIZE_LENS_INSTRUCTION}</p>
        {qualityError && (
          <p className="mt-2 text-[14px] leading-[20px]" style={{ color: '#D92D20' }}>
            {qualityError}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={applyDisabled}
            className="h-[44px] flex-1 rounded border border-[#222222] bg-white text-[#222222] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={applyDisabled || !layout || !cropRect}
            className="h-[44px] flex-1 rounded bg-[#222222] text-[#F5E3E3] disabled:cursor-not-allowed disabled:bg-[#B8B8B8] disabled:text-[#ECECEC]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
