'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from '@/utils/icons';
import { DreamazeFaceSwapLoadingBar } from './DreamazeFaceSwapLoadingBar';
import DreamazeLogoRainbowLoader from './DreamazeLogoRainbowLoader';
import {
  applySelectFaceSwapLogToPage,
  createFaceSwapLog,
  FACE_SWAP_RATE_LIMIT_MESSAGE,
  fetchPreviewBatch,
  getFaceSwapApiErrorMessage,
  getPreviewBatchPages,
  getSelectedFaceSwapLog,
  getInProgressFaceSwapLogs,
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
  /** false 时仅可浏览版本，不可 select / regenerate */
  mutationsEnabled?: boolean;
  /** regenerate 等写操作被拦截时回调（如非 owner 弹登录） */
  onMutationBlocked?: () => void;
  onRegenerateStarted?: () => void;
  onImageLoaded?: (pageId: number) => void;
};

/** 按后端 logs 的原始顺序（过滤 failed），末尾固定 regenerate 页 */
function buildSlides(logs: FaceSwapLog[]): VersionSlide[] {
  const ordered = (logs ?? [])
    .filter((log) => {
    if (!log) return false;
    if (log.status === 'failed') return false;
    if (log.status === 'completed') {
      return Boolean(String(log.final_image_url || '').trim());
    }
    // pending / processing
    return true;
    })
    // 后端可能按 created_at 倒序返回；前端用稳定顺序避免 regenerate 时“跳到第一页/顺序互换”
    .slice()
    .sort((a, b) => {
      const ida = typeof a.id === 'number' ? a.id : Number(a.id);
      const idb = typeof b.id === 'number' ? b.id : Number(b.id);
      if (Number.isFinite(ida) && Number.isFinite(idb)) return ida - idb;
      const ta = typeof a.created_at === 'string' ? Date.parse(a.created_at) : NaN;
      const tb = typeof b.created_at === 'string' ? Date.parse(b.created_at) : NaN;
      if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
      return 0;
    });
  return [...ordered.map((log) => ({ kind: 'log' as const, log })), { kind: 'regenerate' as const }];
}

function findInitialSlideIndex(slides: VersionSlide[]): number {
  const selectedIdx = slides.findIndex(
    (slide) => slide.kind === 'log' && slide.log.selected_at != null,
  );
  if (selectedIdx >= 0) return selectedIdx;
  const firstLogIdx = slides.findIndex((slide) => slide.kind === 'log');
  return firstLogIdx >= 0 ? firstLogIdx : 0;
}

function isLogInProgress(log: FaceSwapLog): boolean {
  return log.status === 'pending' || log.status === 'processing';
}

const navButtonClassName =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-500/80 text-white disabled:cursor-not-allowed disabled:opacity-40';

const protectedImgProps = getProtectedPreviewImageProps();
const REGEN_PROGRESS_STEP = 98 / 300;

export default function FaceSwapVersionCarousel({
  spuCode,
  batchId,
  page,
  buildImageUrl,
  onPageUpdated,
  mutationsEnabled = true,
  onMutationBlocked,
  onRegenerateStarted,
  onImageLoaded,
}: Props) {
  const t = useTranslations('Preview');
  const pageCode = String(page.page_code || '');
  const slides = useMemo(() => buildSlides(page.face_swap_logs ?? []), [page.face_swap_logs]);
  const [carouselIndex, setCarouselIndex] = useState(() => findInitialSlideIndex(slides));
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [regenerateProgress, setRegenerateProgress] = useState(() => {
    // 避免轮播首次出现时短暂显示 0%：若已处于 processing，直接从 1% 开始
    const inProgress = getInProgressFaceSwapLogs(page.face_swap_logs);
    return inProgress.some((log) => log.status === 'processing') ? 1 : 0;
  });
  const pendingLogIdRef = useRef<number | null>(null);
  const selectingLogIdRef = useRef<number | null>(null);
  const regenerateProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSelectedLogIdRef = useRef<number | null>(getSelectedFaceSwapLog(page.face_swap_logs)?.id ?? null);

  const hasInProgressLog = getInProgressFaceSwapLogs(page.face_swap_logs).length > 0;
  const isRegenerating = hasInProgressLog;

  const clearRegenerateProgressTimer = useCallback(() => {
    if (regenerateProgressTimerRef.current) {
      clearInterval(regenerateProgressTimerRef.current);
      regenerateProgressTimerRef.current = null;
    }
  }, []);

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
    const inProgress = getInProgressFaceSwapLogs(page.face_swap_logs);
    if (inProgress.length > 0 && pendingLogIdRef.current == null) {
      pendingLogIdRef.current = inProgress[inProgress.length - 1].id;
    }

    const pendingId = pendingLogIdRef.current;
    if (!pendingId) {
      clearRegenerateProgressTimer();
      setRegenerateProgress(0);
      return;
    }

    const tracked = (page.face_swap_logs ?? []).find((log) => log.id === pendingId);
    if (!tracked) return;

    if (tracked.status === 'pending') {
      setRegenerateError(null);
      clearRegenerateProgressTimer();
      setRegenerateProgress(0);
      return;
    }

    if (tracked.status === 'processing') {
      setRegenerateError(null);
      if (!regenerateProgressTimerRef.current) {
        setRegenerateProgress((prev) => (prev > 0 ? prev : 1));
        regenerateProgressTimerRef.current = setInterval(() => {
          setRegenerateProgress((prev) => {
            if (prev >= 98) return prev;
            return Math.min(98, prev + REGEN_PROGRESS_STEP);
          });
        }, 200);
      }
      return;
    }

    clearRegenerateProgressTimer();

    if (tracked.status === 'completed') {
      setRegenerateProgress(100);
      setRegenerateError(null);
      pendingLogIdRef.current = null;
      return;
    }

    if (tracked.status === 'failed') {
      setRegenerateProgress(0);
      setRegenerateError(
        tracked.error_message?.trim() || t('faceSwapRegenerateFailed'),
      );
      pendingLogIdRef.current = null;
      setCarouselIndex(slides.length - 1);
    }
  }, [clearRegenerateProgressTimer, page.face_swap_logs, slides.length, t]);

  useEffect(() => () => clearRegenerateProgressTimer(), [clearRegenerateProgressTimer]);

  const handleSelectLog = useCallback(
    async (log: FaceSwapLog) => {
      if (!mutationsEnabled) return;
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
    [mutationsEnabled, onPageUpdated, page, pageCode, spuCode, t],
  );

  useEffect(() => {
    const slide = slides[carouselIndex];
    if (!slide || slide.kind !== 'log') return;
    if (isLogInProgress(slide.log)) return;
    void handleSelectLog(slide.log);
  }, [carouselIndex, slides, handleSelectLog]);

  const handleRegenerate = useCallback(async () => {
    if (!mutationsEnabled) {
      onMutationBlocked?.();
      return;
    }
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

    const anchorIndex = carouselIndex;
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
      // 保持在点击 regenerate 的那一页；pending slide 插入当前位置，末尾新增 regenerate 页
      setCarouselIndex(anchorIndex);
    } catch (error) {
      pendingLogIdRef.current = null;
      clearRegenerateProgressTimer();
      setRegenerateProgress(0);
      if (isFaceSwapRateLimited(error)) {
        toast.error(FACE_SWAP_RATE_LIMIT_MESSAGE);
        return;
      }
      setRegenerateError(getFaceSwapApiErrorMessage(error, t('faceSwapRegenerateFailed')));
    }
  }, [
    batchId,
    carouselIndex,
    clearRegenerateProgressTimer,
    isRegenerating,
    mutationsEnabled,
    onMutationBlocked,
    onPageUpdated,
    onRegenerateStarted,
    page,
    pageCode,
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
      if (currentSlide.log.status === 'completed' && currentSlide.log.final_image_url) {
        return buildImageUrl(String(currentSlide.log.final_image_url));
      }
      return baseImageSrc;
    }
    return baseImageSrc;
  }, [baseImageSrc, buildImageUrl, currentSlide]);

  const isRegenerateSlide = currentSlide?.kind === 'regenerate';
  const isQueuedLogSlide =
    currentSlide?.kind === 'log' && currentSlide.log.status === 'pending';
  const isProcessingLogSlide =
    currentSlide?.kind === 'log' && currentSlide.log.status === 'processing';
  const totalSlides = slides.length;
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

        <div className="relative w-full max-w-5xl min-w-0">
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

            {isQueuedLogSlide && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                <DreamazeLogoRainbowLoader size={60} />
              </div>
            )}

            {isProcessingLogSlide && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                {regenerateProgress > 0 ? (
                  <DreamazeFaceSwapLoadingBar progress={regenerateProgress} />
                ) : (
                  <DreamazeLogoRainbowLoader size={60} />
                )}
              </div>
            )}

            {isRegenerateSlide && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/[0.45] backdrop-blur-[10px]">
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                  {regenerateError && (
                    <p className="max-w-xs text-sm text-white">{regenerateError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleRegenerate()}
                    className="rounded border border-black bg-[#F5F5F0] px-6 py-2 text-sm text-black md:text-lg"
                  >
                    {t('tryAnotherVersion')}
                  </button>
                  <p className="max-w-sm text-sm text-white md:text-lg">
                    {t('faceSwapSelectedVersionNotice')}
                  </p>
                </div>
              </div>
            )}

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

      <p className="flex flex-wrap items-center justify-center gap-x-1 px-4 text-center text-sm text-gray-900 sm:text-base md:text-lg">
        <span>{t('faceSwapDifferentVersionHintBefore')}</span>
        <ChevronRight className="h-5 w-5 text-[#012CCE]" aria-hidden="true" />
        <span>{t('faceSwapDifferentVersionHintAfter')}</span>
      </p>

      <div className="flex items-center justify-center gap-2">
        {slides.map((slide, index) => {
          const isActive = index === carouselIndex;
          const key =
            slide.kind === 'log'
              ? `log-${slide.log.id}-${slide.log.status}`
              : 'regenerate';
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
