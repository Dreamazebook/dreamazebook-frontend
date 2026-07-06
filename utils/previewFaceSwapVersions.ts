import api from '@/utils/api';
import type { ApiResponse } from '@/types/api';

export type FaceSwapLogStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FaceSwapLog {
  id: number;
  preview_page_id: number;
  batch_id?: string;
  page_code: string;
  prompt_variant?: 'A' | 'B' | string;
  status: FaceSwapLogStatus;
  task_id?: string | null;
  final_image_path?: string | null;
  final_image_url?: string | null;
  error_message?: string | null;
  processing_time?: number | null;
  selected_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PreviewPageWithFaceSwapLogs {
  page_id: number;
  page_code?: string;
  page_number: number;
  preview_page_id?: number;
  image_url?: string;
  final_image_url?: string | null;
  base_image_url?: string | null;
  has_face_swap?: boolean;
  face_swap_logs?: FaceSwapLog[];
  status?: string;
  [key: string]: unknown;
}

/** 实际接口: data.batch.pages；OpenAPI 文档: data.pages；兼容 data.preview.pages */
export function unwrapPreviewBatch(res: ApiResponse<any> | null | undefined): any | null {
  const data = res?.data;
  if (!data) return null;
  if (data.batch && typeof data.batch === 'object') return data.batch;
  if (Array.isArray(data.pages) || data.batch_id) return data;
  if (data.preview && typeof data.preview === 'object') return data.preview;
  return data;
}

/** 从 batch 详情响应中提取 pages 数组 */
export function getPreviewBatchPages(res: ApiResponse<any> | null | undefined): any[] {
  const data = res?.data;
  if (!data) return [];
  if (Array.isArray(data.batch?.pages)) return data.batch.pages;
  if (Array.isArray(data.pages)) return data.pages;
  if (Array.isArray(data.preview?.pages)) return data.preview.pages;
  const batch = unwrapPreviewBatch(res);
  return Array.isArray(batch?.pages) ? batch.pages : [];
}

function pickFirstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeBatchPageCodeKey(pageCode: unknown): string {
  return String(pageCode || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/^p(\d+)-p(\d+)$/, 'p$1-$2');
}

/** order_pages 与 pages 合并：换脸数据以 pages 为准，图片字段互相补齐 */
function mergeBatchPageRecords(orderPage: any, previewPage: any): any {
  const imageUrl = pickFirstNonEmptyString(
    previewPage?.final_image_url,
    previewPage?.base_image_url,
    previewPage?.image_url,
    previewPage?.composite_image_url,
    previewPage?.preview_image,
    previewPage?.base_stage_url,
    previewPage?.final_stage_url,
    previewPage?.template_image_url,
    previewPage?.template_url,
    orderPage?.final_image_url,
    orderPage?.base_image_url,
    orderPage?.image_url,
    orderPage?.composite_image_url,
    orderPage?.preview_image,
    orderPage?.base_stage_url,
    orderPage?.final_stage_url,
    orderPage?.template_image_url,
    orderPage?.template_url,
  );
  const baseImageUrl = pickFirstNonEmptyString(
    previewPage?.base_image_url,
    previewPage?.base_stage_url,
    previewPage?.image_url,
    previewPage?.preview_image,
    orderPage?.base_image_url,
    orderPage?.base_stage_url,
    orderPage?.image_url,
    orderPage?.preview_image,
  );
  const finalImageUrl = pickFirstNonEmptyString(
    previewPage?.final_image_url,
    previewPage?.composite_image_url,
    orderPage?.final_image_url,
    orderPage?.composite_image_url,
    imageUrl,
  );
  const compositeImageUrl = pickFirstNonEmptyString(
    previewPage?.composite_image_url,
    orderPage?.composite_image_url,
  );

  return {
    ...orderPage,
    ...previewPage,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(baseImageUrl ? { base_image_url: baseImageUrl } : {}),
    ...(finalImageUrl ? { final_image_url: finalImageUrl } : {}),
    ...(compositeImageUrl ? { composite_image_url: compositeImageUrl } : {}),
    face_swap_logs:
      Array.isArray(previewPage?.face_swap_logs) && previewPage.face_swap_logs.length
        ? previewPage.face_swap_logs
        : orderPage?.face_swap_logs,
    has_face_elements: previewPage?.has_face_elements ?? orderPage?.has_face_elements,
  };
}

/** 从 batch page 原始记录中选取可展示的图片 URL（含 order_pages 的 preview_image 等字段） */
export function pickBatchPageImageRaw(bp: Record<string, unknown> | null | undefined): string {
  return (
    pickFirstNonEmptyString(
      bp?.composite_image_url,
      bp?.final_image_url,
      bp?.base_image_url,
      bp?.image_url,
      bp?.preview_image,
      bp?.base_stage_url,
      bp?.final_stage_url,
      bp?.template_image_url,
      bp?.template_url,
    ) || ''
  );
}

/**
 * 展示用 pages：游客只看 preview pages；登录后合并 order_pages 显示整本书。
 * 同 page_code 时 preview pages 优先（保留换脸/face_swap_logs），图片字段互相补齐。
 */
export function getBatchDisplayPages(
  batch: any,
  options?: { includeFullBook?: boolean },
): any[] {
  const previewPages = Array.isArray(batch?.pages) ? batch.pages : [];
  if (!options?.includeFullBook) return previewPages;

  const orderPages = Array.isArray(batch?.order_pages) ? batch.order_pages : [];
  if (!orderPages.length) return previewPages;

  const merged = new Map<string, any>();
  for (const page of orderPages) {
    const code = normalizeBatchPageCodeKey(page?.page_code);
    if (code) merged.set(code, page);
  }
  for (const page of previewPages) {
    const code = normalizeBatchPageCodeKey(page?.page_code);
    if (!code) continue;
    const existing = merged.get(code);
    merged.set(code, existing ? mergeBatchPageRecords(existing, page) : page);
  }

  return Array.from(merged.values()).sort((a, b) => {
    const sortA = a?.sort_order != null ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
    const sortB = b?.sort_order != null ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
    if (sortA !== sortB) return sortA - sortB;
    return String(a?.page_code || '').localeCompare(String(b?.page_code || ''));
  });
}

function parsePositiveId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function pickPreviewPageIdFromFaceSwapLogs(
  logs: FaceSwapLog[] | undefined | null,
): number | undefined {
  if (!logs?.length) return undefined;
  const selected = logs.find((log) => log.selected_at != null);
  const candidates = selected ? [selected, ...logs] : logs;
  for (const log of candidates) {
    const parsed = parsePositiveId(log?.preview_page_id);
    if (parsed) return parsed;
  }
  return undefined;
}

/**
 * 从 batch page 解析 preview_page_id。
 * 实际接口里 page 顶层通常没有该字段，ID 在 face_swap_logs[].preview_page_id。
 */
export function pickPreviewPageIdFromBatchPage(
  bp: Record<string, unknown> | null | undefined,
): number | undefined {
  if (!bp) return undefined;

  const fromLogs = pickPreviewPageIdFromFaceSwapLogs(
    Array.isArray(bp.face_swap_logs) ? (bp.face_swap_logs as FaceSwapLog[]) : [],
  );
  if (fromLogs) return fromLogs;

  return parsePositiveId(bp.preview_page_id);
}

export function resolvePreviewPageId(
  page: PreviewPageWithFaceSwapLogs | Record<string, unknown> | null | undefined,
): number | undefined {
  if (!page) return undefined;

  const fromLogs = pickPreviewPageIdFromFaceSwapLogs(
    Array.isArray(page.face_swap_logs) ? (page.face_swap_logs as FaceSwapLog[]) : [],
  );
  if (fromLogs) return fromLogs;

  return parsePositiveId(page.preview_page_id);
}

export function getCompletedFaceSwapLogs(logs: FaceSwapLog[] | undefined | null): FaceSwapLog[] {
  return (logs ?? []).filter(
    (log) => log.status === 'completed' && Boolean(String(log.final_image_url || '').trim()),
  );
}

export function getInProgressFaceSwapLogs(logs: FaceSwapLog[] | undefined | null): FaceSwapLog[] {
  return (logs ?? []).filter(
    (log) => log.status === 'pending' || log.status === 'processing',
  );
}

export function getSelectedFaceSwapLog(logs: FaceSwapLog[] | undefined | null): FaceSwapLog | undefined {
  return (logs ?? []).find((log) => log.selected_at != null);
}

export function mapBatchPageToPreviewPage(bp: any, idx: number): PreviewPageWithFaceSwapLogs {
  const displayImageRaw = pickBatchPageImageRaw(bp);
  const baseImageUrl = pickFirstNonEmptyString(
    bp?.base_image_url,
    bp?.base_stage_url,
    bp?.image_url,
    bp?.preview_image,
  );
  const finalImageUrl = pickFirstNonEmptyString(
    bp?.final_image_url,
    bp?.composite_image_url,
    displayImageRaw,
  );
  return {
    page_id: idx + 1,
    page_code: bp.page_code,
    preview_page_id: pickPreviewPageIdFromBatchPage(bp),
    page_number: bp.sort_order != null ? Number(bp.sort_order) + 1 : idx + 1,
    raw_image_url: pickFirstNonEmptyString(bp?.image_url, bp?.preview_image, bp?.base_image_url) ?? bp.image_url,
    base_stage_url: bp.base_stage_url,
    final_stage_url: bp.final_stage_url,
    giver_data: bp.giver_data,
    template_image_url: bp.template_image_url || bp.template_url,
    image_url: displayImageRaw,
    has_face_swap: !!bp.has_face_elements,
    status: bp.status,
    base_image_url: baseImageUrl,
    final_image_url: finalImageUrl,
    composite_image_url: bp.composite_image_url,
    base_only: bp.base_only,
    queue_position: bp.queue_position,
    queue_total: bp.queue_total,
    page_type: bp.page_type,
    face_swap_logs: Array.isArray(bp.face_swap_logs) ? bp.face_swap_logs : [],
    low_res_image_url: bp.low_res_image_url,
    low_res_url: bp.low_res_url,
  };
}

export function mergeBatchPagesIntoPreviewData(
  prev: any,
  batch: any,
  options?: {
    isCoverPage?: (p: { page_code?: string; page_type?: string }) => boolean;
    localP34Composed?: string | null;
    isP34PageCode?: (code: unknown) => boolean;
    includeFullBook?: boolean;
  },
): any {
  const pages = getBatchDisplayPages(batch, {
    includeFullBook: options?.includeFullBook,
  });
  if (!Array.isArray(pages) || pages.length === 0) return prev;

  const nextPreviewData = pages.map((bp: any, idx: number) => {
    const useLocalP34 =
      Boolean(options?.localP34Composed && options?.isP34PageCode?.(bp.page_code));
    const mapped = mapBatchPageToPreviewPage(bp, idx);
    if (options?.isCoverPage?.(bp)) {
      (mapped as any).is_cover = true;
    }
    if (useLocalP34 && options?.localP34Composed) {
      return {
        ...mapped,
        image_url: options.localP34Composed,
        final_image_url: options.localP34Composed,
      };
    }
    return mapped;
  });

  return {
    ...(prev || {}),
    preview_data: nextPreviewData,
    status: batch.status || prev?.status || 'processing',
    batch_id: batch.batch_id,
    queue_info: batch.queue,
    batch_options: batch.options ?? prev?.batch_options ?? null,
  };
}

export async function fetchPreviewBatch(spuCode: string, batchId: string) {
  return api.get(`/products/${spuCode}/preview/batches/${batchId}`) as Promise<ApiResponse<any>>;
}

export async function createFaceSwapLog(spuCode: string, previewPageId: number) {
  return api.post(
    `/products/${spuCode}/preview/pages/${previewPageId}/face-swap-logs`,
    {},
  ) as Promise<ApiResponse<{ face_swap_log: FaceSwapLog; select_on_complete?: boolean; queue?: Record<string, number> }>>;
}

export async function selectFaceSwapLog(spuCode: string, logId: number) {
  return api.post(
    `/products/${spuCode}/preview/face-swap-logs/${logId}/select`,
    {},
  ) as Promise<
    ApiResponse<{
      preview_page_id: number;
      page_code: string;
      final_image_url: string | null;
      face_swap_log: FaceSwapLog;
    }>
  >;
}

export function applySelectFaceSwapLogToPage(
  page: PreviewPageWithFaceSwapLogs,
  payload: {
    final_image_url: string | null;
    face_swap_log: FaceSwapLog;
  },
): PreviewPageWithFaceSwapLogs {
  const selectedId = payload.face_swap_log.id;
  const logs = (page.face_swap_logs ?? []).map((log) => ({
    ...log,
    selected_at: log.id === selectedId ? payload.face_swap_log.selected_at : null,
  }));
  return {
    ...page,
    image_url: payload.final_image_url ?? page.image_url,
    final_image_url: payload.final_image_url ?? page.final_image_url,
    face_swap_logs: logs,
  };
}

export const FACE_SWAP_RATE_LIMIT_MESSAGE =
  'Generation is taking a little longer. Please try again later.';

export function getFaceSwapApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { status?: number; data?: { message?: string } } };
  const message = err?.response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  return fallback;
}

export function isFaceSwapRateLimited(error: unknown): boolean {
  const err = error as { response?: { status?: number; data?: { message?: string } } };
  return (
    err?.response?.status === 429 ||
    err?.response?.data?.message === FACE_SWAP_RATE_LIMIT_MESSAGE
  );
}

export function batchHasPendingFaceSwapLogs(batch: any): boolean {
  const pages = batch?.pages;
  if (!Array.isArray(pages)) return false;
  return pages.some((page) =>
    (page.face_swap_logs ?? []).some(
      (log: FaceSwapLog) => log.status === 'pending' || log.status === 'processing',
    ),
  );
}
