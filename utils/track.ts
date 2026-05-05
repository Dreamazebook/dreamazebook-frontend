// utils/facebookPixel.ts
type FacebookEventParams = Record<string, string | number | boolean | any[]>

// Content ID mapping for Meta Pixel tracking
export const CONTENT_ID_MAP: Record<string, string> = {
  PICBOOK_GOODNIGHT: 'night_book',
  PICBOOK_GOODNIGHT3: 'night_book',
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

// ====================== GA4 TRACKING ======================

type GA4EventParams = Record<string, string | number | boolean | any[]>;

/**
 * Track GA4 events
 * @param eventName - GA4 event name
 * @param params - Event parameters
 */
export const gtag = (
  eventName: string,
  params?: GA4EventParams
): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

/**
 * GA4: view_item event
 * Trigger: When entering the personalize/editor page
 */
export const trackViewItem = (bookId: string, bookName: string): void => {
  gtag('view_item', {
    item_id: bookId,
    item_name: bookName,
  });
};

/**
 * GA4: add_to_cart event
 * Trigger: Last step before entering shopping cart (next → cart)
 */
export const trackAddToCart = (
  items: { item_id: string; item_name: string; price: number; quantity: number }[],
  totalPrice: number = 0
): void => {
  const price = totalPrice || (items.length > 0 ? items[0].price * items[0].quantity : 0);
  
  gtag('add_to_cart', {
    currency: 'USD',
    value: price,
    items: items,
  });
};

/**
 * GA4: begin_checkout event
 * Trigger: When clicking checkout (after login, entering checkout page)
 */
export const trackBeginCheckout = (
  items: { item_id: string; item_name: string; price: number; quantity: number }[],
  cartTotal: number
): void => {
  gtag('begin_checkout', {
    currency: 'USD',
    value: cartTotal,
    items: items,
  });
};

/**
 * GA4: add_payment_info event
 * Trigger: When clicking "Place Order" button (before payment)
 */
export const trackAddPaymentInfo = (
  items: { item_id: string; item_name: string; price: number; quantity: number }[],
  orderTotal: number
): void => {
  gtag('add_payment_info', {
    currency: 'USD',
    value: orderTotal,
    items: items,
  });
};

/**
 * GA4: purchase event
 * Trigger: On successful payment page load
 */
export const trackPurchase = (
  orderId: string,
  items: { item_id: string; item_name: string; price: number; quantity: number }[],
  orderTotal: number
): void => {
  gtag('purchase', {
    transaction_id: orderId,
    currency: 'USD',
    value: orderTotal,
    items: items,
  });
};