'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from '@/utils/icons';
import DreamazeLogoRainbowLoader from './DreamazeLogoRainbowLoader';
import {
  applySelectFaceSwapLogToPage,
  createFaceSwapLog,
  FACE_SWAP_RATE_LIMIT_MESSAGE,
  fetchPreviewBatch,
  getCompletedFaceSwapLogs,
  getFaceSwapApiErrorMessage,
  getPreviewBatchPages,
  getSelectedFaceSwapLog,
  isFaceSwapRateLimited,
  pickPreviewPageIdFromBatchPage,
  resolvePreviewPageId,
  selectFaceSwapLog,
  type FaceSwapLog,
  type PreviewPageWithFaceSwapLogs,
} from '@/utils/previewFaceSwapVersions';
import {
  getProtectedPreviewImageProps,
  PREVIEW_PROTECTED_IMAGE_CLASS,
} from '@/utils/previewImageProtection';

type VersionSlide =
  | { kind: 'log'; log: FaceSwapLog }
  | { kind: 'regenerate' };

type Props = {
  spuCode: string;
  batchId?: string | null;
  page: PreviewPageWithFaceSwapLogs;
  buildImageUrl: (path: string) => string;
  onPageUpdated: (pageCode: string, nextPage: PreviewPageWithFaceSwapLogs) => void;
  onRegenerateStarted?: () => void;
  onImageLoaded?: (pageId: number) => void;
};

function buildSlides(logs: FaceSwapLog[]): VersionSlide[] {
  const completed = getCompletedFaceSwapLogs(logs);
  return [...completed.map((log) => ({ kind: 'log' as const, log })), { kind: 'regenerate' as const }];
}

function findInitialSlideIndex(slides: VersionSlide[]): number {
  const selectedIdx = slides.findIndex(
    (slide) => slide.kind === 'log' && slide.log.selected_at != null,
  );
  if (selectedIdx >= 0) return selectedIdx;
  const firstLogIdx = slides.findIndex((slide) => slide.kind === 'log');
  return firstLogIdx >= 0 ? firstLogIdx : 0;
}

const navButtonClassName =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-500/80 text-white disabled:cursor-not-allowed disabled:opacity-40';

const protectedImgProps = getProtectedPreviewImageProps();

export default function FaceSwapVersionCarousel({
  spuCode,
  batchId,
  page,
  buildImageUrl,
  onPageUpdated,
  onRegenerateStarted,
  onImageLoaded,
}: Props) {
  const t = useTranslations('Preview');
  const pageCode = String(page.page_code || '');
  const slides = useMemo(() => buildSlides(page.face_swap_logs ?? []), [page.face_swap_logs]);
  const [carouselIndex, setCarouselIndex] = useState(() => findInitialSlideIndex(slides));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const pendingLogIdRef = useRef<number | null>(null);
  const selectingLogIdRef = useRef<number | null>(null);
  const lastSelectedLogIdRef = useRef<number | null>(getSelectedFaceSwapLog(page.face_swap_logs)?.id ?? null);

  useEffect(() => {
    const selected = getSelectedFaceSwapLog(page.face_swap_logs);
    if (selected?.id) {
      lastSelectedLogIdRef.current = selected.id;
    }
  }, [page.face_swap_logs]);

  useEffect(() => {
    setCarouselIndex((prev) => Math.min(prev, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    const pendingId = pendingLogIdRef.current;
    if (!pendingId) return;
    const tracked = (page.face_swap_logs ?? []).find((log) => log.id === pendingId);
    if (!tracked) return;

    if (tracked.status === 'pending' || tracked.status === 'processing') {
      setIsRegenerating(true);
      setRegenerateError(null);
      return;
    }

    if (tracked.status === 'completed') {
      setIsRegenerating(false);
      setRegenerateError(null);
      pendingLogIdRef.current = null;
      const nextSlides = buildSlides(page.face_swap_logs ?? []);
      const newLogIdx = nextSlides.findIndex(
        (slide) => slide.kind === 'log' && slide.log.id === tracked.id,
      );
      if (newLogIdx >= 0) {
        setCarouselIndex(newLogIdx);
      }
      return;
    }

    if (tracked.status === 'failed') {
      setIsRegenerating(false);
      setRegenerateError(
        tracked.error_message?.trim() || t('faceSwapRegenerateFailed'),
      );
      pendingLogIdRef.current = null;
    }
  }, [page.face_swap_logs, t]);

  const handleSelectLog = useCallback(
    async (log: FaceSwapLog) => {
      if (log.status !== 'completed' || !log.final_image_url) return;
      if (lastSelectedLogIdRef.current === log.id) return;
      if (selectingLogIdRef.current === log.id) return;

      selectingLogIdRef.current = log.id;
      try {
        const res = await selectFaceSwapLog(spuCode, log.id);
        const payload = res?.data;
        if (!payload?.face_swap_log) return;
        lastSelectedLogIdRef.current = log.id;
        onPageUpdated(pageCode, applySelectFaceSwapLogToPage(page, payload));
      } catch (error) {
        toast.error(getFaceSwapApiErrorMessage(error, t('faceSwapSelectFailed')));
      } finally {
        selectingLogIdRef.current = null;
      }
    },
    [onPageUpdated, page, pageCode, spuCode, t],
  );

  useEffect(() => {
    const slide = slides[carouselIndex];
    if (!slide || slide.kind !== 'log') return;
    void handleSelectLog(slide.log);
  }, [carouselIndex, slides, handleSelectLog]);

  const handleRegenerate = useCallback(async () => {
    if (!spuCode) {
      toast.error(t('faceSwapMissingPageId'));
      return;
    }

    let previewPageId = resolvePreviewPageId(page);
    if (!previewPageId && batchId) {
      try {
        const res = await fetchPreviewBatch(spuCode, batchId);
        const pages = getPreviewBatchPages(res);
        const match = pages.find(
          (bp: { page_code?: string }) => String(bp.page_code || '') === pageCode,
        );
        previewPageId = pickPreviewPageIdFromBatchPage(match);
        if (previewPageId) {
          onPageUpdated(pageCode, { ...page, preview_page_id: previewPageId });
        }
      } catch {
        // fall through to toast below
      }
    }

    if (!previewPageId) {
      toast.error(t('faceSwapMissingPageId'));
      return;
    }
    if (isRegenerating) return;

    setIsRegenerating(true);
    setRegenerateError(null);
    onRegenerateStarted?.();

    try {
      const res = await createFaceSwapLog(spuCode, previewPageId);
      const newLog = res?.data?.face_swap_log;
      if (!newLog?.id) {
        throw new Error(t('faceSwapRegenerateFailed'));
      }
      pendingLogIdRef.current = newLog.id;
      const mergedLogs = [...(page.face_swap_logs ?? []), newLog];
      onPageUpdated(pageCode, { ...page, face_swap_logs: mergedLogs });
      setCarouselIndex(slides.length - 1);
    } catch (error) {
      setIsRegenerating(false);
      pendingLogIdRef.current = null;
      if (isFaceSwapRateLimited(error)) {
        toast.error(FACE_SWAP_RATE_LIMIT_MESSAGE);
        return;
      }
      setRegenerateError(getFaceSwapApiErrorMessage(error, t('faceSwapRegenerateFailed')));
    }
  }, [
    batchId,
    isRegenerating,
    onPageUpdated,
    onRegenerateStarted,
    page,
    pageCode,
    slides.length,
    spuCode,
    t,
  ]);

  const goPrev = () => setCarouselIndex((prev) => Math.max(prev - 1, 0));
  const goNext = () => setCarouselIndex((prev) => Math.min(prev + 1, slides.length - 1));

  const currentSlide = slides[carouselIndex];
  const baseImageRaw = String(page.base_image_url || page.image_url || '');
  const baseImageSrc = buildImageUrl(baseImageRaw);

  const displayImageSrc = useMemo(() => {
    if (!currentSlide) return baseImageSrc;
    if (currentSlide.kind === 'log') {
      return buildImageUrl(String(currentSlide.log.final_image_url || ''));
    }
    return baseImageSrc;
  }, [baseImageSrc, buildImageUrl, currentSlide]);

  const isRegenerateSlide = currentSlide?.kind === 'regenerate';
  const totalSlides = slides.length;
  const counterLabel = `${carouselIndex + 1}/${totalSlides}`;
  const prevDisabled = carouselIndex <= 0 || isRegenerating;
  const nextDisabled = carouselIndex >= totalSlides - 1 || isRegenerating;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-center md:gap-6">
        <button
          type="button"
          aria-label={t('faceSwapPreviousVersion')}
          disabled={prevDisabled}
          onClick={goPrev}
          className={`${navButtonClassName} hidden md:flex`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-5xl min-w-0 px-3 md:px-0">
          <div className="relative w-full rounded-lg bg-white">
            <img
              src={displayImageSrc}
              alt={`Page ${page.page_number}`}
              width={1600}
              height={600}
              className={`${PREVIEW_PROTECTED_IMAGE_CLASS} block w-full h-auto rounded-lg object-cover`}
              style={{ WebkitTouchCallout: 'none' }}
              onLoad={() => onImageLoaded?.(page.page_id)}
              {...protectedImgProps}
            />

            {isRegenerateSlide && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                {isRegenerating ? (
                  <DreamazeLogoRainbowLoader size={60} />
                ) : regenerateError ? (
                  <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <p className="max-w-xs text-sm text-gray-800">{regenerateError}</p>
                    <button
                      type="button"
                      onClick={() => void handleRegenerate()}
                      className="rounded border border-black bg-[#F5F5F0] px-6 py-2 text-sm text-black"
                    >
                      {t('tryAnotherVersion')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleRegenerate()}
                    className="rounded border border-black bg-[#F5F5F0] px-6 py-2 text-sm text-black"
                  >
                    {t('tryAnotherVersion')}
                  </button>
                )}
              </div>
            )}

            <div className="absolute top-3 right-3 z-20 rounded bg-white/80 px-2 py-0.5 text-xs text-gray-800">
              {counterLabel}
            </div>

            <button
              type="button"
              aria-label={t('faceSwapPreviousVersion')}
              disabled={prevDisabled}
              onClick={goPrev}
              className={`${navButtonClassName} absolute left-0 top-1/2 z-20 -translate-y-1/2 md:hidden`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label={t('faceSwapNextVersion')}
              disabled={nextDisabled}
              onClick={goNext}
              className={`${navButtonClassName} absolute right-0 top-1/2 z-20 -translate-y-1/2 md:hidden`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={t('faceSwapNextVersion')}
          disabled={nextDisabled}
          onClick={goNext}
          className={`${navButtonClassName} hidden md:flex`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {slides.map((slide, index) => {
          const isActive = index === carouselIndex;
          const key = slide.kind === 'log' ? `log-${slide.log.id}` : 'regenerate';
          return (
            <span
              key={key}
              className={`h-2 w-2 rounded-full transition-colors ${
                isActive ? 'bg-[#012CCE]' : 'bg-gray-300'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
