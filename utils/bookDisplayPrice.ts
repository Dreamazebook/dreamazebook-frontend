function parsePrice(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return 0;
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 列表/详情主售价展示：优先 backend 的 base_price，缺省时再回退 current_price / price。
 */
export function getBookListDisplayPrice(book: any): number {
  const raw =
    book?.default_sku?.base_price ??
    book?.base_price ??
    book?.default_sku?.current_price ??
    book?.current_price ??
    book?.price ??
    0;
  return parsePrice(raw);
}

/** 划线原价：优先 market_price；没有则用 displayPrice 推算 */
export function getBookMarketComparePrice(book: any, displayPrice: number): number {
  const raw = book?.default_sku?.market_price ?? book?.market_price ?? 0;
  const n = parsePrice(raw);
  if (n > 0) return n;
  const fallback = displayPrice > 0 ? displayPrice * 1.25 : 0;
  return Number.isFinite(fallback) ? fallback : 0;
}

/**
 * 图书详情页折后单价：优先 API `final_unit_price`（及 default_sku），否则与列表逻辑一致。
 */
export function getBookDetailFinalUnitPrice(book: any): number {
  const raw =
    book?.final_unit_price ??
    book?.default_sku?.final_unit_price ??
    null;
  const fromApi = parsePrice(raw);
  if (fromApi > 0) return fromApi;
  return getBookListDisplayPrice(book);
}

/**
 * 图书详情页原价（划线）：优先 API `original_unit_price`（及 default_sku），否则 market_price 等回退。
 */
export function getBookDetailOriginalUnitPrice(book: any, finalUnitPrice: number): number {
  const raw =
    book?.original_unit_price ??
    book?.default_sku?.original_unit_price ??
    null;
  const fromApi = parsePrice(raw);
  if (fromApi > 0) return fromApi;
  return getBookMarketComparePrice(book, finalUnitPrice);
}
