"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type MaskPreview = "none" | "circle" | "rounded";

type AvatarComposerProps = {
  backgroundUrl?: string;
  outputWidth?: number;
  outputHeight?: number;
  maskPreview?: MaskPreview;
  exportMime?: "image/png" | "image/jpeg" | "image/webp";
  exportQuality?: number; // 0-1，仅对 jpeg/webp 生效
  watermarkText?: string;
  backgroundOnTop?: boolean;
  className?: string;
  onExport?: (blob: Blob) => void;
  // 新增：导出模式 cropped 仅导出裁切图；composed 导出与背景合成图
  exportMode?: "cropped" | "composed";
  // 新增：是否禁用自动下载
  disableDownload?: boolean;
  // 新增：提交按钮文案（替换默认“导出并下载”）
  exportButtonText?: string;
};

function getRadianAngle(degree: number): number {
  return (degree * Math.PI) / 180;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = url;
  });
}

async function fileToObjectUrlWithExifFix(file: File): Promise<string> {
  // 优先使用 createImageBitmap 的 EXIF 方向修正能力
  if ("createImageBitmap" in window) {
    try {
      // 部分浏览器支持 imageOrientation: 'from-image'，使用 any 以跳过类型限制
      const bitmap = await (createImageBitmap as any)(file, { imageOrientation: "from-image" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CanvasRenderingContext2D not available");
      ctx.drawImage(bitmap, 0, 0);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve));
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      // fallback below
    }
  }
  return URL.createObjectURL(file);
}

// 旋转后的安全画布大小，避免裁切时越界
function getSafeAreaSize(width: number, height: number): number {
  const maxDim = Math.max(width, height);
  return Math.ceil(maxDim * Math.SQRT2);
}

async function getCroppedCanvas(
  imageSrc: string,
  crop: Area,
  rotation: number
): Promise<HTMLCanvasElement> {
  const image = await createImage(imageSrc);
  const rotationRad = getRadianAngle(rotation);

  const safeSize = getSafeAreaSize(image.width, image.height);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CanvasRenderingContext2D not available");

  canvas.width = safeSize;
  canvas.height = safeSize;

  ctx.translate(safeSize / 2, safeSize / 2);
  ctx.rotate(rotationRad);
  ctx.translate(-safeSize / 2, -safeSize / 2);

  // 将图片绘制在安全区域中央
  const x = (safeSize - image.width) / 2;
  const y = (safeSize - image.height) / 2;
  ctx.drawImage(image, x, y);

  // 从旋转后的画布中裁切目标区域
  const data = ctx.getImageData(
    Math.round(x + crop.x),
    Math.round(y + crop.y),
    Math.round(crop.width),
    Math.round(crop.height)
  );

  const out = document.createElement("canvas");
  out.width = Math.round(crop.width);
  out.height = Math.round(crop.height);
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("CanvasRenderingContext2D not available");
  outCtx.putImageData(data, 0, 0);

  return out;
}

async function drawComposition(
  params: {
    backgroundUrl: string;
    userImageSrc: string;
    cropPixels: Area | null;
    rotation: number;
    outputWidth: number;
    outputHeight: number;
    exportMime: AvatarComposerProps["exportMime"];
    exportQuality: number;
    watermarkText?: string;
    backgroundOnTop?: boolean;
  }
): Promise<Blob> {
  const {
    backgroundUrl,
    userImageSrc,
    cropPixels,
    rotation,
    outputWidth,
    outputHeight,
    exportMime,
    exportQuality,
    watermarkText,
    backgroundOnTop,
  } = params;

  if (!cropPixels) throw new Error("Crop area is not ready");

  const [bgImage, croppedCanvas] = await Promise.all([
    createImage(backgroundUrl),
    getCroppedCanvas(userImageSrc, cropPixels, rotation),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CanvasRenderingContext2D not available");

  const drawBackground = () => {
    ctx.drawImage(bgImage, 0, 0, outputWidth, outputHeight);
  };
  const drawCropped = () => {
    ctx.drawImage(croppedCanvas, 0, 0, outputWidth, outputHeight);
  };

  if (backgroundOnTop) {
    drawCropped();
    drawBackground();
  } else {
    drawBackground();
    drawCropped();
  }

  if (watermarkText) {
    const padding = Math.max(8, Math.floor(outputWidth * 0.012));
    ctx.save();
    ctx.font = `${Math.floor(outputWidth * 0.032)}px ui-sans-serif, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.shadowColor = "rgba(255,255,255,0.6)";
    ctx.shadowBlur = 4;
    const metrics = ctx.measureText(watermarkText);
    const textWidth = metrics.width;
    ctx.fillText(watermarkText, outputWidth - textWidth - padding, outputHeight - padding);
    ctx.restore();
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(
      resolve,
      exportMime ?? "image/png",
      exportMime === "image/png" ? undefined : exportQuality
    )
  );
  if (!blob) throw new Error("Failed to export image blob");
  return blob;
}

export default function AvatarComposer(props: AvatarComposerProps) {
  const {
    backgroundUrl,
    outputWidth = 1024,
    outputHeight = 1024,
    maskPreview = "none",
    exportMime = "image/png",
    exportQuality = 0.92,
    watermarkText,
    backgroundOnTop = false,
    className,
    onExport,
    exportMode = "composed",
    disableDownload = false,
    exportButtonText,
  } = props;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [overlayOnTop, setOverlayOnTop] = useState<boolean>(backgroundOnTop);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const aspect = useMemo(() => outputWidth / outputHeight, [outputWidth, outputHeight]);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = await fileToObjectUrlWithExifFix(file);
    setImageSrc((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    // 重置视图
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  const handleExport = useCallback(async () => {
    if (!imageSrc) return;
    try {
      setIsExporting(true);
      let blob: Blob;
      if (exportMode === "cropped") {
        // 仅导出裁切结果
        if (!croppedPixels) throw new Error("Crop area is not ready");
        const croppedCanvas = await (async () => {
          const image = await (async () => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = imageSrc;
            });
            return img;
          })();
          // 直接使用 getCroppedCanvas 生成裁切画布
          return await getCroppedCanvas(imageSrc, croppedPixels, rotation);
        })();
        const out: Blob | null = await new Promise((resolve) =>
          croppedCanvas.toBlob(
            resolve,
            exportMime ?? "image/png",
            exportMime === "image/png" ? undefined : exportQuality
          )
        );
        if (!out) throw new Error("Failed to export cropped blob");
        blob = out;
      } else {
        // 与背景合成导出
        blob = await drawComposition({
          backgroundUrl: backgroundUrl || "",
          userImageSrc: imageSrc,
          cropPixels: croppedPixels,
          rotation,
          outputWidth,
          outputHeight,
          exportMime,
          exportQuality,
          watermarkText,
          backgroundOnTop: overlayOnTop,
        });
      }
      onExport?.(blob);
      // 可选下载
      if (!disableDownload) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = exportMime === "image/png" ? "png" : exportMime === "image/jpeg" ? "jpg" : "webp";
        a.download = `avatar-composed.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("导出失败，请重试或更换图片");
    } finally {
      setIsExporting(false);
    }
  }, [backgroundUrl, imageSrc, croppedPixels, rotation, outputWidth, outputHeight, exportMime, exportQuality, watermarkText, overlayOnTop, onExport, exportMode, disableDownload]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  const previewWrapperClass = useMemo(() => {
    if (maskPreview === "circle") return "rounded-full overflow-hidden";
    if (maskPreview === "rounded") return "rounded-xl overflow-hidden";
    return "rounded-lg overflow-hidden";
  }, [maskPreview]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <div className={`relative w-full aspect-[${"" + (0 || 1)}] bg-gray-100 ${previewWrapperClass}`} style={{ aspectRatio: `${outputWidth}/${outputHeight}` }}>
            {/* 背景图层（仅当提供 backgroundUrl 且不置顶时显示） */}
            {!overlayOnTop && backgroundUrl && (
              <img
                src={backgroundUrl}
                crossOrigin="anonymous"
                alt="background"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            )}

            {/* 裁切交互层 */}
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={outputWidth / outputHeight}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape={maskPreview === "circle" ? "round" : "rect"}
                restrictPosition={false}
                showGrid={false}
                classes={{
                  containerClassName: "!absolute !inset-0",
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                请选择一张图片进行裁切
              </div>
            )}

            {/* 背景覆盖层（仅当提供 backgroundUrl 且置顶时显示） */}
            {overlayOnTop && backgroundUrl && (
              <img
                src={backgroundUrl}
                crossOrigin="anonymous"
                alt="background overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            )}
          </div>

          {/* 文件选择 */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">缩放</label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">旋转</label>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>
          {/* 已移除：背景置顶开关与 JPEG/WebP 导出质量调节 UI */}

          {watermarkText && (
            <div className="text-xs text-gray-500">导出将自动在右下角添加水印：{watermarkText}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              重置视图
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!imageSrc || isExporting || !croppedPixels}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isExporting
                ? (exportButtonText ? `${exportButtonText}中…` : "导出中…")
                : (exportButtonText || "导出并下载")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


