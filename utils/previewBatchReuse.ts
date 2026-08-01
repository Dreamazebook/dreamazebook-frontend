const PREVIEW_REUSE_STORAGE_PREFIX = 'dreamaze:preview-reuse:';
const PREVIEW_REUSE_TTL_MS = 6 * 60 * 60 * 1000;

type PreviewReuseRecord = {
  fingerprint: string;
  batchId: string;
  savedAt: number;
};

const normalizeBookId = (bookId: string): string => String(bookId || '').trim().toUpperCase();

const getStorageKey = (bookId: string): string =>
  `${PREVIEW_REUSE_STORAGE_PREFIX}${normalizeBookId(bookId)}`;

const fallbackHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16)}`;
};

export async function createPreviewPayloadFingerprint(
  payload: Record<string, unknown>,
): Promise<string> {
  const serialized = JSON.stringify(payload);
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const bytes = new TextEncoder().encode(serialized);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Older browsers can reject SubtleCrypto; the deterministic fallback is sufficient for local reuse.
  }
  return fallbackHash(serialized);
}

export function getReusablePreviewBatchId(bookId: string, fingerprint: string): string | null {
  if (typeof window === 'undefined' || !bookId || !fingerprint) return null;
  try {
    const raw = window.sessionStorage.getItem(getStorageKey(bookId));
    if (!raw) return null;
    const record = JSON.parse(raw) as PreviewReuseRecord;
    if (
      record.fingerprint !== fingerprint ||
      !record.batchId ||
      Date.now() - Number(record.savedAt || 0) > PREVIEW_REUSE_TTL_MS
    ) {
      return null;
    }
    return record.batchId;
  } catch {
    return null;
  }
}

export function rememberReusablePreviewBatch(
  bookId: string,
  fingerprint: string,
  batchId: string,
): void {
  if (typeof window === 'undefined' || !bookId || !fingerprint || !batchId) return;
  try {
    const record: PreviewReuseRecord = {
      fingerprint,
      batchId: String(batchId),
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(getStorageKey(bookId), JSON.stringify(record));
  } catch {
    // Preview generation must still work when sessionStorage is unavailable.
  }
}
