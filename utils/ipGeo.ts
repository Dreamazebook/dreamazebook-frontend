export interface IpGeoInfo {
  ip: string;
  country: string;
}

let cachedIpInfo: IpGeoInfo | null = null;

const STORAGE_KEY_IP = 'dreamaze_ip';
const STORAGE_KEY_COUNTRY = 'dreamaze_country';

/**
 * Save IP and country to localStorage for later use in API headers.
 */
export function storeIpGeoInfo(info: IpGeoInfo): void {
  if (typeof window === 'undefined') return;
  try {
    if (info.ip) {
      window.localStorage.setItem(STORAGE_KEY_IP, info.ip);
    }
    if (info.country) {
      window.localStorage.setItem(STORAGE_KEY_COUNTRY, info.country);
    }
  } catch {
    // localStorage unavailable
  }
}

/**
 * Read stored IP and country from localStorage.
 */
export function getStoredIpGeoInfo(): Partial<IpGeoInfo> {
  if (typeof window === 'undefined') return {};
  try {
    return {
      ip: window.localStorage.getItem(STORAGE_KEY_IP) || undefined,
      country: window.localStorage.getItem(STORAGE_KEY_COUNTRY) || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Build headers object from stored IP/country for API requests.
 */
export function getIpGeoRequestHeaders(): Record<string, string> {
  const { ip, country } = getStoredIpGeoInfo();
  const headers: Record<string, string> = {};
  if (ip) headers['X-Client-Ip'] = ip;
  if (country) headers['X-Client-Country'] = country;
  return headers;
}

/**
 * Fetch IP and country info from the internal /api/country endpoint.
 * The API route extracts client IP from x-forwarded-for / x-real-ip headers
 * (set by Netlify) and resolves the country via api.country.is.
 *
 * Results are cached in memory so subsequent calls within the same session won't re-fetch.
 * Results are also persisted to localStorage for API header injection.
 */
export const fetchIpInfo = async (): Promise<IpGeoInfo | null> => {
  if (cachedIpInfo) {
    return cachedIpInfo;
  }

  try {
    const res = await fetch('/api/country');
    if (!res.ok) {
      console.warn('[ipGeo] /api/country returned', res.status);
      return null;
    }

    const json = await res.json();
    const data = json?.data || json;

    cachedIpInfo = {
      ip: data.client_ip || data.ip || '',
      country: data.country || '',
    };

    // Persist to localStorage for API header injection
    storeIpGeoInfo(cachedIpInfo);

    return cachedIpInfo;
  } catch (error) {
    console.error('[ipGeo] Failed to fetch IP info:', error);
    return null;
  }
};
