'use client';

const STORAGE_KEY_PREFIX = 'dreamaze_mkt_';

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export const FIRST_TOUCH_KEYS = [
  'first_referrer',
  'first_landing_url',
  'source_captured_at',
] as const;

export type UtmParams = Record<string, string | null>;

/**
 * Read all stored marketing attribution data from localStorage.
 */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  const result: UtmParams = {};
  try {
    [...UTM_KEYS, ...FIRST_TOUCH_KEYS].forEach((key) => {
      const val = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
      if (val) result[key] = val;
    });
  } catch {
    // localStorage unavailable
  }
  return result;
}

/**
 * Capture UTM params from the current URL's query string.
 * UTM values are stored (overwritten) on every visit with UTM params.
 * First-touch data (first_referrer, first_landing_url, source_captured_at)
 * is only written once — the first time the user lands on the site.
 */
export function captureUtmFromUrl(searchParams: URLSearchParams): void {
  if (typeof window === 'undefined') return;
  try {
    const storage = window.localStorage;

    // UTM params — always overwrite with latest
    let hasUtm = false;
    UTM_KEYS.forEach((key) => {
      const val = searchParams.get(key)?.trim();
      if (val) {
        storage.setItem(`${STORAGE_KEY_PREFIX}${key}`, val);
        hasUtm = true;
      }
    });

    // First-touch data — write only once (first visit)
    const firstReferrer = storage.getItem(`${STORAGE_KEY_PREFIX}first_referrer`);
    const firstLandingUrl = storage.getItem(`${STORAGE_KEY_PREFIX}first_landing_url`);

    if (!firstReferrer) {
      const referrer = document.referrer || '';
      if (referrer) {
        storage.setItem(`${STORAGE_KEY_PREFIX}first_referrer`, referrer);
      }
    }

    if (!firstLandingUrl) {
      storage.setItem(`${STORAGE_KEY_PREFIX}first_landing_url`, window.location.href);
    }

    if (!storage.getItem(`${STORAGE_KEY_PREFIX}source_captured_at`)) {
      storage.setItem(`${STORAGE_KEY_PREFIX}source_captured_at`, new Date().toISOString());
    }
  } catch {
    // localStorage unavailable
  }
}

/**
 * Build headers object from stored UTM/first-touch data for API requests.
 */
export function getUtmRequestHeaders(): Record<string, string> {
  const params = getStoredUtmParams();
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      // Convert snake_case to X-Mkt-Header-Name format
      const headerName = `X-Mkt-${key.replace(/_/g, '-')}`;
      headers[headerName] = value;
    }
  }
  return headers;
}
