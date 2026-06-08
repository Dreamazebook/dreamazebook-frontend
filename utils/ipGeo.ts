export interface IpGeoInfo {
  ip: string;
  country: string;
}

let cachedIpInfo: IpGeoInfo | null = null;

/**
 * Fetch IP and country info from the internal /api/country endpoint.
 * The API route extracts client IP from x-forwarded-for / x-real-ip headers
 * (set by Netlify) and resolves the country via api.country.is.
 *
 * Results are cached in memory so subsequent calls within the same session won't re-fetch.
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

    return cachedIpInfo;
  } catch (error) {
    console.error('[ipGeo] Failed to fetch IP info:', error);
    return null;
  }
};
