const IPIFY_API_URL = 'https://geo.ipify.org/api/v2/country';

export interface IpGeoInfo {
  ip: string;
  country: string;
}

let cachedIpInfo: IpGeoInfo | null = null;

/**
 * Fetch IP and country info from ipify API.
 * Results are cached in memory so subsequent calls within the same session won't re-fetch.
 */
export const fetchIpInfo = async (): Promise<IpGeoInfo | null> => {
  if (cachedIpInfo) {
    return cachedIpInfo;
  }

  const apiKey = process.env.NEXT_PUBLIC_IPIFY_API_KEY;
  if (!apiKey) {
    console.warn('[ipGeo] NEXT_PUBLIC_IPIFY_API_KEY is not set');
    return null;
  }

  try {
    const res = await fetch(`${IPIFY_API_URL}?apiKey=${apiKey}`);
    if (!res.ok) {
      console.warn('[ipGeo] ipify API returned', res.status);
      return null;
    }

    const data = await res.json();
    cachedIpInfo = {
      ip: data.ip || '',
      country: data.location?.country || '',
    };

    return cachedIpInfo;
  } catch (error) {
    console.error('[ipGeo] Failed to fetch IP info:', error);
    return null;
  }
};
