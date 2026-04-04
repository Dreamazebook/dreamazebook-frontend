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
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** 划线原价：优先 market_price；没有则用 displayPrice 推算 */
export function getBookMarketComparePrice(book: any, displayPrice: number): number {
  const raw = book?.default_sku?.market_price ?? book?.market_price ?? 0;
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  const fallback = displayPrice > 0 ? displayPrice * 1.25 : 0;
  return Number.isFinite(fallback) ? fallback : 0;
}
