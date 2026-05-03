// utils/facebookPixel.ts
type FacebookEventParams = Record<string, string | number | boolean | any[]>

// Content ID mapping for Meta Pixel tracking
export const CONTENT_ID_MAP: Record<string, string> = {
  PICBOOK_GOODNIGHT: 'night_book',
  PICBOOK_MOM: 'mama_book',
  PICBOOK_BRAVEY: 'bravery_book',
  PICBOOK_BIRTHDAY: 'birthday_book',
  PICBOOK_SANTA: 'santa_book',
  PICBOOK_MELODY: 'melody_book',
};

// Normalize spu_code (e.g., PICBOOK_GOODNIGHT3 -> PICBOOK_GOODNIGHT)
export const normalizeSpu = (spu: string): string =>
  spu === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : spu;

// Get content_id by spu_code
export const getContentIdBySpu = (spuCode: string): string | null => {
  const code = normalizeSpu(spuCode);
  return CONTENT_ID_MAP[code] || null;
};

export const fbTrack = (
  eventName: string,
  options?: FacebookEventParams
): void => {
  if (typeof window !== undefined && (window as any).fbq) {
    (window as any).fbq('track', eventName, options)
  }
}

// For custom events (non-standard Facebook events)
export const fbTrackCustom = (
  eventName: string,
  options?: FacebookEventParams
): void => {
  if (typeof window !== undefined && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, options)
  }
}

// Helper function to build content_ids and contents from cart items
export const buildCartTrackingData = (items: { spu_code: string; quantity?: number }[]) => {
  const content_ids = items.map(item => getContentIdBySpu(item.spu_code)).filter(Boolean);
  const contents = items.map(item => ({
    id: getContentIdBySpu(item.spu_code),
    quantity: item.quantity || 1
  })).filter(item => item.id);

  return { content_ids, contents };
};